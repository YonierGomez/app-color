# Yonier Color Presenter

¡Bienvenido a Yonier Color Presenter! Esta es una app de escritorio para macOS (Electron) que te permite dibujar, anotar y resaltar en pantalla durante presentaciones, con acceso rápido a herramientas y atajos desde la barra de menú.

---

## Características principales
- Dibuja sobre la pantalla con diferentes herramientas (lápiz, rectángulo, círculo, borrador).
- Cambia color y tamaño del trazo fácilmente.
- Acceso rápido a todas las funciones desde el icono de la barra de menú (tray).
- Compatible con modo claro y oscuro de macOS.
- Atajos de teclado globales configurables.

---

## Instalación y uso rápido

1. **Clona el repositorio:**
   ```sh
   git clone https://github.com/YonierGomez/app-color.git
   cd app-color
   ```

2. **Instala las dependencias:**
   ```sh
   npm install
   ```

3. **Ejecuta en modo desarrollo:**
   ```sh
   npm start
   ```

4. **Compila la app (opcional):**
   ```sh
   npm run build
   # El instalador estará en la carpeta dist/
   ```

---

## Uso

- Al iniciar, verás un icono en la barra de menú (arriba a la derecha, junto al reloj).
- Haz clic en el icono para desplegar el menú de herramientas y atajos.
- Usa los atajos de teclado para cambiar de herramienta, color, tamaño, limpiar, deshacer, etc.

### Atajos principales

- Activar/Desactivar Dibujo: `Cmd+Shift+D`
- Limpiar Dibujo: `Cmd+Shift+C`
- Resetear Todo: `Cmd+Shift+R`
- Lápiz: `Cmd+Shift+1`
- Rectángulo: `Cmd+Shift+2`
- Círculo: `Cmd+Shift+3`
- Borrador: `Cmd+Shift+4`
- Cambiar Color: `Cmd+Shift+Q`
- Cambiar Tamaño: `Cmd+Shift+W`
- Deshacer: `Cmd+Z`

---

## Requisitos
- macOS 12+
- Node.js 18+

---

## Notas técnicas
- El icono de la bandeja debe ser PNG, 16x16, negro puro sobre fondo transparente (`assets/tray-template.png`).
- El menú contextual del icono muestra todos los atajos y herramientas.
- El menú de la app (barra superior izquierda) también incluye los atajos.

---

## Licencia
MIT

---

¡Contribuciones y sugerencias son bienvenidas!