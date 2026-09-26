import React, { useState, useRef } from "react";
import useSound from "use-sound";
import "./index.css";
import { Eyes } from "./robot-eyes.tsx";
import { Typewriter } from "./typewriter.tsx";
// 1. IMPORTAMOS EL JUEGO
import SnakeGame from "./snake-game.tsx";

const options = [
  {
    text: "Diapositiva", 
    link:
      "https://www.canva.com/design/DAG4Ws-8YZ4/Sh9gyY1oFEAZnIUeJ_2RoQ/view?utm_content=DAG4Ws-8YZ4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf589071d70",
    external: true
  },
  { text: "Simulador Web", link: "/calculadora.html" }, 
  // 2. CAMBIAMOS 'play' PARA QUE SEA UNA ACCIÓN, NO UN ENLACE
  { text: "play", link: null, action: 'play' }, 
];

const blinkOnlySequence = {
  x: [0, 0, 0, 0],
  scaleY: [1, 1, 0.1, 1],
  times: [0, 0.85, 0.9, 1]
};

export default function App() {
  const [selected, setSelected] = useState(0);
  const [isScreenOn, setIsScreenOn] = useState(true);
  
  // 3. NUEVO ESTADO PARA SABER QUÉ PANTALLA MOSTRAR
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' o 'play'
  
  // 4. REFERENCIA PARA CONTROLAR EL JUEGO
  const snakeRef = useRef(null);
  
  const [play] = useSound("/sound/click.mp3", { volume: 0.8 });
  const [pressed, setPressed] = useState("");

  function pulse(btn) {
    setPressed(btn);
    play();
    setTimeout(() => setPressed(""), 180);
  }

  // 5. DPAD ACTUALIZADO
  function handleDpad(dir) {
    pulse(dir);
    // Si estamos en el juego, mandamos los controles al juego
    if (currentScreen === 'play') {
      snakeRef.current?.handleDpad(dir);
      return;
    }
    // Si no, movemos el menú
    if (dir === "up") setSelected(sel => (sel - 1 + options.length) % options.length);
    if (dir === "down") setSelected(sel => (sel + 1) % options.length);
    if (dir === "left") setSelected(sel => (sel % 2 === 0 ? sel : sel - 1));
    if (dir === "right") setSelected(sel => (sel % 2 === 1 ? sel : sel + 1));
  }

  // 6. BOTÓN A ACTUALIZADO
  function handleA() {
    pulse("A");
    // Si estamos en el juego, 'A' reinicia el juego
    if (currentScreen === 'play') {
      snakeRef.current?.handleA();
      return;
    }

    // Si estamos en el menú, 'A' selecciona una opción
    const sel = options[selected];
    
    // Si la acción es 'play', cambiamos de pantalla
    if (sel.action === 'play') {
      setCurrentScreen('play');
      return;
    }
    
    if (sel.external) {
      window.open(sel.link, '_blank');
    } else if (sel.link) {
      window.location.href = sel.link;
    }
  }

  // 7. BOTÓN B ACTUALIZADO
  function handleB() {
    pulse("B");
    // Si estamos en el juego, 'B' nos regresa al menú
    if (currentScreen === 'play') {
      setCurrentScreen('main');
      return;
    }
    // Si no, resetea la selección del menú
    setSelected(0);
  }

  function handlePowerToggle() {
    setIsScreenOn(prev => !prev);
    play();
  }

  return (
    <div className="console" role="application" aria-label="Consola retro">
      
      <button 
        className="power-button" 
        aria-label="Toggle Power" 
        onClick={handlePowerToggle}
      ></button>

      <div className="bezel">
        {/* 8. RENDERIZADO CONDICIONAL DE LA PANTALLA */}
        <div className={`screen${isScreenOn ? "" : " screen-off"}`} aria-live="polite">

          {isScreenOn && (
            <>
              {/* Si la pantalla es 'main', mostramos el menú */}
              {currentScreen === 'main' && (
                <>
                  <div className="robot-eyes-wrapper">
                    <Eyes
                      eyeColor="#F6EAC5" 
                      lookAround={{
                        enabled: true,
                        duration: 4, 
                        sequence: blinkOnlySequence 
                      }}
                      classes={{
                        container: "robot-eye-container",
                        eye: "robot-eye-pixel"
                      }}
                    />
                  </div>
                  
                  <Typewriter
                    text={[
                      "Proyecto Steam Calculo Multivariado Grupo#2",
                      "Proyecto Steam Calculo Multivariado Grupo#2"
                    ]}
                    speed={50}
                    waitTime={3240} 
                    loop={true}
                    showCursor={true} 
                    cursorClassName="typewriter-cursor"
                    className="bubble title-bubble" 
                  />

                  <div className="bubble small">
                    <nav className="menu custom-menu" aria-label="Menú">
                      {options.map((opt, idx) => (
                        <a
                          key={idx}
                          className={`link${selected === idx ? " selected" : ""}`}
                          href={opt.link}
                          tabIndex={-1}
                          {...(opt.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {opt.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                  <div className="hud">↑↓←→ Navigate · A Select · B Back · v1.0.0</div>
                </>
              )}
              
              {/* Si la pantalla es 'play', mostramos el juego */}
              {currentScreen === 'play' && (
                <SnakeGame ref={snakeRef} />
              )}
            </>
          )}
        </div>

        <div className="controls-bg custom-controls">
          <div className="dpad-gba-abs">
            <button className={`gba-btn up${pressed === 'up' ? ' anim' : ''}`} aria-label="Arriba" onClick={() => handleDpad('up')}></button>
            <button className={`gba-btn down${pressed === 'down' ? ' anim' : ''}`} aria-label="Abajo" onClick={() => handleDpad('down')}></button>
            <button className={`gba-btn left${pressed === 'left' ? ' anim' : ''}`} aria-label="Izquierda" onClick={() => handleDpad('left')}></button>
            <button className={`gba-btn right${pressed === 'right' ? ' anim' : ''}`} aria-label="Derecha" onClick={() => handleDpad('right')}></button>
          </div>
          <button className="gba-ab gba-b-abs" onClick={handleB}>B</button>
          <button className="gba-ab gba-a-abs" onClick={handleA}>A</button>
        </div>
      </div>
    </div>
  );
}