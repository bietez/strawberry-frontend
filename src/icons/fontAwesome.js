// src/icons/fontAwesome.js

import { library } from '@fortawesome/fontawesome-svg-core';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
// Se estiver usando ícones de marcas, importe-os também
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

// Adicione os ícones à biblioteca
library.add(faPenToSquare, faTrash, faWhatsapp);
