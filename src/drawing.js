const { ipcRenderer } = require('electron');

class DrawingApp {
    constructor() {
        console.log('🎨 DrawingApp iniciando...');
        
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        
        this.currentTool = 'pen';
        this.currentColor = '#ff0000';
        this.currentSize = 3;
        
        // Para herramienta de texto
        this.textInput = null;
        this.isEditingText = false;
        
        // Sistema de historial para deshacer
        this.history = [];
        this.historyStep = -1;
        
        // Estado para preview de formas
        this.previewState = null;
        
        // Canvas temporal para preview de formas
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
        
        // Variables para herramienta de mano (drag & move)
        this.isHandMode = false;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.canvasImageData = null;
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupIPC();
        this.saveState(); // Guardar estado inicial
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Configurar propiedades del canvas
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Configurar canvas temporal
        this.tempCtx.lineCap = 'round';
        this.tempCtx.lineJoin = 'round';
    }
    
    resizeCanvas() {
        const oldImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.tempCanvas.width = window.innerWidth;
        this.tempCanvas.height = window.innerHeight;
        
        // Restaurar contenido después del resize
        if (oldImageData.width > 0 && oldImageData.height > 0) {
            this.ctx.putImageData(oldImageData, 0, 0);
        }
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', (e) => this.stopDrawing(e));
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events para soporte táctil
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Keyboard events para cancelar operaciones
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Cancelar operación de mano si está activa
                if (this.isHandMode) {
                    this.cancelHandDrag();
                }
            }
        });
    }
    
    setupIPC() {
        // Escuchar mensajes del proceso principal
        ipcRenderer.on('set-tool', (event, data) => {
            console.log(`🛠️ Cambiando herramienta a: ${data.tool}`);
            
            // Terminar sesión de texto si está activa
            if (this.textSession && data.tool !== 'text') {
                this.endTextSession();
            }
            
            // Cancelar operación de mover si está activa y cambiamos de herramienta
            // Cancelar operación de mano si está activa y cambia a otra herramienta
            if (data.tool !== 'move' && this.isHandMode) {
                this.cancelHandDrag();
            }
            
            this.currentTool = data.tool;
            this.currentColor = data.color;
            this.currentSize = data.size;
            
            // Hacer disponible globalmente para la captura de mouse
            window.currentTool = data.tool;
            
            this.updateCursor();
        });
        
        ipcRenderer.on('clear-drawing', () => {
            this.clearCanvas();
        });
        
        ipcRenderer.on('undo-action', () => {
            this.undo();
        });
        
        ipcRenderer.on('add-text', (event, data) => {
            this.addTextToCanvas(data.text, data.color, data.size, data.x, data.y);
        });

        ipcRenderer.on('create-inline-text', (event, data) => {
            console.log(`📨 IPC 'create-inline-text' recibido:`, data);
            this.createInlineTextInput(data.x, data.y, data.color, data.size);
        });
    }
    
    updateCursor() {
        document.body.className = `cursor-${this.currentTool}`;
    }
    
    startDrawing(e) {
        console.log(`🖱️ startDrawing llamado - Herramienta actual: ${this.currentTool}`);
        
        // La herramienta de texto ahora se maneja globalmente desde main.js
        if (this.currentTool === 'text') {
            console.log('� Herramienta texto - manejada por captura global');
            return; // No procesar como dibujo normal
        }
        
        this.isDrawing = true;
        
        // Obtener coordenadas relativas al canvas
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        if (this.currentTool === 'pen') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle') {
            // Guardar el estado actual antes de empezar el preview
            this.savePreviewState();
        } else if (this.currentTool === 'move') {
            // Herramienta de mano (drag & move)
            this.dragStartX = this.startX;
            this.dragStartY = this.startY;
            this.startHandTool();
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        // Obtener coordenadas relativas al canvas
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        switch (this.currentTool) {
            case 'pen':
                this.drawPen(currentX, currentY);
                break;
            case 'eraser':
                this.drawEraser(currentX, currentY);
                break;
            case 'rectangle':
                this.drawRectanglePreview(currentX, currentY);
                break;
            case 'circle':
                this.drawCirclePreview(currentX, currentY);
                break;
            case 'move':
                this.handleHandDrag(currentX, currentY);
                break;
            case 'text':
                // El texto se maneja con clicks, no con arrastre
                break;
        }
    }
    
    drawPen(x, y) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }
    
    drawEraser(x, y) {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.currentSize * 2, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawRectanglePreview(x, y) {
        // Restaurar el estado guardado antes del preview
        this.restorePreviewState();
        
        // Dibujar preview del rectángulo
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        
        const width = x - this.startX;
        const height = y - this.startY;
        
        this.ctx.beginPath();
        this.ctx.strokeRect(this.startX, this.startY, width, height);
    }
    
    drawCirclePreview(x, y) {
        // Restaurar el estado guardado antes del preview
        this.restorePreviewState();
        
        // Calcular radio para círculo perfecto
        const deltaX = x - this.startX;
        const deltaY = y - this.startY;
        const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Dibujar preview del círculo
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        
        this.ctx.beginPath();
        this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    // Funciones para herramienta de mover
    // ==================== HERRAMIENTA DE MANO (DRAG & MOVE) ====================
    
    startHandTool() {
        console.log('✋ Iniciando herramienta de mano...');
        this.isDragging = true;
        this.isHandMode = true;
        
        // Guardar el contenido actual del canvas
        this.canvasImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Cambiar cursor a mano
        this.canvas.style.cursor = 'grab';
        
        // Resetear offsets temporales
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;
    }
    
    handleHandDrag(currentX, currentY) {
        if (!this.isDragging || !this.isHandMode) return;
        
        // Cambiar cursor mientras arrastra
        this.canvas.style.cursor = 'grabbing';
        
        // Calcular desplazamiento desde el punto inicial
        const deltaX = currentX - this.dragStartX;
        const deltaY = currentY - this.dragStartY;
        
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redibujar el contenido original desplazado
        if (this.canvasImageData) {
            this.ctx.putImageData(this.canvasImageData, deltaX, deltaY);
        }
        
        // Actualizar offsets temporales
        this.tempOffsetX = deltaX;
        this.tempOffsetY = deltaY;
        
        console.log(`🖐️ Arrastrando: deltaX=${deltaX}, deltaY=${deltaY}`);
    }
    
    finishHandDrag() {
        if (!this.isDragging || !this.isHandMode) return;
        
        console.log(`✅ Finalizando arrastre de mano con offset: X=${this.tempOffsetX}, Y=${this.tempOffsetY}`);
        
        // Si hubo movimiento, guardar el nuevo estado
        if (this.tempOffsetX !== 0 || this.tempOffsetY !== 0) {
            // El canvas ya tiene el contenido en la nueva posición
            this.saveState();
            console.log('� Estado guardado después del arrastre');
        } else {
            // Si no hubo movimiento, restaurar el estado original
            if (this.canvasImageData) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.putImageData(this.canvasImageData, 0, 0);
            }
            console.log('↩️ Sin movimiento, estado restaurado');
        }
        
        // Limpiar estado de arrastre
        this.isDragging = false;
        this.isHandMode = false;
        this.canvasImageData = null;
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;
        
        // Restaurar cursor
        this.canvas.style.cursor = 'default';
        
        console.log('✋ Herramienta de mano finalizada');
    }
    
    cancelHandDrag() {
        if (!this.isHandMode) return;
        
        console.log('❌ Cancelando arrastre de mano...');
        
        // Restaurar el contenido original
        if (this.canvasImageData) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.putImageData(this.canvasImageData, 0, 0);
        }
        
        // Limpiar estado
        this.isDragging = false;
        this.isHandMode = false;
        this.canvasImageData = null;
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;
        
        // Restaurar cursor
        this.canvas.style.cursor = 'default';
        
        console.log('✅ Arrastre de mano cancelado');
    }
    
    startTextInput(e) {
        if (this.isEditingText) return;
        
        // Obtener coordenadas relativas al canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.isEditingText = true;
        
        // Crear input de texto temporal
        this.textInput = document.createElement('input');
        this.textInput.type = 'text';
        this.textInput.style.position = 'absolute';
        this.textInput.style.left = (x + rect.left) + 'px';
        this.textInput.style.top = (y + rect.top - 20) + 'px';
        this.textInput.style.fontSize = (this.currentSize * 8) + 'px';
        this.textInput.style.color = this.currentColor;
        this.textInput.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        this.textInput.style.border = '2px solid ' + this.currentColor;
        this.textInput.style.borderRadius = '4px';
        this.textInput.style.padding = '2px 6px';
        this.textInput.style.zIndex = '10000';
        this.textInput.placeholder = 'Escribe aquí...';
        
        document.body.appendChild(this.textInput);
        this.textInput.focus();
        
        // Manejar cuando termine de escribir
        this.textInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.finishTextInput(x, y);
            } else if (event.key === 'Escape') {
                this.cancelTextInput();
            }
        });
        
        // Manejar cuando pierda el foco
        this.textInput.addEventListener('blur', () => {
            setTimeout(() => this.finishTextInput(x, y), 100);
        });
    }
    
    finishTextInput(x, y) {
        if (!this.textInput || !this.isEditingText) return;
        
        const text = this.textInput.value.trim();
        
        if (text) {
            // Dibujar el texto en el canvas
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = this.currentColor;
            this.ctx.font = `${this.currentSize * 8}px Arial, sans-serif`;
            this.ctx.fillText(text, x, y);
            
            // Guardar estado después de añadir texto
            this.saveState();
            console.log(`✏️ Texto añadido: "${text}"`);
        }
        
        this.cancelTextInput();
    }
    
    cancelTextInput() {
        if (this.textInput) {
            document.body.removeChild(this.textInput);
            this.textInput = null;
        }
        this.isEditingText = false;
    }
    
    stopDrawing(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            
            // Limpiar el estado del preview
            this.previewState = null;
            
            // Manejar finalización para herramienta de mano
            if (this.currentTool === 'move') {
                this.finishHandDrag();
                return;
            }
            
            // Para herramientas que modifican el canvas, guardar el estado
            if (this.currentTool === 'pen' || this.currentTool === 'eraser' || 
                this.currentTool === 'rectangle' || this.currentTool === 'circle') {
                this.saveState();
            }
        }
    }
    
    restoreCanvas() {
        if (this.history.length > 0 && this.historyStep >= 0) {
            const imageData = this.history[this.historyStep];
            this.ctx.putImageData(imageData, 0, 0);
        }
    }
    
    savePreviewState() {
        // Guardar el estado actual del canvas para restaurar durante el preview
        this.previewState = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
    
    restorePreviewState() {
        // Restaurar el estado guardado antes del preview
        if (this.previewState) {
            this.ctx.putImageData(this.previewState, 0, 0);
        }
    }
    
    saveState() {
        // Eliminar estados futuros si estamos en el medio del historial
        if (this.historyStep < this.history.length - 1) {
            this.history.length = this.historyStep + 1;
        }
        
        // Guardar estado actual
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.history.push(imageData);
        this.historyStep++;
        
        // Limitar historial a 50 estados para no consumir mucha memoria
        if (this.history.length > 50) {
            this.history.shift();
            this.historyStep--;
        }
    }
    
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const imageData = this.history[this.historyStep];
            this.ctx.putImageData(imageData, 0, 0);
            console.log('↩️ Acción deshecha');
        } else {
            console.log('❌ No hay más acciones que deshacer');
        }
    }
    
    clearCanvas() {
        // Cancelar cualquier edición de texto en progreso
        this.cancelTextInput();
        
        // Limpiar el canvas principal
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Limpiar también el estado de preview si existe
        this.previewState = null;
        
        // Limpiar el canvas temporal
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        
        // Resetear el historial completamente
        this.history = [];
        this.historyStep = -1;
        
        // Guardar el estado limpio como punto inicial
        this.saveState();
        
        console.log('🧹 Canvas completamente limpio - Historial reseteado');
    }
    
    addTextToCanvas(text, color, size, x, y) {
        // Usar las coordenadas proporcionadas, o el centro si no se proporcionan
        const textX = x !== undefined ? x : this.canvas.width / 2;
        const textY = y !== undefined ? y : this.canvas.height / 2;
        
        // Configurar propiedades del texto para mejor visibilidad
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = color;
        this.ctx.font = `bold ${size * 8}px Arial, sans-serif`;
        this.ctx.textAlign = 'left'; // Cambiar a left para posicionamiento más preciso
        this.ctx.textBaseline = 'top'; // Cambiar a top para mejor control
        
        // Agregar sombra para mejor visibilidad
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        // Dibujar el texto
        this.ctx.fillText(text, textX, textY);
        
        // Limpiar sombra
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Resetear alineación para otros elementos
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'alphabetic';
        
        // Guardar estado después de añadir texto
        this.saveState();
        
        console.log(`✏️ Texto agregado en (${textX}, ${textY}): "${text}" (${color}, tamaño ${size})`);
    }
    
    createInlineTextInput(x, y, color, size) {
        console.log(`📝 INICIO createInlineTextInput(${x}, ${y}, ${color}, ${size})`);
        console.log(`📝 Iniciando texto directo en pantalla en (${x}, ${y})`);
        
        // Terminar cualquier sesión de texto anterior
        this.endTextSession();
        
        // PRUEBA INMEDIATA: Agregar listener de prueba
        this.testKeyListener = (e) => {
            console.log(`🧪 TEST EVENTO TECLADO: "${e.key}" (código: ${e.keyCode})`);
        };
        document.addEventListener('keydown', this.testKeyListener);
        window.addEventListener('keydown', this.testKeyListener);
        console.log('🧪 Listener de prueba agregado');
        
        // FORZAR FOCO MÚLTIPLE
        console.log('🎯 Intentando forzar foco en múltiples elementos...');
        
        // Foco en canvas
        if (this.canvas) {
            this.canvas.focus();
            console.log('🎯 Foco en canvas');
        }
        
        // Foco en body
        if (document.body) {
            document.body.focus();
            console.log('🎯 Foco en body');
        }
        
        // Foco en window
        window.focus();
        console.log('🎯 Foco en window');
        
        // Verificar estado de foco
        console.log('🔍 document.hasFocus():', document.hasFocus());
        console.log('🔍 document.activeElement:', document.activeElement);
        console.log('🔍 document.activeElement.tagName:', document.activeElement?.tagName);
        
        // Configurar sesión de texto directo
        this.textSession = {
            x: x,
            y: y,
            color: color,
            size: size,
            text: '',
            active: true,
            cursorVisible: true
        };
        
        // Dibujar cursor inicial
        this.drawTextCursor();
        
        // Configurar captura de teclado
        this.setupTextKeyboard();
        
        // Parpadeo del cursor
        this.startCursorBlink();
        
        console.log(`✅ Modo texto directo activado en (${x}, ${y})`);
        
        // TEST: Simular tecla después de 2 segundos
        setTimeout(() => {
            console.log('🧪 Simulando evento de teclado...');
            const testEvent = new KeyboardEvent('keydown', {
                key: 'A',
                code: 'KeyA',
                keyCode: 65,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(testEvent);
        }, 2000);
    }
     setupTextKeyboard() {
        console.log('⌨️ INICIANDO setupTextKeyboard');
        
        // Remover listeners anteriores
        if (this.textKeydownHandler) {
            document.removeEventListener('keydown', this.textKeydownHandler);
        }

        this.textKeydownHandler = (e) => {
            console.log(`🔥 EVENTO TECLADO DETECTADO: "${e.key}"`);
            
            if (!this.textSession || !this.textSession.active) {
                console.log('❌ No hay sesión de texto activa');
                return;
            }
            
            e.preventDefault();
            
            if (e.key === 'Enter') {
                console.log('✅ Enter presionado - finalizando texto');
                this.finalizeTextSession();
            } else if (e.key === 'Escape') {
                console.log('❌ Escape presionado - cancelando texto');
                this.cancelTextSession();
            } else if (e.key === 'Backspace') {
                console.log('⬅️ Backspace presionado');
                this.textSession.text = this.textSession.text.slice(0, -1);
                this.redrawTextSession();
            } else if (e.key.length === 1) {
                // Solo caracteres imprimibles
                console.log(`✏️ Agregando carácter: "${e.key}"`);
                this.textSession.text += e.key;
                this.redrawTextSession();
            }
            
            console.log(`⌨️ Tecla: "${e.key}", Texto actual: "${this.textSession.text}"`);
        };

        // Agregar listener al documento
        document.addEventListener('keydown', this.textKeydownHandler);
        console.log('✅ Listener de teclado agregado al documento');
        
        // También intentar en window por si acaso
        window.addEventListener('keydown', this.textKeydownHandler);
        console.log('✅ Listener de teclado agregado a window');
        
        // Verificar si el documento tiene foco
        console.log('🔍 document.hasFocus():', document.hasFocus());
        console.log('🔍 document.activeElement:', document.activeElement);
        
        // Forzar foco en el documento
        if (document.body) {
            document.body.focus();
            console.log('🎯 Foco forzado en document.body');
        }
    }
    
    drawTextCursor() {
        if (!this.textSession) return;
        
        const { x, y, color, size, text } = this.textSession;
        
        // Medir ancho del texto actual para posicionar cursor
        this.ctx.font = `bold ${size * 8}px Arial, sans-serif`;
        const textWidth = this.ctx.measureText(text).width;
        
        // Dibujar cursor si es visible
        if (this.textSession.cursorVisible) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x + textWidth, y);
            this.ctx.lineTo(x + textWidth, y + (size * 8));
            this.ctx.stroke();
        }
    }
    
    redrawTextSession() {
        if (!this.textSession) return;
        
        // Limpiar área anterior y redibujar todo
        this.clearTextArea();
        this.drawCurrentText();
        this.drawTextCursor();
    }
    
    drawCurrentText() {
        if (!this.textSession || !this.textSession.text) return;
        
        const { x, y, color, size, text } = this.textSession;
        
        // Configurar estilo de texto
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = color;
        this.ctx.font = `bold ${size * 8}px Arial, sans-serif`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // Dibujar el texto actual
        this.ctx.fillText(text, x, y);
    }
    
    clearTextArea() {
        if (!this.textSession) return;
        
        const { x, y, size, text } = this.textSession;
        
        // Estimar área a limpiar
        this.ctx.font = `bold ${size * 8}px Arial, sans-serif`;
        const textWidth = Math.max(this.ctx.measureText(text + 'M').width, 100);
        const textHeight = size * 8 + 10;
        
        // Limpiar área específica
        this.ctx.clearRect(x - 5, y - 5, textWidth + 10, textHeight + 10);
    }
    
    startCursorBlink() {
        if (this.cursorBlinkInterval) {
            clearInterval(this.cursorBlinkInterval);
        }
        
        this.cursorBlinkInterval = setInterval(() => {
            if (this.textSession && this.textSession.active) {
                this.textSession.cursorVisible = !this.textSession.cursorVisible;
                this.redrawTextSession();
            }
        }, 500);
    }
    
    finalizeTextSession() {
        if (!this.textSession) return;
        
        const { text, x, y, color, size } = this.textSession;
        
        if (text.trim()) {
            console.log(`✏️ Finalizando texto: "${text}" en (${x}, ${y})`);
            
            // El texto ya está dibujado, solo guardar estado
            this.saveState();
            
            // Notificar al proceso principal
            const { ipcRenderer } = require('electron');
            ipcRenderer.send('inline-text-completed', {
                text: text,
                x: x,
                y: y,
                color: color,
                size: size
            });
        } else {
            console.log(`❌ Texto vacío, cancelando`);
            this.clearTextArea();
        }
        
        this.endTextSession();
    }
    
    cancelTextSession() {
        console.log('❌ Sesión de texto cancelada');
        if (this.textSession) {
            this.clearTextArea();
        }
        this.endTextSession();
    }
    
    endTextSession() {
        console.log('🔚 TERMINANDO sesión de texto');
        
        // Limpiar sesión de texto
        this.textSession = null;
        
        // Remover captura de teclado de ambos lugares
        if (this.textKeydownHandler) {
            document.removeEventListener('keydown', this.textKeydownHandler);
            window.removeEventListener('keydown', this.textKeydownHandler);
            this.textKeydownHandler = null;
            console.log('🗑️ Listeners de teclado removidos');
        }
        
        // Remover listener de prueba
        if (this.testKeyListener) {
            document.removeEventListener('keydown', this.testKeyListener);
            window.removeEventListener('keydown', this.testKeyListener);
            this.testKeyListener = null;
            console.log('🗑️ Listener de prueba removido');
        }
        
        // Detener parpadeo del cursor
        if (this.cursorBlinkInterval) {
            clearInterval(this.cursorBlinkInterval);
            this.cursorBlinkInterval = null;
            console.log('⏹️ Parpadeo del cursor detenido');
        }
    }
    
    // ...existing code...
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
});