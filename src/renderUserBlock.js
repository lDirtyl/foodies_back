// src/renderUserBlock.js
// Блок авторизації: логін, реєстрація, логаут, показ юзера

import fs from 'fs/promises';
import path from 'path';

export default async function renderUserBlock() {
  const htmlPath = path.join(process.cwd(), 'public', 'user-block.html');
  try {
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    // Возвращаем полное содержимое файла, чтобы включить и <head> со стилями, и <body> с разметкой.
    return htmlContent;
  } catch (error) {
    console.error('Error reading user-block.html:', error);
    return '<p>Error loading user block. Please check server logs.</p>';
  }
}
