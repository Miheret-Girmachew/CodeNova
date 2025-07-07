// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 1. ThemeProvider is the outermost wrapper */}
      <ThemeProvider defaultTheme="dark" storageKey="codenova-ui-theme">
        <AuthProvider>
          {/* 2. App now sits inside, and it will contain MantineProvider */}
          <App /> 
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);