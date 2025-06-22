const { app, BrowserWindow, globalShortcut, Menu, screen, Tray, nativeImage, ipcMain } = require('electron');
const path = require('path');
const ShortcutConfig = require('./shortcut-config');

let overlayWindow;
let configWindow;
let tray = null;
let isDrawingMode = false;
let shortcutConfig;

// Estados iniciales (se resetean al desactivar dibujo)
let currentTool = 'rectangle';
let currentColor = '#ff0000';
let currentSize = 3;

// Colores disponibles para el ciclo automático
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000', '#ff8000', '#8000ff', '#ff0080', '#808080'];
let colorIndex = 0;

// Tamaños disponibles
const sizes = [2, 3, 5, 8, 12];
let sizeIndex = 1;

// Colores básicos predefinidos expandidos
const basicColors = {
  red: '#ff0000',
  green: '#00ff00', 
  blue: '#0000ff',
  yellow: '#ffff00',
  magenta: '#ff00ff',
  cyan: '#00ffff',
  white: '#ffffff',
  black: '#000000',
  orange: '#ff8000',
  purple: '#8000ff',
  pink: '#ff0080',
  gray: '#808080',
  lightGray: '#c0c0c0',
  darkGray: '#404040',
  brown: '#804000',
  lime: '#80ff00'
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
  const colorNames = ['Rojo', 'Verde', 'Azul', 'Amarillo', 'Magenta', 'Cian', 'Blanco', 'Negro', 'Naranja', 'Púrpura', 'Rosa', 'Gris'];
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

function moveTool() {
  currentTool = 'move';
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Herramienta: Mover dibujos');
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

function setOrangeColor() {
  currentColor = basicColors.orange;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Naranja');
}

function setPurpleColor() {
  currentColor = basicColors.purple;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Púrpura');
}

function setPinkColor() {
  currentColor = basicColors.pink;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Rosa');
}

function setGrayColor() {
  currentColor = basicColors.gray;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Gris');
}

function setLightGrayColor() {
  currentColor = basicColors.lightGray;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Gris Claro');
}

function setDarkGrayColor() {
  currentColor = basicColors.darkGray;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Gris Oscuro');
}

function setBrownColor() {
  currentColor = basicColors.brown;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Marrón');
}

function setLimeColor() {
  currentColor = basicColors.lime;
  colorIndex = colors.indexOf(currentColor) >= 0 ? colors.indexOf(currentColor) : 0;
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Lima');
}

function setMagentaColor() {
  currentColor = basicColors.magenta;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Magenta');
}

function setCyanColor() {
  currentColor = basicColors.cyan;
  colorIndex = colors.indexOf(currentColor);
  if (overlayWindow && isDrawingMode) {
    overlayWindow.webContents.send('set-tool', { tool: currentTool, color: currentColor, size: currentSize });
  }
  console.log('Color establecido: Cian');
}

// Función para abrir la ventana de configuración de atajos
function openShortcutsConfig() {
  if (configWindow && !configWindow.isDestroyed()) {
    configWindow.focus();
    return;
  }

  configWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    title: 'Configuración de Atajos - Yonier Color Presenter',
    icon: path.join(__dirname, '..', 'assets', 'tray-template.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });

  configWindow.loadFile('src/shortcuts-config.html');
  
  configWindow.once('ready-to-show', () => {
    configWindow.show();
  });

  configWindow.on('closed', () => {
    configWindow = null;
  });
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
      { label: 'Lápiz (Cmd+Alt+P)', click: drawPen },
      { label: 'Rectángulo (Cmd+Alt+R)', click: drawRectangle },
      { label: 'Círculo (Cmd+Alt+C)', click: drawCircle },
      { label: 'Borrador (Cmd+Alt+E)', click: drawEraser },
      { label: 'Mover (Cmd+Alt+M)', click: moveTool }
    ]},
    { label: 'Colores Básicos', submenu: [
      { label: 'Rojo (Option+1)', click: setRedColor },
      { label: 'Verde (Option+2)', click: setGreenColor },
      { label: 'Azul (Option+3)', click: setBlueColor },
      { label: 'Amarillo (Option+4)', click: setYellowColor },
      { label: 'Blanco (Option+5)', click: setWhiteColor },
      { label: 'Negro (Option+6)', click: setBlackColor }
    ]},
    { label: 'Colores Adicionales', submenu: [
      { label: 'Naranja (Option+7)', click: setOrangeColor },
      { label: 'Púrpura (Option+8)', click: setPurpleColor },
      { label: 'Rosa (Option+9)', click: setPinkColor },
      { label: 'Magenta (Option+0)', click: setMagentaColor },
      { label: 'Cian (Cmd+Alt+1)', click: setCyanColor },
      { label: 'Lima (Cmd+Alt+2)', click: setLimeColor },
      { label: 'Marrón (Cmd+Alt+3)', click: setBrownColor },
      { label: 'Gris (Cmd+Alt+4)', click: setGrayColor },
      { label: 'Gris Claro (Cmd+Alt+5)', click: setLightGrayColor },
      { label: 'Gris Oscuro (Cmd+Alt+6)', click: setDarkGrayColor }
    ]},
    { type: 'separator' },
    { label: 'Cambiar Color (Cmd+Alt+Q)', click: changeColor },
    { label: 'Cambiar Tamaño (Cmd+Alt+W)', click: changeSize },
    { type: 'separator' },
    { label: 'Limpiar Dibujo (Cmd+Shift+C)', click: clearDrawing },
    { label: 'Deshacer (Cmd+Z)', click: undoLastAction },
    { label: 'Resetear Todo (Cmd+Shift+R)', click: resetAll },
    { type: 'separator' },
    { label: '⚙️ Configurar Atajos', click: openShortcutsConfig },
    { type: 'separator' },
    { label: 'Salir', click: () => app.quit() }
  ]);
  tray.setToolTip('Yonier Color Presenter');
  tray.setContextMenu(contextMenu);
}

function registerShortcuts() {
  // Desregistrar atajos existentes
  globalShortcut.unregisterAll();

  // Crear mapa de funciones
  const functionMap = {
    control: {
      toggleDrawingMode: toggleDrawingMode,
      clearDrawing: clearDrawing,
      resetAll: resetAll,
      undoLastAction: undoLastAction,
      exitDrawingMode: () => {
        if (isDrawingMode) {
          toggleDrawingMode();
        }
      }
    },
    tools: {
      drawPen: drawPen,
      drawRectangle: drawRectangle,
      drawCircle: drawCircle,
      drawEraser: drawEraser,
      moveTool: moveTool,
      changeColor: changeColor,
      changeSize: changeSize
    },
    basicColors: {
      setRedColor: setRedColor,
      setGreenColor: setGreenColor,
      setBlueColor: setBlueColor,
      setYellowColor: setYellowColor,
      setWhiteColor: setWhiteColor,
      setBlackColor: setBlackColor
    },
    additionalColors: {
      setOrangeColor: setOrangeColor,
      setPurpleColor: setPurpleColor,
      setPinkColor: setPinkColor,
      setMagentaColor: setMagentaColor,
      setCyanColor: setCyanColor,
      setLimeColor: setLimeColor,
      setBrownColor: setBrownColor,
      setGrayColor: setGrayColor,
      setLightGrayColor: setLightGrayColor,
      setDarkGrayColor: setDarkGrayColor
    }
  };

  // Registrar atajos dinámicamente desde la configuración
  const shortcuts = shortcutConfig.getAllShortcuts();
  let registeredCount = 0;

  Object.entries(shortcuts).forEach(([category, actions]) => {
    Object.entries(actions).forEach(([action, shortcut]) => {
      try {
        const func = functionMap[category]?.[action];
        if (func && shortcut) {
          const success = globalShortcut.register(shortcut, func);
          if (success) {
            registeredCount++;
          } else {
            console.warn(`⚠️ No se pudo registrar atajo: ${shortcut} para ${category}.${action}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error registrando atajo ${shortcut}:`, error.message);
      }
    });
  });

  console.log(`✅ ${registeredCount} atajos registrados exitosamente`);
  console.log('=== ATAJOS ACTIVOS ===');
  
  // Mostrar atajos registrados organizados por categoría
  const categories = {
    control: '🎮 CONTROL',
    tools: '🛠️ HERRAMIENTAS',
    basicColors: '🎨 COLORES BÁSICOS',
    additionalColors: '🌈 COLORES ADICIONALES'
  };

  Object.entries(categories).forEach(([category, title]) => {
    console.log(title);
    const actions = shortcuts[category] || {};
    Object.entries(actions).forEach(([action, shortcut]) => {
      const description = shortcutConfig.getDescription(category, action);
      console.log(`${shortcut} - ${description}`);
    });
    console.log('');
  });

  console.log('💡 Tip: Ve a "Configuración de Atajos" para personalizar todos los atajos');
}

app.whenReady().then(() => {
  console.log('Iniciando Yonier Color Presenter...');

  // Inicializar configuración de atajos
  shortcutConfig = new ShortcutConfig();

  createOverlayWindow();
  createTray();
  registerShortcuts();

  // Registrar manejadores IPC para configuración de atajos
  ipcMain.handle('get-shortcuts-config', () => {
    return shortcutConfig.config;
  });

  ipcMain.handle('save-shortcuts-config', (event, newConfig) => {
    shortcutConfig.config = newConfig;
    const success = shortcutConfig.saveUserConfig();
    if (success) {
      // Re-registrar atajos con la nueva configuración
      registerShortcuts();
    }
    return success;
  });

  ipcMain.handle('reset-shortcuts-to-default', () => {
    const success = shortcutConfig.resetToDefault();
    if (success) {
      // Re-registrar atajos con la configuración por defecto
      registerShortcuts();
    }
    return success;
  });

  ipcMain.handle('close-shortcuts-config', () => {
    if (configWindow && !configWindow.isDestroyed()) {
      configWindow.close();
    }
  });

  // Menú de aplicación con listado de atajos
  const template = [
    {
      label: 'Yonier Color Presenter',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: '⚙️ Configurar Atajos', click: openShortcutsConfig },
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
        { label: 'Lápiz (Cmd+Alt+P)', accelerator: 'CmdOrCtrl+Alt+P', click: drawPen },
        { label: 'Rectángulo (Cmd+Alt+R)', accelerator: 'CmdOrCtrl+Alt+R', click: drawRectangle },
        { label: 'Círculo (Cmd+Alt+C)', accelerator: 'CmdOrCtrl+Alt+C', click: drawCircle },
        { label: 'Borrador (Cmd+Alt+E)', accelerator: 'CmdOrCtrl+Alt+E', click: drawEraser },
        { label: 'Mover (Cmd+Alt+M)', accelerator: 'CmdOrCtrl+Alt+M', click: moveTool },
        { type: 'separator' },
        { label: 'Cambiar Color (Cmd+Alt+Q)', accelerator: 'CmdOrCtrl+Alt+Q', click: changeColor },
        { label: 'Cambiar Tamaño (Cmd+Alt+W)', accelerator: 'CmdOrCtrl+Alt+W', click: changeSize },
        { type: 'separator' },
        { label: 'Deshacer (Cmd+Z)', accelerator: 'CmdOrCtrl+Z', click: undoLastAction },
        { type: 'separator' },
        { label: '⚙️ Personalizar Todos los Atajos', click: openShortcutsConfig }
      ]
    },
    {
      label: 'Colores Básicos',
      submenu: [
        { label: 'Rojo (Option+1)', accelerator: 'Alt+1', click: setRedColor },
        { label: 'Verde (Option+2)', accelerator: 'Alt+2', click: setGreenColor },
        { label: 'Azul (Option+3)', accelerator: 'Alt+3', click: setBlueColor },
        { label: 'Amarillo (Option+4)', accelerator: 'Alt+4', click: setYellowColor },
        { label: 'Blanco (Option+5)', accelerator: 'Alt+5', click: setWhiteColor },
        { label: 'Negro (Option+6)', accelerator: 'Alt+6', click: setBlackColor }
      ]
    },
    {
      label: 'Colores Adicionales',
      submenu: [
        { label: 'Naranja (Option+7)', accelerator: 'Alt+7', click: setOrangeColor },
        { label: 'Púrpura (Option+8)', accelerator: 'Alt+8', click: setPurpleColor },
        { label: 'Rosa (Option+9)', accelerator: 'Alt+9', click: setPinkColor },
        { label: 'Magenta (Option+0)', accelerator: 'Alt+0', click: setMagentaColor },
        { label: 'Cian (Cmd+Alt+1)', accelerator: 'CmdOrCtrl+Alt+1', click: setCyanColor },
        { label: 'Lima (Cmd+Alt+2)', accelerator: 'CmdOrCtrl+Alt+2', click: setLimeColor },
        { type: 'separator' },
        { label: 'Marrón (Cmd+Alt+3)', accelerator: 'CmdOrCtrl+Alt+3', click: setBrownColor },
        { label: 'Gris (Cmd+Alt+4)', accelerator: 'CmdOrCtrl+Alt+4', click: setGrayColor },
        { label: 'Gris Claro (Cmd+Alt+5)', accelerator: 'CmdOrCtrl+Alt+5', click: setLightGrayColor },
        { label: 'Gris Oscuro (Cmd+Alt+6)', accelerator: 'CmdOrCtrl+Alt+6', click: setDarkGrayColor }
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
