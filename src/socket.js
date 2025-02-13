// src/socket.js

import { io } from 'socket.io-client';

// Substitua pela URL do seu backend
const SOCKET_SERVER_URL = 'http://localhost:8000'; // Ajuste conforme necessário

const socket = io(SOCKET_SERVER_URL, {
  transports: ['websocket'], // Opcional: especifica os transportes permitidos
});

export default socket;
