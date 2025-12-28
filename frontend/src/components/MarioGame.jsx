import React, { useState, useEffect, useRef, useCallback } from 'react';
import './MarioGame.css';

const MarioGame = ({ onGameOver, onScoreUpdate }) => {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(2);
  const [playerPosition] = useState({ x: 100, y: 60 });
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const gameLoopRef = useRef(null);
  const gameAreaRef = useRef(null);

  // Enhanced game loop using requestAnimationFrame for smooth performance
  const gameLoop = useCallback(() => {
    if (!running) return;

    // Move obstacles
    setObstacles(prevObstacles => {
      const newObstacles = prevObstacles
        .map(obs => ({ ...obs, x: obs.x - gameSpeed }))
        .filter(obs => obs.x > -50);

      // Add new obstacles with better spacing
      if (Math.random() < 0.012 && (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].x < 600)) {
        newObstacles.push({
          x: 850,
          y: 60,
          width: 30,
          height: 40,
          id: Date.now()
        });
      }

      return newObstacles;
    });

    // Update score
    setScore(prev => {
      const newScore = prev + 1;
      onScoreUpdate?.(newScore);
      return newScore;
    });

    // Gradually increase game speed
    setGameSpeed(prev => Math.min(prev + 0.003, 5));

    // Continue the game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [running, gameSpeed, onScoreUpdate]);

  // Collision detection
  useEffect(() => {
    if (!running) return;

    const checkCollisions = () => {
      const playerRect = {
        x: playerPosition.x,
        y: playerPosition.y + (isJumping ? -50 : 0),
        width: 35,
        height: 35
      };

      obstacles.forEach(obstacle => {
        if (
          playerRect.x < obstacle.x + obstacle.width - 5 &&
          playerRect.x + playerRect.width > obstacle.x + 5 &&
          playerRect.y < obstacle.y + obstacle.height - 5 &&
          playerRect.y + playerRect.height > obstacle.y + 5
        ) {
          setRunning(false);
          onGameOver?.(score);
        }
      });
    };

    checkCollisions();
  }, [obstacles, playerPosition, isJumping, running, score, onGameOver]);

  // Start game loop
  useEffect(() => {
    if (running) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [running, gameLoop]);

  const jump = useCallback(() => {
    if (!isJumping && running) {
      setIsJumping(true);
      setTimeout(() => {
        setIsJumping(false);
      }, 600);
    }
  }, [isJumping, running]);

  const startGame = () => {
    setRunning(true);
    setScore(0);
    setGameSpeed(2);
    setObstacles([]);
    setIsJumping(false);
  };

  const stopGame = () => {
    setRunning(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    if (running) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [running, jump]);

  return (
    <div className="mario-game-wrapper">
      <div className="game-controls">
        {!running ? (
          <button onClick={startGame} className="game-btn start-btn">
            🎮 Start Game
          </button>
        ) : (
          <div className="game-info">
            <div className="score">Score: {score}</div>
            <button onClick={stopGame} className="game-btn stop-btn">
              ⏸️ Pause
            </button>
          </div>
        )}
      </div>

      <div
        ref={gameAreaRef}
        className="game-area"
        onClick={jump}
        style={{ cursor: running ? 'pointer' : 'default' }}
      >
        {/* Background */}
        <div className="mario-background">
          <div className="clouds">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="cloud"
                style={{
                  left: `${i * 200}px`,
                  top: `${20 + (i % 2) * 20}px`,
                  animationDelay: `${i * 0.5}s`
                }}
              >
                ☁️
              </div>
            ))}
          </div>
          <div className="ground"></div>
        </div>

        {/* Player (Mario) */}
        <div
          className={`mario-player ${isJumping ? 'jumping' : ''}`}
          style={{
            left: playerPosition.x,
            bottom: playerPosition.y + (isJumping ? 50 : 0),
          }}
        >
          🍄
        </div>

        {/* Obstacles */}
        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="mario-obstacle"
            style={{
              left: obstacle.x,
              bottom: obstacle.y,
            }}
          >
            🌵
          </div>
        ))}

        {/* Instructions */}
        {running && (
          <div className="instructions">
            Click here or press SPACE to jump!
          </div>
        )}
      </div>
    </div>
  );
};

export default MarioGame;
