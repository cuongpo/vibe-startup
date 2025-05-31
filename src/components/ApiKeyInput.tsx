import React, { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';

const ApiKeyInput: React.FC = () => {
  const { apiKey, setApiKey } = useApiKey();
  const [inputKey, setInputKey] = useState(apiKey);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate validation (in a real app, you might want to verify the key)
    setTimeout(() => {
      setApiKey(inputKey.trim());
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="card" style={{maxWidth: '600px', margin: '0 auto'}}>
      <form onSubmit={handleSubmit}>
        <div className="alert alert-info">
          <div>
            <h3 style={{marginTop: 0, fontWeight: 600}}>Perplexity API Key Required</h3>
            <p>
              To validate your startup idea, you'll need a Perplexity API key with access to the Sonar API.
            </p>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="api-key">
            Perplexity API Key <span style={{color: 'red'}}>*</span>
          </label>
          <input
            id="api-key"
            className="form-input"
            type="password"
            placeholder="Enter your Perplexity API key"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        
        <p style={{fontSize: '0.9rem', marginBottom: '16px'}}>
          Don't have an API key?{' '}
          <a 
            href="https://www.perplexity.ai/settings/api"
            target="_blank" 
            rel="noopener noreferrer"
            style={{color: 'var(--teal-500)'}}
          >
            Get one from Perplexity
          </a>
        </p>
        
        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isSubmitting || !inputKey.trim()}
        >
          {isSubmitting ? 'Saving...' : 'Save API Key'}
        </button>
      </form>
    </div>
  );
};

export default ApiKeyInput;
