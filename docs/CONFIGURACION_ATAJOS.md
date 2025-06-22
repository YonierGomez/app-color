# 🎮 Sistema de Configuración de Atajos

El **Yonier Color Presenter** ahora incluye un sistema completo de configuración personalizable que permite al usuario cambiar todos los atajos de teclado según sus preferencias.

## 🚀 Características Principales

### ✨ Configuración Visual
- **Interfaz intuitiva** con formularios fáciles de usar
- **Validación en tiempo real** de atajos de teclado
- **Categorización organizada** por funciones
- **Vista previa instantánea** de cambios

### 💾 Gestión de Configuración
- **Configuración persistente** que se guarda automáticamente
- **Archivo de configuración JSON** editable manualmente
- **Importar/Exportar** configuraciones
- **Resetear a valores por defecto** con un clic

### 🔄 Sistema Dinámico
- **Recarga automática** de atajos al guardar
- **Sin necesidad de reiniciar** la aplicación
- **Validación de conflictos** entre atajos
- **Fallback seguro** en caso de errores

## 📖 Cómo Usar

### 🎯 Acceso Rápido
1. **Desde el Tray**: Clic derecho → "⚙️ Configurar Atajos"
2. **Desde el Menú**: "Yonier Color Presenter" → "⚙️ Configurar Atajos"
3. **Desde Atajos**: Menú "Atajos" → "⚙️ Personalizar Todos los Atajos"

### ✏️ Editar Atajos
1. **Abrir configuración**: Usa cualquiera de los métodos anteriores
2. **Modificar atajos**: Haz clic en el campo que quieras cambiar
3. **Escribir nuevo atajo**: Usa el formato correcto (ver abajo)
4. **Guardar cambios**: Haz clic en "💾 Guardar Configuración"

### 📝 Formato de Atajos

#### Modificadores Válidos:
- `CommandOrControl` - Cmd en Mac, Ctrl en Windows/Linux
- `Command` - Cmd (solo Mac)
- `Control` / `Ctrl` - Control
- `Alt` / `Option` - Alt/Option
- `Shift` - Shift
- `Meta` - Meta/Windows key

#### Teclas Válidas:
- **Letras**: `A-Z`
- **Números**: `0-9`
- **Funciones**: `F1-F12`
- **Especiales**: `Enter`, `Escape`, `Space`, `Tab`, `Backspace`, `Delete`, `Insert`, `Home`, `End`, `PageUp`, `PageDown`
- **Flechas**: `Up`, `Down`, `Left`, `Right`

#### Ejemplos de Atajos:
```
CommandOrControl+R          → Cmd+R (Mac) / Ctrl+R (Win/Linux)
CommandOrControl+Shift+D    → Cmd+Shift+D (Mac) / Ctrl+Shift+D (Win/Linux)
Alt+F4                      → Alt+F4
Shift+Enter                 → Shift+Enter
F12                         → F12
Escape                      → Escape (sin modificadores)
```

## 🔧 Funciones Avanzadas

### 📤 Exportar Configuración
1. Haz clic en "📤 Exportar"
2. La configuración se copia al portapapeles como JSON
3. Puedes guardarla en un archivo de texto para respaldo

### 📥 Importar Configuración
1. Copia una configuración JSON válida al portapapeles
2. Haz clic en "📥 Importar"
3. La configuración se carga automáticamente
4. **¡Recuerda guardar!** para aplicar los cambios

### 🔄 Resetear a Defecto
1. Haz clic en "🔄 Resetear a Defecto"
2. Confirma la acción en el diálogo
3. Todos los atajos vuelven a sus valores originales
4. Los cambios se aplican inmediatamente

## 📁 Archivos de Configuración

### Ubicación de Archivos:
```
app-color/
├── config/
│   ├── shortcuts.json        # Configuración por defecto
│   └── user-shortcuts.json   # Configuración personalizada del usuario
```

### Prioridad de Carga:
1. **user-shortcuts.json** (si existe) - Configuración personalizada
2. **shortcuts.json** (fallback) - Configuración por defecto
3. **Configuración hardcodeada** (último recurso)

## ⚠️ Consideraciones Importantes

### 🚫 Atajos Conflictivos
- El sistema **no valida conflictos** entre atajos automáticamente
- Es responsabilidad del usuario evitar duplicados
- Si hay conflictos, solo uno funcionará (comportamiento indefinido)

### 🔒 Atajos del Sistema
- **EVITA estos atajos del sistema macOS**:
  - `Cmd+C` (copiar) - ❌ NO usar
  - `Cmd+V` (pegar) - ❌ NO usar  
  - `Cmd+X` (cortar) - ❌ NO usar
  - `Cmd+Shift+3` (captura completa) - ❌ NO usar
  - `Cmd+Shift+4` (captura de área) - ❌ NO usar
  - `Cmd+Shift+5` (grabar pantalla) - ❌ NO usar
  - `Cmd+Z` (deshacer) - ✅ OK para deshacer del dibujo
- **USA combinaciones completamente seguras**:
  - `Cmd+Alt+[letra]` - ✅ Seguro para herramientas
  - `Option+[número]` - ✅ PERFECTO para colores (no conflicta con nada!)
  - `Cmd+Shift+[letra]` - ✅ Seguro para funciones principales
- Algunos atajos pueden no funcionar según el contexto del sistema
- Prueba siempre los atajos después de configurarlos

### 💾 Persistencia
- Los cambios se guardan en `user-shortcuts.json`
- Este archivo **no se borra** al actualizar la aplicación
- Para volver a defecto, usa la función "Resetear" o borra el archivo manualmente

## 🎨 Categorías de Atajos

### 🎮 Control
- **Activar/Desactivar Dibujo**: Alterna el modo de dibujo
- **Limpiar Dibujo**: Borra todo el contenido del canvas
- **Resetear Todo**: Vuelve a la configuración inicial
- **Deshacer**: Deshace la última acción
- **Salir del Modo Dibujo**: Sale del modo dibujo (por defecto: Escape)

### 🛠️ Herramientas
- **Lápiz**: Herramienta de dibujo libre
- **Rectángulo**: Dibujar rectángulos perfectos
- **Círculo**: Dibujar círculos perfectos
- **Borrador**: Borrar partes del dibujo
- **Cambiar Color**: Cicla entre colores predefinidos
- **Cambiar Tamaño**: Cicla entre tamaños de pincel

### 🎨 Colores Básicos
- **Rojo, Verde, Azul**: Colores primarios
- **Amarillo**: Color secundario
- **Blanco, Negro**: Colores neutros

### 🌈 Colores Adicionales
- **Naranja, Púrpura, Rosa**: Colores vibrantes
- **Magenta, Cian, Lima**: Colores fluorescentes
- **Marrón**: Color tierra
- **Gris, Gris Claro, Gris Oscuro**: Escala de grises

## 🛠️ Solución de Problemas

### ❌ Atajo No Funciona
1. **Verifica el formato**: Asegúrate de usar la sintaxis correcta
2. **Revisa conflictos**: Otro programa puede estar usando el mismo atajo
3. **Prueba alternativas**: Usa otros modificadores o teclas
4. **Consulta logs**: Revisa la consola para mensajes de error

### 🔄 Configuración Corrupta
1. **Resetea a defecto**: Usa la función de reset en la interfaz
2. **Borra archivo manualmente**: Elimina `user-shortcuts.json`
3. **Reinicia la aplicación**: Cierra y vuelve a abrir
4. **Verifica permisos**: Asegúrate de que el directorio sea escribible

### 🚀 Rendimiento
- La aplicación puede tardar unos segundos en aplicar muchos cambios
- Los atajos globales se registran dinámicamente
- Si experimentas lag, reinicia la aplicación

## 💡 Consejos y Trucos

### 🎯 Atajos Eficientes
- **Usa CommandOrControl** para compatibilidad multiplataforma
- **Combina Shift** para variaciones de funciones similares
- **Reserva teclas simples** para acciones frecuentes
- **Usa F-keys** para funciones especiales

### 🔗 Patrones Recomendados
```bash
# Patrón actualizado (completamente seguro para macOS)
Control:      Cmd+Shift+[Letra] (para funciones principales)
Herramientas: Cmd+Alt+[Letra]   (para herramientas de dibujo)
Colores Base: Option+[1-6]      (colores básicos - súper fácil!)
Colores Ext:  Option+[7-0]      (colores adicionales)
            Cmd+Alt+[1-6]      (más colores adicionales)

# Ejemplos completamente seguros:
Cmd+Alt+P    → Lápiz
Cmd+Alt+R    → Rectángulo  
Option+1     → Rojo (¡súper simple!)
Option+2     → Verde
Option+7     → Naranja
Cmd+Alt+1    → Cian
```

### 📋 Respaldo de Configuración
1. **Exporta regularmente** tu configuración personalizada
2. **Guarda en la nube** para sincronizar entre dispositivos
3. **Documenta cambios** importantes para futuras referencias

---

¡Disfruta personalizando **Yonier Color Presenter** según tus preferencias! 🎨✨
