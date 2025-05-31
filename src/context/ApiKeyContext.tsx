import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isKeySet: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get API key from localStorage
  const [apiKey, setApiKeyState] = useState<string>(() => {
    const savedKey = localStorage.getItem('perplexity_api_key');
    return savedKey || '';
  });

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    // Save API key to localStorage
    localStorage.setItem('perplexity_api_key', key);
  };

  const isKeySet = apiKey.trim() !== '';

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, isKeySet }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
