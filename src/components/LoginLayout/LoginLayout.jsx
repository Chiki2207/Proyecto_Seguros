import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

// Animación de flotación suave para tarjeta izquierda
const floatCardLeft = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(-5deg);
  }
  33% {
    transform: translateY(-15px) translateX(8px) rotate(-4deg);
  }
  66% {
    transform: translateY(10px) translateX(-6px) rotate(-6deg);
  }
`;

// Animación de flotación suave para tarjeta derecha
const floatCardRight = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(4deg);
  }
  25% {
    transform: translateY(-12px) translateX(-8px) rotate(5deg);
  }
  50% {
    transform: translateY(8px) translateX(6px) rotate(3deg);
  }
  75% {
    transform: translateY(-8px) translateX(-4px) rotate(4.5deg);
  }
`;

// Animación de flotación suave para escudo central
const floatShield = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
  }
  25% {
    transform: translateY(-15px) translateX(8px) rotate(2deg) scale(1.02);
  }
  50% {
    transform: translateY(10px) translateX(-6px) rotate(-1.5deg) scale(0.98);
  }
  75% {
    transform: translateY(-8px) translateX(5px) rotate(1deg) scale(1.01);
  }
`;

const LoginLayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        overflowY: "auto",
        padding: { xs: 1, sm: 2, md: 4 },
        paddingTop: { xs: 0, sm: 1, md: 2 },
        background: `
          radial-gradient(circle at 10% 20%, rgba(255, 235, 59, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #fffef0 0%, #fffae6 30%, #fff8dc 60%, #fff5d6 100%)
        `,
        // Prevenir scroll automático cuando aparece el teclado en iOS
        WebkitOverflowScrolling: "touch",
        // Ajustar para que el contenido se mantenga visible cuando aparece el teclado
        "@supports (-webkit-touch-callout: none)": {
          minHeight: "-webkit-fill-available",
        },
      }}
    >
      {/* Tarjeta rectangular grande izquierda (Póliza principal) */}
      <Box
        sx={{
          position: "absolute",
          left: { xs: "-30px", sm: "-35px", md: "3%", lg: "4%" },
          top: { xs: "15%", sm: "18%", md: "22%", lg: "24%" },
          width: { xs: "80px", sm: "140px", md: "230px", lg: "250px" },
          height: { xs: "50px", sm: "85px", md: "150px", lg: "165px" },
          borderRadius: { xs: "10px", sm: "12px", md: "14px" },
          border: { xs: "2px solid rgba(255, 235, 59, 0.35)", md: "3px solid rgba(255, 235, 59, 0.35)" },
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.75) 100%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 235, 59, 0.08) 2px,
              rgba(255, 235, 59, 0.08) 4px
            )
          `,
          backdropFilter: "blur(12px)",
          boxShadow: `
            0 12px 32px rgba(255, 220, 100, 0.25),
            0 4px 16px rgba(255, 200, 80, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            inset 0 -1px 0 rgba(255, 235, 59, 0.15)
          `,
          transform: "rotate(-5deg)",
          animation: `${floatCardLeft} 20s ease-in-out infinite`,
          zIndex: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: { xs: "6px", sm: "8px", md: "12px" },
            left: { xs: "6px", sm: "8px", md: "12px" },
            right: { xs: "6px", sm: "8px", md: "12px" },
            height: { xs: "1.5px", sm: "2px", md: "3px" },
            background: "linear-gradient(90deg, rgba(255, 235, 59, 0.4) 0%, rgba(255, 215, 0, 0.3) 50%, rgba(255, 235, 59, 0.4) 100%)",
            borderRadius: "2px",
          },
          "&::after": {
            content: '"PÓLIZA"',
            position: "absolute",
            top: { xs: "11px", sm: "18px", md: "24px" },
            left: { xs: "6px", sm: "12px", md: "16px" },
            fontSize: { xs: "5px", sm: "8px", md: "12px", lg: "13px" },
            fontWeight: 700,
            color: "rgba(255, 193, 7, 0.6)",
            letterSpacing: { xs: "0.3px", sm: "0.5px", md: "1px" },
            textTransform: "uppercase",
          },
        }}
      />

      {/* Tarjeta mediana derecha (Ficha de cliente) */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: "-25px", sm: "-35px", md: "5%", lg: "6%" },
          top: { xs: "15%", sm: "20%", md: "22%", lg: "24%" },
          width: { xs: "70px", sm: "120px", md: "190px", lg: "210px" },
          height: { xs: "45px", sm: "75px", md: "120px", lg: "135px" },
          borderRadius: { xs: "10px", sm: "11px", md: "12px" },
          border: { xs: "2px solid rgba(255, 235, 59, 0.3)", md: "2.5px solid rgba(255, 235, 59, 0.3)" },
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(255, 235, 59, 0.06) 3px,
              rgba(255, 235, 59, 0.06) 6px
            )
          `,
          backdropFilter: "blur(10px)",
          boxShadow: `
            0 10px 28px rgba(255, 220, 100, 0.22),
            0 3px 12px rgba(255, 200, 80, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            inset 0 -1px 0 rgba(255, 235, 59, 0.12)
          `,
          transform: "rotate(4deg)",
          animation: `${floatCardRight} 18s ease-in-out infinite`,
          zIndex: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: { xs: "6px", sm: "7px", md: "10px" },
            left: { xs: "6px", sm: "7px", md: "10px" },
            width: "40%",
            height: { xs: "1px", sm: "1.5px", md: "2px" },
            background: "rgba(255, 193, 7, 0.35)",
            borderRadius: "1px",
          },
          "&::after": {
            content: '"CLIENTE"',
            position: "absolute",
            top: { xs: "10px", sm: "15px", md: "20px" },
            left: { xs: "5px", sm: "9px", md: "12px" },
            fontSize: { xs: "4px", sm: "7px", md: "11px", lg: "12px" },
            fontWeight: 600,
            color: "rgba(255, 193, 7, 0.55)",
            letterSpacing: { xs: "0.3px", sm: "0.5px", md: "0.8px" },
            textTransform: "uppercase",
          },
        }}
      />

      {/* Bloque tipo escudo/sello central (Protección) */}
      <Box
        sx={{
          position: "absolute",
          left: { xs: "60%", sm: "58%", md: "62%", lg: "64%" },
          top: { xs: "55%", sm: "50%", md: "50%", lg: "52%" },
          width: { xs: "60px", sm: "100px", md: "170px", lg: "190px" },
          height: { xs: "60px", sm: "100px", md: "170px", lg: "190px" },
          borderRadius: "50%",
          border: { xs: "2px solid rgba(255, 235, 59, 0.4)", sm: "3px solid rgba(255, 235, 59, 0.4)", md: "4px solid rgba(255, 235, 59, 0.4)" },
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 30%, rgba(255, 235, 59, 0.25) 60%, rgba(255, 215, 0, 0.15) 100%),
            linear-gradient(135deg, rgba(255, 235, 59, 0.3) 0%, rgba(255, 215, 0, 0.2) 50%, rgba(255, 235, 59, 0.25) 100%)
          `,
          boxShadow: `
            0 16px 40px rgba(255, 220, 100, 0.3),
            0 6px 20px rgba(255, 200, 80, 0.25),
            inset 0 2px 10px rgba(255, 255, 255, 0.4),
            inset 0 -2px 10px rgba(255, 235, 59, 0.2),
            0 0 0 2px rgba(255, 255, 255, 0.3)
          `,
          animation: `${floatShield} 22s ease-in-out infinite`,
          zIndex: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            border: { xs: "1.5px solid rgba(255, 193, 7, 0.3)", sm: "2px solid rgba(255, 193, 7, 0.3)", md: "3px solid rgba(255, 193, 7, 0.3)" },
            background: "radial-gradient(circle, rgba(255, 235, 59, 0.2) 0%, transparent 70%)",
          },
          "&::after": {
            content: '"✓"',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: { xs: "20px", sm: "32px", md: "64px", lg: "72px" },
            fontWeight: 300,
            color: "rgba(255, 193, 7, 0.5)",
            lineHeight: 1,
          },
        }}
      />

      {/* Contenedor del login (centrado, encima de las figuras) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "450px",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default LoginLayout;
