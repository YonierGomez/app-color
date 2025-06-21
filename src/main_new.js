const { app, BrowserWindow, globalShortcut, Menu, screen, Tray, nativeImage } = require('electron');
const path = require('path');

let overlayWindow;
let tray = null;
let isDrawingMode = false;

// Estados iniciales (se resetean al desactivar dibujo)
let currentTool = 'rectangle';
let currentColor = '#ff0000';
let currentSize = 3;

// Colores disponibles
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];
let colorIndex = 0;

// Tamaños disponibles
const sizes = [2, 3, 5, 8, 12];
let sizeIndex = 1;

// Colores básicos predefinidos
const basicColors = {
  red: '#ff0000',
  green: '#00ff00', 
  blue: '#0000ff',
  yellow: '#ffff00',
  magenta: '#ff00ff',
  cyan: '#00ffff',
  white: '#ffffff',
  black: '#000000'
};

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  overlayWindow.loadFile('src/drawing.html');
  overlayWindow.setIgnoreMouseEvents(true);

  // Ocultar el dock icon
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
}

function toggleDrawingMode() {
  if (!isDrawingMode) {
    // Activar modo dibujo
    overlayWindow.setIgnoreMouseEvents(false);
    overlayWindow.show();
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
    isDrawingMode = true;
    console.log('Modo dibujo activado - Herramienta inicial: Rectángulo');
  } else {
    // Desactivar modo dibujo y resetear todo
    overlayWindow.setIgnoreMouseEvents(true);
    overlayWindow.hide();
    
    // Resetear configuración a valores iniciales
    currentTool = 'rectangle';
    currentColor = '#ff0000';
    currentSize = 3;
    colorIndex = 0;
    sizeIndex = 1;
    
    // Limpiar el canvas
    overlayWindow.webContents.send('clear-drawing');
    
    isDrawingMode = false;
    console.log('Modo dibujo desactivado - Configuración reseteada (por defecto: Rectángulo)');
  }
}

function clearDrawing() {
  if (overlayWindow) {
    overlayWindow.webContents.send('clear-drawing');
    console.log('Dibujo limpiado');
  }
}

function changeColor() {
  colorIndex = (colorIndex + 1) % colors.length;
  currentColor = colors[colorIndex];
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  
  // Mostrar notificación del color actual
  const colorNames = ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Magenta', 'Cian', 'Blanco', 'Negro'];
  console.log(`Color: ${colorNames[colorIndex]} (${currentColor})`);
}

function changeSize() {
  sizeIndex = (sizeIndex + 1) % sizes.length;
  currentSize = sizes[sizeIndex];
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log(`Tamaño cambiado a: ${currentSize}`);
}

function drawRectangle() {
  currentTool = 'rectangle';
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Herramienta: Rectángulo perfecto');
}

function drawCircle() {
  currentTool = 'circle';
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Herramienta: Círculo perfecto');
}

function drawPen() {
  currentTool = 'pen';
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Herramienta: Lápiz');
}

function drawEraser() {
  currentTool = 'eraser';
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Herramienta: Borrador');
}

function undoLastAction() {
  if (overlayWindow) {
    overlayWindow.webContents.send('undo-action');
    console.log('Deshacer última acción');
  }
}

// Función para resetear todo sin desactivar el modo dibujo
function resetAll() {
  // Resetear configuración a valores iniciales
  currentTool = 'rectangle';
  currentColor = '#ff0000';
  currentSize = 3;
  colorIndex = 0;
  sizeIndex = 1;
  
  // Limpiar el canvas
  if (overlayWindow) {
    overlayWindow.webContents.send('clear-drawing');
    
    // Si está en modo dibujo, actualizar herramienta
    if (isDrawingMode) {
      overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
    }
  }
  
  console.log('Todo reseteado: Rectángulo, Rojo, Tamaño 3, Canvas limpio');
}

// Funciones para establecer colores básicos directamente
function setRedColor() {
  currentColor = basicColors.red;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Rojo');
}

function setGreenColor() {
  currentColor = basicColors.green;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Verde');
}

function setBlueColor() {
  currentColor = basicColors.blue;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Azul');
}

function setYellowColor() {
  currentColor = basicColors.yellow;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Amarillo');
}

function setWhiteColor() {
  currentColor = basicColors.white;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Blanco');
}

function setBlackColor() {
  currentColor = basicColors.black;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Negro');
}

// Función para crear el icono del tray
function createTray() {
  // Crear un icono SVG simple de paleta de colores (16x16 optimizado para macOS)
  const svgIcon = `
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <!-- Paleta de colores simple y visible -->
      <circle cx="3" cy="3" r="2.5" fill="#FF0000" stroke="#000" stroke-width="0.5"/>
      <circle cx="13" cy="3" r="2.5" fill="#00FF00" stroke="#000" stroke-width="0.5"/>
      <circle cx="3" cy="13" r="2.5" fill="#0066FF" stroke="#000" stroke-width="0.5"/>
      <circle cx="13" cy="13" r="2.5" fill="#FFFF00" stroke="#000" stroke-width="0.5"/>
      <!-- Centro con pincel -->
      <circle cx="8" cy="8" r="1.5" fill="#000" stroke="#FFF" stroke-width="0.5"/>
    </svg>
  `;
  
  let icon;
  try {
    // Crear icono desde SVG
    icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,' + 
      Buffer.from(svgIcon).toString('base64'));
    
    // Verificar que el icono se creó correctamente
    if (icon.isEmpty()) {
      throw new Error('SVG icon is empty');
    }
    
    console.log('Icono SVG creado exitosamente');
  } catch (error) {
    console.log('Error creating SVG icon, using fallback:', error.message);
    
    // Fallback: crear un icono más simple
    icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,' + 
      Buffer.from(`
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <rect width="16" height="16" fill="white" stroke="black" stroke-width="1"/>
          <circle cx="4" cy="4" r="2" fill="red"/>
          <circle cx="12" cy="4" r="2" fill="green"/>
          <circle cx="4" cy="12" r="2" fill="blue"/>
          <circle cx="12" cy="12" r="2" fill="yellow"/>
        </svg>
      `).toString('base64'));
  }
  
  // Configurar el icono como template para mejor visibilidad
  // En macOS, los iconos template se renderizan apropiadamente en modo claro y oscuro
  icon.setTemplateImage(true);
  
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Activar/Desactivar Dibujo (Cmd+Shift+D)', click: toggleDrawingMode },
    { type: 'separator' },
    { label: 'Herramientas', submenu: [
      { label: 'Lápiz (Cmd+Shift+1)', click: drawPen },
      { label: 'Rectángulo (Cmd+Shift+2)', click: drawRectangle },
      { label: 'Círculo (Cmd+Shift+3)', click: drawCircle },
      { label: 'Borrador (Cmd+Shift+4)', click: drawEraser }
    ]},
    { type: 'separator' },
    { label: 'Cambiar Color (Cmd+Shift+Q)', click: changeColor },
    { label: 'Cambiar Tamaño (Cmd+Shift+W)', click: changeSize },
    { type: 'separator' },
    { label: 'Limpiar Dibujo (Cmd+Shift+C)', click: clearDrawing },
    { label: 'Deshacer (Cmd+Z)', click: undoLastAction },
    { label: 'Resetear Todo (Cmd+Shift+R)', click: resetAll },
    { type: 'separator' },
    { label: 'Salir', click: () => app.quit() }
  ]);

  tray.setToolTip('Yonier Color Presenter');
  tray.setContextMenu(contextMenu);
  
  console.log('Tray configurado con icono de paleta de colores');
}

function registerShortcuts() {
  // Registrar atajos globales existentes
  globalShortcut.register('CommandOrControl+Shift+D', toggleDrawingMode);
  globalShortcut.register('CommandOrControl+Shift+C', clearDrawing);
  globalShortcut.register('CommandOrControl+Shift+R', resetAll);
  globalShortcut.register('CommandOrControl+Shift+1', drawPen);
  globalShortcut.register('CommandOrControl+Shift+2', drawRectangle);
  globalShortcut.register('CommandOrControl+Shift+3', drawCircle);
  globalShortcut.register('CommandOrControl+Shift+4', drawEraser);
  globalShortcut.register('CommandOrControl+Shift+Q', changeColor);
  globalShortcut.register('CommandOrControl+Shift+W', changeSize);
  globalShortcut.register('CommandOrControl+Z', undoLastAction);
  
  // Registrar nuevos atajos para colores básicos
  globalShortcut.register('CommandOrControl+R', setRedColor);
  globalShortcut.register('CommandOrControl+G', setGreenColor);
  globalShortcut.register('CommandOrControl+B', setBlueColor);
  globalShortcut.register('CommandOrControl+Y', setYellowColor);
  globalShortcut.register('CommandOrControl+Shift+A', setWhiteColor);
  globalShortcut.register('CommandOrControl+Shift+S', setBlackColor);
  
  globalShortcut.register('Escape', () => {
    if (isDrawingMode) {
      toggleDrawingMode();
    }
  });

  console.log('Atajos registrados:');
  console.log('=== CONTROL ===');
  console.log('Cmd+Shift+D - Activar/Desactivar dibujo');
  console.log('Cmd+Shift+C - Limpiar pantalla');
  console.log('Cmd+Shift+R - Resetear todo');
  console.log('=== HERRAMIENTAS ===');
  console.log('Cmd+Shift+1 - Lápiz');
  console.log('Cmd+Shift+2 - Rectángulo perfecto');
  console.log('Cmd+Shift+3 - Círculo perfecto');
  console.log('Cmd+Shift+4 - Borrador');
  console.log('=== COLORES BÁSICOS ===');
  console.log('Cmd+R - Rojo');
  console.log('Cmd+G - Verde');
  console.log('Cmd+B - Azul');
  console.log('Cmd+Y - Amarillo');
  console.log('Cmd+Shift+A - Blanco');
  console.log('Cmd+Shift+S - Negro');
  console.log('=== OTROS ===');
  console.log('Cmd+Shift+Q - Cambiar color');
  console.log('Cmd+Shift+W - Cambiar tamaño');
  console.log('Cmd+Z - Deshacer');
  console.log('Esc - Salir del modo dibujo');
  console.log('Tip: Haz clic derecho en el icono del menú para ver todos los atajos');
}

app.whenReady().then(() => {
  console.log('Iniciando Yonier Color Presenter...');
  
  createOverlayWindow();
  createTray();
  registerShortcuts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOverlayWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
