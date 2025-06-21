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
  let trayIcon;
  
  console.log('Creando icono del tray...');
  
  if (process.platform === 'darwin') {
    // Intentar usar iconos del sistema macOS
    try {
      trayIcon = nativeImage.createFromNamedImage('NSImageNameColorPanel');
      if (trayIcon && !trayIcon.isEmpty()) {
        console.log('Usando icono NSImageNameColorPanel (paleta de colores del sistema)');
        trayIcon.setTemplateImage(true);
      } else {
        // Fallback a ActionTemplate
        trayIcon = nativeImage.createFromNamedImage('NSImageNameActionTemplate');
        if (trayIcon && !trayIcon.isEmpty()) {
          console.log('Usando icono NSImageNameActionTemplate');
          trayIcon.setTemplateImage(true);
        } else {
          // Fallback a TouchBarColorPickerFill
          trayIcon = nativeImage.createFromNamedImage('NSImageNameTouchBarColorPickerFill');
          if (trayIcon && !trayIcon.isEmpty()) {
            console.log('Usando icono NSImageNameTouchBarColorPickerFill');
            trayIcon.setTemplateImage(true);
          } else {
            console.log('Usando icono vacío como último recurso');
            trayIcon = nativeImage.createEmpty();
          }
        }
      }
    } catch (error) {
      console.log('Error con iconos del sistema:', error.message);
      trayIcon = nativeImage.createEmpty();
    }
  } else {
    trayIcon = nativeImage.createEmpty();
  }
  
  // Crear el tray
  try {
    tray = new Tray(trayIcon);
    tray.setToolTip('Yonier Color Presenter');
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Yonier Color Presenter',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Cmd+Shift+D - Activar/Desactivar dibujo',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+C - Limpiar pantalla',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+R - Resetear todo',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Herramientas',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+1 - Lápiz',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+2 - Rectángulo',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+3 - Círculo',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+4 - Borrador',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Colores Básicos',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+R - Rojo',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+G - Verde',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+B - Azul',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Y - Amarillo',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+A - Blanco',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+S - Negro',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Otros',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+Q - Cambiar color',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Shift+W - Cambiar tamaño',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Cmd+Z - Deshacer',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Esc - Salir del modo dibujo',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Salir',
        type: 'normal',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    console.log('Tray creado exitosamente');
    
  } catch (error) {
    console.error('Error creando tray:', error.message);
  }
}

app.whenReady().then(() => {
  console.log('Iniciando Yonier Color Presenter...');
  
  createOverlayWindow();
  createTray();

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
