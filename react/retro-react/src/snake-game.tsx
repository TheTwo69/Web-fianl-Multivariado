import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import useSound from "use-sound";

// Definimos los tipos que necesitamos localmente
type Point = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";

export type SnakeGameHandle = {
  handleDpad: (action: Direction) => void;
  handleA: () => void;
};

// --- Configuración del Juego ---
const SPEED_MS = 200; // Un poco más rápido
const GRID_COLS = 24;
const GRID_ROWS = 20;
const CELL_SIZE = 16; // Tamaño de cada celda en píxeles

const SnakeGame = forwardRef<SnakeGameHandle, {}>((props, ref) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [snake, setSnake] = useState<Point[]>([]);
  const [food, setFood] = useState<Point | null>(null);

  // Reusamos tu sonido de 'click' para cuando come
  const [playEatFood] = useSound("/sound/click.mp3", { volume: 0.8 });

  // Referencias para el bucle del juego
  const directionRef = useRef<Direction>("right");
  const nextDirRef = useRef<Direction | null>(null);
  const gameStateRef = useRef({ snake, food });
  const gameLoopRef = useRef<number | null>(null);

  // Sincroniza el estado con la referencia para el bucle
  useEffect(() => {
    gameStateRef.current = { snake, food };
  }, [snake, food]);

  const placeFood = useCallback((currentSnake: Point[]) => {
    let p: Point;
    do {
      p = {
        x: Math.floor(Math.random() * GRID_COLS),
        y: Math.floor(Math.random() * GRID_ROWS),
      };
    } while (currentSnake.some((s) => s.x === p.x && s.y === p.y));
    return p;
  }, []);

  const initGame = useCallback(() => {
    const cx = Math.floor(GRID_COLS / 3);
    const cy = Math.floor(GRID_ROWS / 2);
    const initialSnake = [
      { x: cx + 2, y: cy },
      { x: cx + 1, y: cy },
      { x: cx, y: cy },
    ];

    setSnake(initialSnake);
    setFood(placeFood(initialSnake));
    setScore(0);
    setGameOver(false);
    directionRef.current = "right";
    nextDirRef.current = null;
  }, [placeFood]);

  const gameStep = useCallback(() => {
    const { snake: currentSnake, food: currentFood } = gameStateRef.current;
    const dir = nextDirRef.current ?? directionRef.current;

    directionRef.current = dir;
    nextDirRef.current = null;

    const head = currentSnake[0];
    const delta: Record<Direction, Point> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    const newHead = { x: head.x + delta[dir].x, y: head.y + delta[dir].y };

    // Colisión con la pared
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_COLS ||
      newHead.y < 0 ||
      newHead.y >= GRID_ROWS
    ) {
      setGameOver(true);
      return;
    }

    const willGrow =
      currentFood &&
      newHead.x === currentFood.x &&
      newHead.y === currentFood.y;
    const bodyToCheck = willGrow ? currentSnake : currentSnake.slice(0, -1);

    // Colisión consigo mismo
    if (bodyToCheck.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...currentSnake];
    if (!willGrow) newSnake.pop();

    if (willGrow) {
      playEatFood();
      setFood(placeFood(newSnake));
      setScore((prev) => prev + 1);
    }

    setSnake(newSnake);
  }, [placeFood, playEatFood]);

  const restart = useCallback(() => {
    initGame();
  }, [initGame]);

  // Expone los controles al componente padre (App.jsx)
  useImperativeHandle(ref, () => ({
    handleDpad: (action: Direction) => {
      if (gameOver) return;
      const opposite: Record<Direction, Direction> = {
        up: "down",
        down: "up",
        left: "right",
        right: "left",
      };
      if (action === opposite[directionRef.current]) return;
      nextDirRef.current = action;
    },
    handleA: () => {
      if (gameOver) {
        restart();
      }
    },
  }));

  // Inicia el juego
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Bucle del juego
  useEffect(() => {
    if (gameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }
    gameLoopRef.current = window.setInterval(gameStep, SPEED_MS);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStep, gameOver]);

  return (
    <div
      className="snake-game-container"
      style={{
        width: GRID_COLS * CELL_SIZE,
        height: GRID_ROWS * CELL_SIZE,
      }}
    >
      {/* Comida */}
      {food && (
        <div
          className="snake-food"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />
      )}

      {/* Serpiente */}
      {snake.map((segment, i) => (
        <div
          key={i}
          className="snake-segment"
          style={{
            left: segment.x * CELL_SIZE,
            top: segment.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />
      ))}

      {/* Pantalla de Game Over */}
      {gameOver && (
        <div className="snake-game-over">
          <div>GAME OVER</div>
          <div className="score">Score: {score}</div>
          <div className="restart">Press A to Restart</div>
          <div className="back">Press B to Exit</div>
        </div>
      )}
    </div>
  );
});

SnakeGame.displayName = "SnakeGame";
export default SnakeGame;