import React from "react";

// Componente fondo cuadrícula retro
export const GridBackground = ({ className = "" }) => (
  <div
    className={
      "pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden " +
      className
    }
    style={{
      // Apilamos los 3 fondos:
      // 1. Cuadrícula vertical
      // 2. Cuadrícula horizontal
      // 3. Gradiente radial (el del video)
      background: `
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px),
        radial-gradient(ellipse at center, #1a202c 0%, #0a0c12 100%)
      `,
      // Definimos el tamaño de cada fondo en el mismo orden
      backgroundSize: "30px 30px, 30px 30px, 100% 100%",
      zIndex: 0
    }}
    aria-hidden="true"
  />
);