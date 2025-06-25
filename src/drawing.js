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
        
        // Variables para mover elementos individuales
        this.elements = []; // Array para almacenar elementos dibujados
        this.selectedElement = null;
        this.isMovingElement = false;
        this.elementDragOffset = { x: 0, y: 0 };
        this.currentElementId = 0;
        this.currentEndX = 0; // Para registrar coordenadas finales
        this.currentEndY = 0;
        
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
        // Usar cursor simple para todas las herramientas
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
        } else if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'arrow') {
            // Guardar el estado actual antes de empezar el preview
            this.savePreviewState();
        } else if (this.currentTool === 'move') {
            // Herramienta de mano (drag & move)
            this.dragStartX = this.startX;
            this.dragStartY = this.startY;
            this.startHandTool();
        } else if (this.currentTool === 'moveElement') {
            // Herramienta de mover elemento individual
            this.selectElementAt(this.startX, this.startY);
        } else if (this.currentTool === 'recolor') {
            // Herramienta de recolorear - solo necesita un clic
            console.log(`🎨 Aplicando recolorear en (${this.startX}, ${this.startY}) con color ${this.currentColor}`);
            this.recolorArea(this.startX, this.startY, this.currentColor);
            this.isDrawing = false; // No necesita arrastre
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
            case 'arrow':
                this.drawArrowPreview(currentX, currentY);
                break;
            case 'move':
                this.handleHandDrag(currentX, currentY);
                break;
            case 'moveElement':
                this.handleElementMove(currentX, currentY);
                break;
            case 'recolor':
                // La herramienta de recolorear no necesita arrastre
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
        // Guardar coordenadas finales
        this.currentEndX = x;
        this.currentEndY = y;
        
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
        // Guardar coordenadas finales
        this.currentEndX = x;
        this.currentEndY = y;
        
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
    
    drawArrowPreview(x, y) {
        // Guardar coordenadas finales
        this.currentEndX = x;
        this.currentEndY = y;
        
        // Restaurar el estado guardado antes del preview
        this.restorePreviewState();
        
        // Dibujar preview de la flecha
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentSize;
        this.ctx.fillStyle = this.currentColor;
        
        // Calcular la línea principal
        const deltaX = x - this.startX;
        const deltaY = y - this.startY;
        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (length > 10) { // Solo dibujar si la flecha es lo suficientemente larga
            // Dibujar línea principal
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            
            // Calcular ángulo de la flecha
            const angle = Math.atan2(deltaY, deltaX);
            const arrowLength = Math.max(10, this.currentSize * 3);
            const arrowAngle = Math.PI / 6; // 30 grados
            
            // Puntas de la flecha
            const arrowX1 = x - arrowLength * Math.cos(angle - arrowAngle);
            const arrowY1 = y - arrowLength * Math.sin(angle - arrowAngle);
            const arrowX2 = x - arrowLength * Math.cos(angle + arrowAngle);
            const arrowY2 = y - arrowLength * Math.sin(angle + arrowAngle);
            
            // Dibujar punta de la flecha
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(arrowX1, arrowY1);
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(arrowX2, arrowY2);
            this.ctx.stroke();
        }
    }
    
    // Funciones para herramienta de mover
    // ==================== HERRAMIENTA DE MANO (DRAG & MOVE) ====================
    
    startHandTool() {
        console.log('✋ Iniciando herramienta de mano...');
        this.isDragging = true;
        this.isHandMode = true;
        
        // Guardar el contenido actual del canvas
        this.canvasImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Resetear offsets temporales
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;
    }
    
    handleHandDrag(currentX, currentY) {
        if (!this.isDragging || !this.isHandMode) return;
        
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
            console.log('💾 Estado guardado después del arrastre');
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
            
            // Manejar finalización para mover elemento individual
            if (this.currentTool === 'moveElement') {
                this.finishElementMove();
                return;
            }
            
            // Para herramientas que modifican el canvas, guardar el estado
            if (this.currentTool === 'pen' || this.currentTool === 'eraser' || 
                this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'arrow') {
                
                // Registrar elemento si es una forma geométrica
                this.registerElementOnComplete();
                
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
    
    // ==================== HERRAMIENTA DE RECOLOREAR ====================
    
    recolorArea(x, y, newColor) {
        console.log(`🎨 Iniciando recolorear en (${x}, ${y}) con color ${newColor}`);
        
        // Validar coordenadas
        const canvasX = Math.floor(x);
        const canvasY = Math.floor(y);
        
        if (canvasX < 0 || canvasX >= this.canvas.width || canvasY < 0 || canvasY >= this.canvas.height) {
            console.log('❌ Coordenadas fuera del canvas');
            return;
        }
        
        // Obtener datos de imagen del canvas
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Convertir coordenadas a índice de pixel
        const pixelIndex = (canvasY * this.canvas.width + canvasX) * 4;
        
        // Obtener color original en el punto clicado
        const originalR = data[pixelIndex];
        const originalG = data[pixelIndex + 1];
        const originalB = data[pixelIndex + 2];
        const originalA = data[pixelIndex + 3];
        
        // Validar que el pixel no sea transparente
        if (originalA === 0) {
            console.log('❌ No se puede recolorear área transparente');
            return;
        }
        
        // Convertir nuevo color hex a RGB
        const newRGB = this.hexToRgb(newColor);
        if (!newRGB) {
            console.log('❌ Color inválido');
            return;
        }
        
        // Si el color original es igual al nuevo, no hacer nada
        if (originalR === newRGB.r && originalG === newRGB.g && originalB === newRGB.b) {
            console.log('ℹ️ El color original ya es igual al nuevo color');
            return;
        }
        
        console.log(`🎯 Color original: RGB(${originalR}, ${originalG}, ${originalB}, ${originalA})`);
        console.log(`🎯 Color nuevo: RGB(${newRGB.r}, ${newRGB.g}, ${newRGB.b})`);
        
        // Algoritmo de flood fill optimizado
        const pixelsToCheck = [{ x: canvasX, y: canvasY }];
        const checkedPixels = new Set();
        let processedPixels = 0;
        
        while (pixelsToCheck.length > 0) {
            const { x: currentX, y: currentY } = pixelsToCheck.pop();
            
            // Crear clave única para el pixel
            const pixelKey = `${currentX},${currentY}`;
            
            // Si ya revisamos este pixel, continuar
            if (checkedPixels.has(pixelKey)) continue;
            checkedPixels.add(pixelKey);
            
            // Verificar límites del canvas
            if (currentX < 0 || currentX >= this.canvas.width || 
                currentY < 0 || currentY >= this.canvas.height) {
                continue;
            }
            
            // Obtener índice del pixel actual
            const currentPixelIndex = (currentY * this.canvas.width + currentX) * 4;
            
            // Verificar si el pixel actual tiene el color original exacto
            if (data[currentPixelIndex] === originalR &&
                data[currentPixelIndex + 1] === originalG &&
                data[currentPixelIndex + 2] === originalB &&
                data[currentPixelIndex + 3] === originalA) {
                
                // Cambiar el color del pixel
                data[currentPixelIndex] = newRGB.r;
                data[currentPixelIndex + 1] = newRGB.g;
                data[currentPixelIndex + 2] = newRGB.b;
                data[currentPixelIndex + 3] = originalA; // Mantener transparencia
                
                processedPixels++;
                
                // Agregar píxeles vecinos para revisar (4-conectado)
                pixelsToCheck.push({ x: currentX + 1, y: currentY });
                pixelsToCheck.push({ x: currentX - 1, y: currentY });
                pixelsToCheck.push({ x: currentX, y: currentY + 1 });
                pixelsToCheck.push({ x: currentX, y: currentY - 1 });
            }
        }
        
        // Aplicar los cambios al canvas
        this.ctx.putImageData(imageData, 0, 0);
        
        // Guardar estado
        this.saveState();
        
        console.log(`✅ Recolorear completado. Píxeles procesados: ${processedPixels}, Píxeles revisados: ${checkedPixels.size}`);
    }
    
    hexToRgb(hex) {
        // Convertir color hexadecimal a RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Función auxiliar para demostrar la herramienta
    demonstrateRecolor() {
        console.log('🎨 DEMOSTRACIÓN: Herramienta de Recolorear');
        console.log('1. Dibuja algo con un color (ej: círculo rojo)');
        console.log('2. Cambia a la herramienta de recolorear');
        console.log('3. Selecciona un color diferente (ej: azul)');
        console.log('4. Haz clic en el área roja');
        console.log('5. ¡Todo el área roja se volverá azul!');
        
        // Crear un ejemplo programático
        this.createRecolorExample();
    }
    
    createRecolorExample() {
        console.log('🎨 Creando ejemplo de recolorear...');
        
        // Dibujar un círculo rojo
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(200, 150, 50, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Dibujar un rectángulo verde
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(300, 100, 100, 100);
        
        // Dibujar algunos puntos azules
        this.ctx.fillStyle = '#0000ff';
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.arc(100 + i * 30, 300, 10, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        this.saveState();
        
        console.log('✅ Ejemplo creado: círculo rojo, rectángulo verde, puntos azules');
        console.log('💡 Ahora puedes probar la herramienta de recolorear haciendo clic en cualquier área');
        
        // Simular recolorear después de 3 segundos
        setTimeout(() => {
            console.log('🎨 SIMULANDO: Recoloreando círculo rojo a amarillo...');
            this.recolorArea(200, 150, '#ffff00');
        }, 3000);
        
        setTimeout(() => {
            console.log('🎨 SIMULANDO: Recoloreando rectángulo verde a púrpura...');
            this.recolorArea(350, 150, '#ff00ff');
        }, 5000);
        
        setTimeout(() => {
            console.log('🎨 SIMULANDO: Recoloreando puntos azules a naranja...');
            this.recolorArea(100, 300, '#ffa500');
        }, 7000);
    }
    
    // ==================== SISTEMA DE ELEMENTOS INDIVIDUALES ====================
    
    createElement(type, startX, startY, endX, endY, color, size) {
        return {
            id: ++this.currentElementId,
            type: type,
            startX: startX,
            startY: startY,
            endX: endX || startX,
            endY: endY || startY,
            color: color,
            size: size,
            bounds: this.calculateElementBounds(type, startX, startY, endX, endY, size)
        };
    }
    
    calculateElementBounds(type, startX, startY, endX, endY, size) {
        const padding = size * 2; // Padding para facilitar la selección
        
        switch (type) {
            case 'rectangle':
                const minX = Math.min(startX, endX) - padding;
                const maxX = Math.max(startX, endX) + padding;
                const minY = Math.min(startY, endY) - padding;
                const maxY = Math.max(startY, endY) + padding;
                return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
                
            case 'circle':
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY) + padding;
                return { 
                    x: startX - radius, 
                    y: startY - radius, 
                    width: radius * 2, 
                    height: radius * 2 
                };
                
            case 'arrow':
                const minArrowX = Math.min(startX, endX) - padding;
                const maxArrowX = Math.max(startX, endX) + padding;
                const minArrowY = Math.min(startY, endY) - padding;
                const maxArrowY = Math.max(startY, endY) + padding;
                return { x: minArrowX, y: minArrowY, width: maxArrowX - minArrowX, height: maxArrowY - minArrowY };
                
            default:
                return { x: startX - padding, y: startY - padding, width: padding * 2, height: padding * 2 };
        }
    }
    
    selectElementAt(x, y) {
        // Buscar elemento en las coordenadas dadas (del más reciente al más antiguo)
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            if (this.isPointInElement(x, y, element)) {
                this.selectedElement = element;
                this.isMovingElement = true;
                this.elementDragOffset = {
                    x: x - element.startX,
                    y: y - element.startY
                };
                console.log(`📦 Elemento seleccionado: ${element.type} (ID: ${element.id})`);
                this.highlightSelectedElement();
                return;
            }
        }
        
        console.log('❌ No se encontró elemento en esa posición');
        this.selectedElement = null;
        this.isMovingElement = false;
    }
    
    isPointInElement(x, y, element) {
        const bounds = element.bounds;
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    highlightSelectedElement() {
        if (!this.selectedElement) return;
        
        // Dibujar un borde punteado alrededor del elemento seleccionado
        this.ctx.save();
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const bounds = this.selectedElement.bounds;
        this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        this.ctx.restore();
    }
    
    handleElementMove(x, y) {
        if (!this.selectedElement || !this.isMovingElement) return;
        
        // Calcular nueva posición
        const newStartX = x - this.elementDragOffset.x;
        const newStartY = y - this.elementDragOffset.y;
        
        // Calcular desplazamiento
        const deltaX = newStartX - this.selectedElement.startX;
        const deltaY = newStartY - this.selectedElement.startY;
        
        // Actualizar posición del elemento
        this.selectedElement.startX = newStartX;
        this.selectedElement.startY = newStartY;
        this.selectedElement.endX += deltaX;
        this.selectedElement.endY += deltaY;
        this.selectedElement.bounds = this.calculateElementBounds(
            this.selectedElement.type,
            this.selectedElement.startX,
            this.selectedElement.startY,
            this.selectedElement.endX,
            this.selectedElement.endY,
            this.selectedElement.size
        );
        
        // Redibujar todo
        this.redrawAllElements();
    }
    
    finishElementMove() {
        if (this.selectedElement) {
            console.log(`✅ Elemento movido: ${this.selectedElement.type} (ID: ${this.selectedElement.id})`);
            this.saveState();
        }
        
        this.selectedElement = null;
        this.isMovingElement = false;
        this.elementDragOffset = { x: 0, y: 0 };
    }
    
    redrawAllElements() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redibujar todos los elementos
        this.elements.forEach(element => {
            this.drawElement(element);
        });
        
        // Resaltar elemento seleccionado
        if (this.selectedElement) {
            this.highlightSelectedElement();
        }
    }
    
    drawElement(element) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = element.color;
        this.ctx.lineWidth = element.size;
        
        switch (element.type) {
            case 'rectangle':
                const width = element.endX - element.startX;
                const height = element.endY - element.startY;
                this.ctx.beginPath();
                this.ctx.strokeRect(element.startX, element.startY, width, height);
                break;
                
            case 'circle':
                const deltaX = element.endX - element.startX;
                const deltaY = element.endY - element.startY;
                const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                this.ctx.beginPath();
                this.ctx.arc(element.startX, element.startY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
                
            case 'arrow':
                this.drawArrowElement(element);
                break;
        }
        
        this.ctx.restore();
    }
    
    drawArrowElement(element) {
        const headLength = Math.max(10, element.size * 3);
        const angle = Math.atan2(element.endY - element.startY, element.endX - element.startX);
        
        // Dibujar línea principal
        this.ctx.beginPath();
        this.ctx.moveTo(element.startX, element.startY);
        this.ctx.lineTo(element.endX, element.endY);
        this.ctx.stroke();
        
        // Dibujar punta de flecha
        this.ctx.beginPath();
        this.ctx.moveTo(element.endX, element.endY);
        this.ctx.lineTo(
            element.endX - headLength * Math.cos(angle - Math.PI / 6),
            element.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.moveTo(element.endX, element.endY);
        this.ctx.lineTo(
            element.endX - headLength * Math.cos(angle + Math.PI / 6),
            element.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.stroke();
    }

    // Modificar las funciones de stopDrawing para registrar elementos
    registerElementOnComplete() {
        if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'arrow') {
            const element = this.createElement(
                this.currentTool,
                this.startX,
                this.startY,
                this.currentEndX || this.startX,
                this.currentEndY || this.startY,
                this.currentColor,
                this.currentSize
            );
            this.elements.push(element);
            console.log(`📦 Elemento registrado: ${element.type} (ID: ${element.id})`);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
});