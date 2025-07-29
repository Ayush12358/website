import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MarioGame from '../components/MarioGame';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [showGame, setShowGame] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGameOver = (finalScore) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  };

  const handleScoreUpdate = (currentScore) => {
    // Could add real-time score tracking here if needed
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">
          <span className="error-code">404</span>
        </div>
        
        <div className="not-found-message">
          <h1>Page Not Found</h1>
          <p>Sorry, the page you're looking for doesn't exist or has been moved.</p>
        </div>

        <div className="not-found-actions">
          <button 
            onClick={handleGoBack}
            className="btn btn-secondary"
            title="Go back to previous page"
          >
            ← Go Back
          </button>
          
          <Link 
            to="/" 
            className="btn btn-primary"
            title="Return to homepage"
          >
            🏠 Home
          </Link>
          
          <Link 
            to="/dashboard" 
            className="btn btn-outline"
            title="Go to dashboard"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Mario Game */}
        <div className="mario-game-section">
          <h3>While you're here, play a game! 🎮</h3>
          
          {!showGame ? (
            <div className="game-intro">
              <p>Help Mario jump over obstacles! Built with React Game Kit.</p>
              {highScore > 0 && (
                <div className="high-score">
                  🏆 High Score: {highScore}
                </div>
              )}
              <button 
                onClick={() => setShowGame(true)} 
                className="btn btn-primary"
              >
                🎮 Play Mario Game
              </button>
            </div>
          ) : (
            <div className="game-active">
              <MarioGame 
                onGameOver={handleGameOver}
                onScoreUpdate={handleScoreUpdate}
              />
              <button 
                onClick={() => setShowGame(false)} 
                className="btn btn-secondary"
                style={{ marginTop: '15px' }}
              >
                ✕ Close Game
              </button>
            </div>
          )}
        </div>

        <div className="not-found-suggestions">
          <h3>You might want to:</h3>
          <ul>
            <li>Check the URL for typos</li>
            <li>Visit our <Link to="/">homepage</Link></li>
            <li>Browse your <Link to="/dashboard">dashboard</Link></li>
            <li>View your <Link to="/profile">profile</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
