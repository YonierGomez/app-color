const { ipcRenderer } = require('electron');

class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        
        this.currentTool = 'pen';
        this.currentColor = '#ff0000';
        this.currentSize = 3;
        
        // Sistema de historial para deshacer
        this.history = [];
        this.historyStep = -1;
        
        // Estado para preview de formas
        this.previewState = null;
        
        // Canvas temporal para preview de formas
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
        
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
    }
    
    setupIPC() {
        // Escuchar mensajes del proceso principal
        ipcRenderer.on('set-tool', (event, data) => {
            this.currentTool = data.tool;
            this.currentColor = data.color;
            this.currentSize = data.size;
            this.updateCursor();
        });
        
        ipcRenderer.on('clear-drawing', () => {
            this.clearCanvas();
        });
        
        ipcRenderer.on('undo-action', () => {
            this.undo();
        });
    }
    
    updateCursor() {
        document.body.className = `cursor-${this.currentTool}`;
    }
    
    startDrawing(e) {
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
    
    stopDrawing(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            
            // Limpiar el estado del preview
            this.previewState = null;
            
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
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
});