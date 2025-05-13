import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { StoreProviders } from './stores/provider';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <StoreProviders>
        <AppRoutes />
      </StoreProviders>
    </BrowserRouter>
  );
};

export default App;