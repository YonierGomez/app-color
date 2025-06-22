# 🎨 Yonier Color Presenter

¡Hola! 👋 ¿Necesitas dibujar sobre tu pantalla durante una presentación? ¡Esta app es perfecta para ti! 

**Yonier Color Presenter** es una aplicación súper fácil de usar para macOS que te permite dibujar, anotar y resaltar cualquier cosa en tu pantalla. Perfecta para profesores, presentadores o cualquiera que quiera hacer sus explicaciones más visuales. 📚✨

---

## 🎉 ¡Novedades v1.3.1!

### 🪣 **¡Nueva Herramienta de Recolorear (Balde de Pintura)!**
¡La funcionalidad más solicitada por los usuarios ya está aquí!
- 🪣 **Flood Fill inteligente** - Cambia todos los píxeles del mismo color conectados con un solo clic
- 🎯 **Un solo clic** - Selecciona el área y ¡automáticamente cambia todo el color conectado!
- 🌈 **Preserva bordes** - Solo cambia el área seleccionada, respeta los límites de otras formas
- ⚡ **Súper rápido** - Perfecto para corregir colores o crear variaciones durante presentaciones
- 🔄 **Integrado con deshacer** - Los cambios se pueden deshacer con `Cmd+Z`
- ⌨️ **Atajo rápido** - Activa con `Cmd+Alt+B` (B de "Balde")

### ✋ **¡Herramienta de Mano mejorada!**
Arrastra y mueve tu dibujo completo por la pantalla:
- 🖱️ **Drag & Drop en tiempo real** - Arrastra tu dibujo completo libremente
- 👆 **Feedback visual** - El cursor cambia a una "mano" cuando estás moviendo
- ⎋ **Cancelación fácil** - Presiona Escape para cancelar el movimiento
- 🔄 **Integrado con deshacer/rehacer** - Los movimientos se pueden deshacer

### 🎨 **¡Paleta de colores expandida!**
Ahora tienes **16 colores diferentes** con atajos rápidos:
- 6 colores básicos (rojo, verde, azul, amarillo, blanco, negro)
- 10 colores adicionales (naranja, púrpura, rosa, magenta, cian, lima, marrón, y 3 tonos de gris)
- 🔤 **Atajos con letras** - `Option+R` (rojo), `Option+G` (verde), `Option+B` (azul), etc.

### ⌨️ **Atajos súper intuitivos (seguros para macOS):**
- Herramientas: `Cmd + Alt + letra` (P=lápiz, R=rectángulo, M=mover, B=recolorear, etc.)
- Colores básicos: `Option + número` (1-6) ← ¡Ya no conflicta con capturas!
- Colores adicionales: `Option + número` (7-0) y `Cmd + Alt + número` (1-6)
- Colores con letras: `Option + letra` (R=rojo, G=verde, B=azul, etc.)
- ¡Perfecto para cambios rápidos durante presentaciones sin interferir con el sistema!  

Todo desde un pequeño icono en tu barra de menú - ¡súper discreto! 🤫

---

## 🚀 ¿Cómo empezar?

### � ¡Descarga directa para macOS!

**¿Solo quieres usar la app sin complicaciones?** 

👉 **[Descargar Yonier Color Presenter v1.3.1 (.dmg)](https://github.com/YonierGomez/app-color/releases/download/v1.3.1/Yonier-Color-Presenter-v1.3.1-macOS.dmg)**

1. 📥 Haz clic en el enlace de arriba
2. 📂 Abre el archivo .dmg descargado  
3. 🖱️ Arrastra la app a tu carpeta Aplicaciones
4. 🎨 ¡Listo para dibujar!

### 👨‍💻 ¿Prefieres instalación desde código?

### �📥 Instalación súper fácil:

1. **Descarga el proyecto:**
   ```bash
   git clone https://github.com/YonierGomez/app-color.git
   cd app-color
   ```

2. **Instala lo necesario:**
   ```bash
   npm install
   ```

3. **¡A dibujar!**
   ```bash
   npm start
   ```

4. **¿Quieres crear un instalador? (opcional):**
   ```bash
   ./build.sh
   # Tu instalador estará listo en la carpeta dist/ 📦
   ```

---

## 🎯 ¿Cómo se usa?

Es súper simple:

1. 👀 **Busca el icono** en tu barra de menú (arriba a la derecha, cerca del reloj)
2. 🖱️ **Haz clic** para ver todas las opciones
3. ✏️ **Activa el modo dibujo** con `Cmd+Shift+D`
4. 🎨 **¡Empieza a dibujar!**

### 🪣 ¿Cómo usar la herramienta de recolorear?

La herramienta de recolorear funciona como un **"balde de pintura"** inteligente:

1. **Dibuja algo** con cualquier herramienta (lápiz, rectángulo, círculo)
2. **Selecciona la herramienta de recolorear:** `Cmd+Alt+B`
3. **Elige un color nuevo** (ej: `Option+R` para rojo)
4. **Haz clic** en el área que quieres cambiar
5. **¡Magia!** 🪄 - Toda el área del mismo color se cambia automáticamente

**Ejemplos de uso:**
- 🎯 Cambiar el color de fondo de un dibujo
- 🖼️ Recolorear objetos sin redibujar
- 🌈 Crear variaciones rápidas de color
- ✏️ Corregir errores de color al instante

> **💡 Tip:** La herramienta solo cambia píxeles **conectados** del mismo color, preservando los bordes y detalles de tu dibujo.

### ⌨️ Atajos súper útiles

#### 🎮 Controles básicos:
- **Activar/Desactivar Dibujo:** `Cmd+Shift+D` ← ¡El más importante!
- **Limpiar pantalla:** `Cmd+Shift+C` 
- **Resetear todo:** `Cmd+Shift+R`
- **Salir del modo dibujo:** `Esc` 

#### 🛠️ Herramientas:
- **Lápiz:** `Cmd+Alt+P` ✏️
- **Rectángulo:** `Cmd+Alt+R` 📐
- **Círculo:** `Cmd+Alt+C` ⭕
- **Borrador:** `Cmd+Alt+E` 🧹
- **Mover (Mano):** `Cmd+Alt+M` ✋
- **Recolorear:** `Cmd+Alt+B` 🪣

#### 🎨 Colores básicos:
- **Rojo:** `Option+1` ❤️
- **Verde:** `Option+2` 💚
- **Azul:** `Option+3` 💙
- **Amarillo:** `Option+4` 💛
- **Blanco:** `Option+5` 🤍
- **Negro:** `Option+6` 🖤

#### 🌈 Colores adicionales:
- **Naranja:** `Option+7` 🧡
- **Púrpura:** `Option+8` 💜
- **Rosa:** `Option+9` 🩷
- **Magenta:** `Option+0` 🩵
- **Cian:** `Cmd+Alt+1` 💎
- **Lima:** `Cmd+Alt+2` 💚
- **Marrón:** `Cmd+Alt+3` 🤎
- **Gris:** `Cmd+Alt+4` 🩶
- **Gris Claro:** `Cmd+Alt+5` ⬜
- **Gris Oscuro:** `Cmd+Alt+6` ⬛

#### 🔤 Colores con letras (¡súper rápido!):
- **Rojo:** `Option+R` ❤️
- **Verde:** `Option+G` 💚
- **Azul:** `Option+B` 💙
- **Amarillo:** `Option+Y` 💛
- **Blanco:** `Option+W` 🤍
- **Negro:** `Option+K` 🖤
- **Naranja:** `Option+O` 🧡
- **Púrpura:** `Option+P` 💜

#### ⚙️ Extras:
- **Cambiar colores:** `Cmd+Alt+Q` 🌈
- **Cambiar grosor:** `Cmd+Alt+W` 📏
- **Deshacer:** `Cmd+Z` ⏪

> **💡 ¡Atajos completamente seguros para macOS!**  
> Hemos optimizado todos los atajos para evitar conflictos:
> - ❌ Ya no usamos `Cmd+C` (para no interferir con copiar)
> - ❌ Ya no usamos `Cmd+Shift+3/4/5` (evita capturas de pantalla y grabación)  
> - ✅ Ahora usamos `Cmd+Alt+letra` para herramientas
> - ✅ Y `Option+número` para colores (¡súper fácil!)  
> ¡Así puedes usar todos tus atajos del sistema sin problemas! 🎯

---

## ⚙️ ¡Configura Todo a Tu Gusto!

**¿No te gustan estos atajos?** ¡No hay problema! Ahora puedes cambiar **TODOS** los atajos de teclado.

### 🎮 Cómo Personalizar Atajos:

1. **Abre la configuración:**
   - Desde el **tray**: Clic derecho → "⚙️ Configurar Atajos"
   - Desde el **menú**: "Yonier Color Presenter" → "⚙️ Configurar Atajos"

2. **Edita lo que quieras:**
   - 🎮 **Controles básicos** (activar/limpiar/resetear)
   - 🛠️ **Herramientas** (lápiz/rectángulo/círculo/borrador/mover/recolorear)
   - 🎨 **Todos los colores** (básicos, adicionales y con letras)

3. **Guarda y listo!**
   - Los cambios se aplican inmediatamente
   - Sin necesidad de reiniciar la aplicación

### 🔧 Funciones Avanzadas:

- **📤 Exportar configuración** - Guarda tu setup personalizado
- **📥 Importar configuración** - Carga configuraciones de otros dispositivos  
- **🔄 Resetear a defecto** - Vuelve a los atajos originales
- **✅ Validación en tiempo real** - Te dice si un atajo es válido

### 📖 Ejemplos de Formato:
```bash
CommandOrControl+R          # Cmd+R (Mac) / Ctrl+R (Win/Linux)
CommandOrControl+Shift+D    # Cmd+Shift+D
Alt+F4                      # Alt+F4  
Shift+Enter                 # Shift+Enter
F12                         # Solo F12
```

**💡 Tip:** Puedes usar `CommandOrControl` para compatibilidad entre Mac y PC, o `Command`/`Control` para plataforma específica.

👉 **[Ver guía completa de configuración](docs/CONFIGURACION_ATAJOS.md)**

---

## 💻 ¿Qué necesitas?

- 🍎 **macOS 12 o más nuevo**
- 🟢 **Node.js 18 o más nuevo**

¡Eso es todo! No necesitas nada más complicado.

---

## 💡 Consejos útiles

- 🔍 El icono de la barra de menú se adapta automáticamente al modo claro/oscuro de tu Mac
- 📋 Haz clic derecho en el icono para ver todos los atajos disponibles
- 🎯 La app se queda oculta en segundo plano - no molesta para nada
- ⚡ Todos los atajos funcionan desde cualquier aplicación (son globales)

---

## 🤝 ¿Quieres ayudar?

¡Las ideas y mejoras son súper bienvenidas! 💝

Puedes:
- 🐛 Reportar errores
- 💡 Sugerir nuevas características  
- 🔧 Contribuir con código
- ⭐ Darle una estrella al proyecto

---

## 📄 Licencia

MIT - Úsalo, modifícalo, compártelo libremente 🎉

---

**¿Preguntas? ¿Problemas? ¿Ideas geniales?** 
¡No dudes en contactarme! 😊