// src/components/Layout.js

import React, { useState, useEffect, createContext } from 'react';
import Navbar from './Navbar';
import './Layout.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../services/api';

// Criação do contexto para o modo escuro (opcional)
export const DarkModeContext = createContext({
  darkMode: false,
  setDarkMode: () => {},
});

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Alternar a sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Efeito para buscar config do backend (endereço: /config)
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await api.get('/config'); // endpoint GET /config
        const cfg = res.data || {};
        // Se a config contiver 'darkMode: true'
        setDarkMode(!!cfg.darkMode);
      } catch (err) {
        console.error('Erro ao buscar config para darkMode:', err);
      }
    }
    fetchConfig();
  }, []);

  // (Opcional) Toggle manual do darkMode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    // Se quiser salvar no backend, você teria que chamar PUT /config
    // api.put('/config', { darkMode: !darkMode });
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {/* .dark-mode é aplicado se darkMode === true */}
      <div
        className={`app-container ${isCollapsed ? 'collapsed' : ''} ${
          darkMode ? 'dark-mode' : ''
        }`}
      >
        {/* Navbar */}
        <Navbar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

        {/* Conteúdo principal */}
        <main className="main-content">
          {children}
        </main>

        {/* Container de Toast */}
        <ToastContainer />
      </div>
    </DarkModeContext.Provider>
  );
}

export default Layout;
