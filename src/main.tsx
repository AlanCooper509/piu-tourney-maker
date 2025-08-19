import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Box } from '@chakra-ui/react';

import { Provider } from "./components/ui/provider"
import { AuthProvider } from './context/AuthContext';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <AuthProvider>
        <Box padding="1">
          <App />
        </Box>
      </AuthProvider>
    </Provider>
  </StrictMode>
)