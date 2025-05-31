import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container header-content">
        <div>
          <h1 className="header-title">Vibe</h1>
          <p className="header-subtitle">Startup Idea Validation Platform</p>
        </div>
        <div className="header-info">
          <p>Powered by Perplexity AI</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
