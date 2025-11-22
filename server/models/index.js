// Modelos/Tipos para las colecciones de MongoDB

/**
 * @typedef {Object} User
 * @property {string} fullName
 * @property {string} documentType - "CC", "CE", "NIT", etc.
 * @property {string} documentNumber
 * @property {string} username
 * @property {string} passwordHash - hash bcrypt
 * @property {"ADMIN" | "TECNICO"} role
 * @property {boolean} active
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Client
 * @property {"ASEGURADORA" | "PERSONA"} type
 * @property {string} name
 * @property {string} [codigoAsistencia] - solo si type === "ASEGURADORA"
 * @property {string} codigoInterno
 * @property {string} contacto - teléfono/correo
 * @property {string} direccion
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Service
 * @property {string} name
 * @property {string} description
 * @property {string} category
 * @property {boolean} active
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} PriceListItem
 * @property {import('mongodb').ObjectId} clientId
 * @property {import('mongodb').ObjectId} serviceId
 * @property {string} serviceName - denormalizado para búsqueda rápida
 * @property {string} description
 * @property {number} price
 * @property {string} accessories
 * @property {string} notes
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} MaterialUsed
 * @property {string} name
 * @property {number} quantity
 * @property {number} unitCost
 * @property {number} totalCost
 */

/**
 * @typedef {Object} ServiceBilled
 * @property {import('mongodb').ObjectId} priceItemId
 * @property {number} quantity
 * @property {number} subtotal
 */

/**
 * @typedef {Object} Report
 * @property {import('mongodb').ObjectId} clientId
 * @property {import('mongodb').ObjectId} createdBy
 * @property {import('mongodb').ObjectId[]} technicianIds
 * @property {string} diagnosticoInicial
 * @property {string} causa
 * @property {string} acciones
 * @property {"PENDIENTE" | "TERMINADO"} estado
 * @property {MaterialUsed[]} materialsUsed
 * @property {ServiceBilled[]} servicesBilled
 * @property {"FACTURADO" | "NO_FACTURADO" | "PENDIENTE"} billedStatus
 * @property {number} valor - Valor del reporte (-1 = no definido/no facturado, > -1 = facturado). Solo puede ser establecido/actualizado por ADMIN
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} ReportMedia
 * @property {import('mongodb').ObjectId} reportId
 * @property {"FOTO" | "VIDEO" | "AUDIO"} type
 * @property {string} url
 * @property {string} [transcripcion] - solo para AUDIO
 * @property {import('mongodb').ObjectId} uploadedBy
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} ReportHistory
 * @property {import('mongodb').ObjectId} reportId
 * @property {import('mongodb').ObjectId} userId
 * @property {Date} createdAt
 * @property {"CAMBIO_ESTADO" | "ACTUALIZACION_TECNICO" | "NOTA_ADMIN"} type
 * @property {string} [oldStatus]
 * @property {string} [newStatus]
 * @property {string} comment
 * @property {import('mongodb').ObjectId} [mediaId] - Referencia al media asociado (si aplica)
 */

/**
 * @typedef {Object} Agenda
 * @property {Date} fechaHora - Fecha y hora de la agenda
 * @property {string} titulo - Título de la agenda
 * @property {string} descripcion - Descripción detallada
 * @property {import('mongodb').ObjectId} createdBy - Usuario que creó la agenda
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export const Collections = {
  USERS: 'users',
  CLIENTS: 'clients',
  SERVICES: 'services',
  PRICE_LISTS: 'priceLists',
  REPORTS: 'reports',
  REPORT_MEDIA: 'reportMedia',
  REPORT_HISTORY: 'reportHistory',
  AGENDAS: 'agendas',
};

