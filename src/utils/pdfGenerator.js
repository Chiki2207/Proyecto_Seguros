import jsPDF from 'jspdf';

/**
 * Normaliza la URL de media
 */
const normalizeMediaUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (!url.startsWith('/')) return `/${url}`;
  return url.replace(/^\/uploads\//, '/media/');
};

/**
 * Carga una imagen y la convierte a base64
 */
const loadImageAsBase64 = async (url) => {
  try {
    const normalizedUrl = normalizeMediaUrl(url);
    if (!normalizedUrl) return null;
    
    const fullUrl = normalizedUrl.startsWith('http') 
      ? normalizedUrl 
      : `${window.location.origin}${normalizedUrl}`;
    
    console.log('📸 Cargando:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
    });
    
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}`);
      return null;
    }
    
    const blob = await response.blob();
    if (!blob || blob.size === 0 || !blob.type.startsWith('image/')) {
      return null;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && reader.result.startsWith('data:')) {
          console.log('✅ Cargada');
          resolve(reader.result);
        } else {
          reject(new Error('Resultado inválido'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
};

/**
 * Agrega imagen al PDF
 */
const addImageToPDF = async (doc, imageUrl, x, y, maxWidth, maxHeight) => {
  try {
    const base64 = await loadImageAsBase64(imageUrl);
    if (!base64) {
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('[Sin imagen]', x, y + 3);
      return 5;
    }

    const format = base64.includes('data:image/png') ? 'PNG' : 'JPEG';
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
          const w = img.width * ratio;
          const h = img.height * ratio;
          doc.addImage(base64, format, x, y, w, h);
          console.log(`✅ Imagen: ${w.toFixed(1)}mm x ${h.toFixed(1)}mm`);
          resolve(h);
        } catch (error) {
          doc.setFontSize(7);
          doc.setTextColor(200, 0, 0);
          doc.text('[Error]', x, y + 3);
          resolve(5);
        }
      };
      img.onerror = () => {
        doc.setFontSize(7);
        doc.setTextColor(200, 0, 0);
        doc.text('[Error]', x, y + 3);
        resolve(5);
      };
      img.src = base64;
    });
  } catch (error) {
    doc.setFontSize(7);
    doc.setTextColor(200, 0, 0);
    doc.text('[Error]', x, y + 3);
    return 5;
  }
};

/**
 * Genera PDF del reporte
 */
export const generateReportPDF = async (report, history = [], media = []) => {
  console.log('📄 ========== GENERANDO PDF ==========');
  console.log('Media total:', media?.length || 0);
  console.log('Historial:', history?.length || 0);
  console.log('Media array completo:', media);
  
  if (!report) throw new Error('No hay datos del reporte');
  
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;
  const margin = 12;
  const width = pageWidth - 2 * margin;

  const newPage = (h) => {
    if (y + h > pageHeight - 20) {
      doc.addPage();
      y = 15;
    }
  };

  // Header
  doc.setFillColor(255, 214, 0);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE SERVICIO', pageWidth / 2, 13, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('TODO AK', pageWidth / 2, 19, { align: 'center' });
  doc.setDrawColor(255, 179, 0);
  doc.setLineWidth(0.3);
  doc.line(margin, 23, pageWidth - margin, 23);
  y = 32;

  // Información del reporte
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(margin, y, width, 40, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 179, 0);
  doc.text('INFORMACIÓN DEL REPORTE', margin + 2, y + 4);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Estado:', margin + 3, y);
  const estadoColor = report.estado === 'TERMINADO' ? [76, 175, 80] : [255, 152, 0];
  doc.setFillColor(...estadoColor);
  doc.roundedRect(margin + 20, y - 3, 22, 5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(report.estado || 'N/A', margin + 21, y);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', margin + 3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(report.client?.name || 'N/A', margin + 22, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Creado por:', margin + 3, y);
  doc.setFont('helvetica', 'normal');
  doc.text(report.createdByUser?.fullName || report.createdByUser?.username || 'N/A', margin + 27, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', margin + 3, y);
  doc.setFont('helvetica', 'normal');
  const fecha = report.createdAt 
    ? new Date(report.createdAt).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'N/A';
  doc.text(fecha, margin + 22, y);
  y += 5;

  if (report.technicians && report.technicians.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Técnicos:', margin + 3, y);
    y += 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    report.technicians.forEach((tech) => {
      newPage(3);
      doc.text(`  • ${tech.fullName}`, margin + 5, y);
      y += 3;
    });
    doc.setFontSize(9);
  }
  y += 4;

  // Detalles técnicos
  newPage(20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 179, 0);
  doc.text('DETALLES TÉCNICOS', margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  if (report.diagnosticoInicial) {
    newPage(12);
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(margin, y, width, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnóstico:', margin + 2, y + 3);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.splitTextToSize(report.diagnosticoInicial, width - 6).forEach((line) => {
      newPage(3);
      doc.text(line, margin + 3, y);
      y += 3;
    });
    y += 1;
  }

  if (report.causa) {
    newPage(12);
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(margin, y, width, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Causa:', margin + 2, y + 3);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.splitTextToSize(report.causa, width - 6).forEach((line) => {
      newPage(3);
      doc.text(line, margin + 3, y);
      y += 3;
    });
    y += 1;
  }

  if (report.acciones) {
    newPage(12);
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(margin, y, width, 11, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Acciones:', margin + 2, y + 3);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.splitTextToSize(report.acciones, width - 6).forEach((line) => {
      newPage(3);
      doc.text(line, margin + 3, y);
      y += 3;
    });
    y += 1;
  }

  // Materiales
  if (report.materialsUsed && report.materialsUsed.length > 0) {
    newPage(15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 179, 0);
    doc.text('MATERIALES USADOS', margin, y);
    y += 4;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    report.materialsUsed.forEach((m) => {
      newPage(6);
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(margin, y - 2, width, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${m.name}`, margin + 2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cantidad: ${m.quantity} - $${(m.totalCost || 0).toLocaleString('es-ES')}`, margin + 2, y + 3);
      y += 6;
    });
    y += 1;
  }

  // Servicios
  if (report.servicesBilled && report.servicesBilled.length > 0) {
    newPage(15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 179, 0);
    doc.text('SERVICIOS FACTURADOS', margin, y);
    y += 4;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado: ${report.billedStatus || 'N/A'}`, margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    report.servicesBilled.forEach((s) => {
      newPage(4);
      doc.setFillColor(255, 248, 225);
      doc.roundedRect(margin, y - 2, width, 4, 1, 1, 'F');
      doc.text(`• Cantidad: ${s.quantity} - $${(s.subtotal || 0).toLocaleString('es-ES')}`, margin + 2, y);
      y += 4;
    });
    y += 1;
  }

  // Historial - PROCESAR TODAS LAS IMÁGENES SIN FILTRAR
  newPage(15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 179, 0);
  doc.text('HISTORIAL COMPLETO', margin, y);
  y += 5;

  // Crear mapa de media por ID
  const mediaMap = new Map();
  if (media && Array.isArray(media)) {
    media.forEach((item) => {
      if (item && item._id) {
        const id = item._id.toString ? item._id.toString() : String(item._id);
        mediaMap.set(id, item);
        console.log(`📦 Media agregado al mapa: ${id} - ${item.type} - ${item.url || 'sin URL'}`);
      }
    });
  }
  console.log(`📦 Total media en mapa: ${mediaMap.size}`);

  // Items del timeline - INCLUIR TODO
  const items = [];
  
  // 1. Agregar historial
  if (history && Array.isArray(history)) {
    history.forEach((entry) => {
      items.push({ type: 'history', date: new Date(entry.createdAt), data: entry });
    });
  }
  
  // 2. Agregar TODAS las fotos de media (sin filtrar por historial)
  if (media && Array.isArray(media)) {
    media.forEach((item) => {
      if (item && item.type === 'FOTO' && item.url) {
        items.push({ 
          type: 'media', 
          date: new Date(item.createdAt || new Date()), 
          data: item 
        });
        console.log(`📷 Foto agregada: ${item.url}`);
      }
    });
  }

  // Ordenar por fecha
  items.sort((a, b) => a.date - b.date);
  console.log(`📋 Total items a procesar: ${items.length}`);

  if (items.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('No hay historial disponible', margin + 2, y);
  } else {
    for (const item of items) {
      newPage(20);
      const startY = y - 1;
      let h = 7;
      
      // Fecha
      const dateStr = item.date.toLocaleString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      doc.text(dateStr, margin + 1, y);
      y += 3;
      h += 3;

      if (item.type === 'history') {
        let userName = 'Desconocido';
        if (item.data.user) {
          userName = item.data.user.fullName || item.data.user.username || 'Desconocido';
        } else if (typeof item.data.userId === 'object' && item.data.userId) {
          userName = item.data.userId.fullName || item.data.userId.username || 'Desconocido';
        }
        
        const typeLabel = item.data.type === 'CAMBIO_ESTADO' 
          ? 'Cambio de Estado'
          : item.data.type === 'ACTUALIZACION_TECNICO'
          ? 'Actualización de Técnico'
          : 'Nota Administrativa';
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(typeLabel, margin + 1, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(`por ${userName}`, margin + 1, y + 2);
        y += 4;
        h += 4;

        if (item.data.oldStatus && item.data.newStatus) {
          doc.setTextColor(0, 0, 0);
          doc.text(`Estado: ${item.data.oldStatus} → ${item.data.newStatus}`, margin + 3, y);
          y += 3;
          h += 3;
        }

        if (item.data.comment) {
          doc.setTextColor(0, 0, 0);
          doc.splitTextToSize(item.data.comment, width - 6).forEach((line) => {
            newPage(3);
            doc.text(line, margin + 3, y);
            y += 3;
            h += 3;
          });
        }

        // Buscar media asociado
        let mediaItem = item.data.associatedMedia;
        if (!mediaItem && item.data.mediaId) {
          const mediaIdStr = typeof item.data.mediaId === 'object' 
            ? (item.data.mediaId._id?.toString() || item.data.mediaId.toString())
            : item.data.mediaId.toString();
          mediaItem = mediaMap.get(mediaIdStr);
        }
        
        if (mediaItem && mediaItem.url && mediaItem.type === 'FOTO') {
          console.log('🖼️ Foto en historial:', mediaItem.url);
          newPage(45);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(7);
          doc.text('Evidencia: Foto', margin + 3, y);
          y += 3;
          h += 3;
          const imgH = await addImageToPDF(doc, mediaItem.url, margin + 3, y, width - 6, 40);
          y += imgH + 2;
          h += imgH + 2;
        }

        if (mediaItem && mediaItem.transcripcion) {
          newPage(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(7);
          doc.text('Transcripción:', margin + 3, y);
          y += 2;
          doc.splitTextToSize(mediaItem.transcripcion, width - 8).forEach((line) => {
            newPage(2);
            doc.text(line, margin + 5, y);
            y += 2;
            h += 2;
          });
        }
      } else {
        // Media sin historial - PROCESAR TODAS LAS FOTOS
        let userName = 'Desconocido';
        if (item.data.uploadedByUser) {
          userName = item.data.uploadedByUser.fullName || item.data.uploadedByUser.username || 'Desconocido';
        } else if (typeof item.data.uploadedBy === 'object' && item.data.uploadedBy) {
          userName = item.data.uploadedBy.fullName || item.data.uploadedBy.username || 'Desconocido';
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text('Foto subida', margin + 1, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(`por ${userName}`, margin + 1, y + 2);
        y += 4;
        h += 4;

        if (item.data.url && item.data.type === 'FOTO') {
          console.log('🖼️ Procesando foto sin historial:', item.data.url);
          newPage(45);
          const imgH = await addImageToPDF(doc, item.data.url, margin + 3, y, width - 6, 40);
          y += imgH + 2;
          h += imgH + 2;
        }

        if (item.data.transcripcion) {
          newPage(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(7);
          doc.text('Transcripción:', margin + 3, y);
          y += 2;
          doc.splitTextToSize(item.data.transcripcion, width - 8).forEach((line) => {
            newPage(2);
            doc.text(line, margin + 5, y);
            y += 2;
            h += 2;
          });
        }
      }

      // Fondo
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, startY, width, h, 1, 1, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, startY, width, h, 1, 1);

      y += 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 1;
    }
  }

  // Pie de página
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(255, 248, 225);
    doc.rect(0, pageHeight - 7, pageWidth, 7, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${totalPages}`, margin, pageHeight - 3);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, pageWidth - margin - 30, pageHeight - 3);
  }

  const fileName = `Reporte_${report._id || 'N/A'}_${new Date().toISOString().split('T')[0]}.pdf`;
  console.log('✅ PDF generado:', fileName);
  doc.save(fileName);
};
