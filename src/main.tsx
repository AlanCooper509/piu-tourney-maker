import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Box } from '@chakra-ui/react';

import { Provider } from "./components/ui/provider"
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <Box padding="10">
        <App />
      </Box>
    </Provider>
  </StrictMode>
)