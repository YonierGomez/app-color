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
    // Limpiar canvas antes de activar para asegurar pantalla limpia
    overlayWindow.webContents.send('clear-drawing');
    
    // Pequeña pausa para asegurar que se procese el clear
    setTimeout(() => {
      overlayWindow.setIgnoreMouseEvents(false);
      overlayWindow.show();
      overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
    }, 50);
    
    isDrawingMode = true;
    console.log('Modo dibujo activado - Herramienta inicial: Rectángulo');
  } else {
    // Desactivar modo dibujo y resetear todo
    // PRIMERO limpiar el canvas mientras la ventana está visible
    overlayWindow.webContents.send('clear-drawing');
    
    // Pequeña pausa para asegurar que se procese el clear antes de ocultar
    setTimeout(() => {
      overlayWindow.setIgnoreMouseEvents(true);
      overlayWindow.hide();
    }, 100);
    
    // Resetear configuración a valores iniciales
    currentTool = 'rectangle';
    currentColor = '#ff0000';
    currentSize = 3;
    colorIndex = 0;
    sizeIndex = 1;
    
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
  
  // Limpiar el canvas primero
  if (overlayWindow) {
    overlayWindow.webContents.send('clear-drawing');
    
    // Si está en modo dibujo, actualizar herramienta después de limpiar
    if (isDrawingMode) {
      setTimeout(() => {
        overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
      }, 100);
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
  let icon;
  try {
    // Usar el icono de plantilla negro puro de 16x16
    const iconPath = path.join(__dirname, '..', 'assets', 'tray-template.png');
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      throw new Error('El icono de plantilla está vacío o no se pudo cargar.');
    }
    console.log('Icono de plantilla 16x16 cargado correctamente.');
  } catch (error) {
    // Fallback: icono SVG simple
    const fallbackIconSVG = `
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <rect width="14" height="14" x="1" y="1" fill="red" stroke="black" stroke-width="2"/>
      </svg>
    `;
    icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,' + Buffer.from(fallbackIconSVG).toString('base64'));
  }
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }
  tray = new Tray(icon);
  tray.setToolTip('Yonier Color Presenter');
  tray.displayBalloon && tray.displayBalloon({ title: 'Debug', content: 'Tray creado' });
  console.log('Tray creado y visible (deberías ver un icono en la barra de menú derecha).');

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

  // Menú de aplicación con listado de atajos
  const template = [
    {
      label: 'Yonier Color Presenter',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Atajos',
      submenu: [
        { label: 'Activar/Desactivar Dibujo (Cmd+Shift+D)', accelerator: 'CmdOrCtrl+Shift+D', click: toggleDrawingMode },
        { label: 'Limpiar Dibujo (Cmd+Shift+C)', accelerator: 'CmdOrCtrl+Shift+C', click: clearDrawing },
        { label: 'Resetear Todo (Cmd+Shift+R)', accelerator: 'CmdOrCtrl+Shift+R', click: resetAll },
        { type: 'separator' },
        { label: 'Lápiz (Cmd+Shift+1)', accelerator: 'CmdOrCtrl+Shift+1', click: drawPen },
        { label: 'Rectángulo (Cmd+Shift+2)', accelerator: 'CmdOrCtrl+Shift+2', click: drawRectangle },
        { label: 'Círculo (Cmd+Shift+3)', accelerator: 'CmdOrCtrl+Shift+3', click: drawCircle },
        { label: 'Borrador (Cmd+Shift+4)', accelerator: 'CmdOrCtrl+Shift+4', click: drawEraser },
        { type: 'separator' },
        { label: 'Cambiar Color (Cmd+Shift+Q)', accelerator: 'CmdOrCtrl+Shift+Q', click: changeColor },
        { label: 'Cambiar Tamaño (Cmd+Shift+W)', accelerator: 'CmdOrCtrl+Shift+W', click: changeSize },
        { type: 'separator' },
        { label: 'Deshacer (Cmd+Z)', accelerator: 'CmdOrCtrl+Z', click: undoLastAction },
        { type: 'separator' },
        { label: 'Rojo (Cmd+R)', accelerator: 'CmdOrCtrl+R', click: setRedColor },
        { label: 'Verde (Cmd+G)', accelerator: 'CmdOrCtrl+G', click: setGreenColor },
        { label: 'Azul (Cmd+B)', accelerator: 'CmdOrCtrl+B', click: setBlueColor },
        { label: 'Amarillo (Cmd+Y)', accelerator: 'CmdOrCtrl+Y', click: setYellowColor },
        { label: 'Blanco (Cmd+Shift+A)', accelerator: 'CmdOrCtrl+Shift+A', click: setWhiteColor },
        { label: 'Negro (Cmd+Shift+S)', accelerator: 'CmdOrCtrl+Shift+S', click: setBlackColor }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
