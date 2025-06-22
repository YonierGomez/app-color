# 🪣 Guía Completa: Herramienta de Recolorear

## 📖 Introducción

La **herramienta de recolorear** es una de las funcionalidades más poderosas de Yonier Color Presenter v1.3.1. Funciona como un "balde de pintura" inteligente que permite cambiar el color de áreas completas con un solo clic, utilizando un algoritmo de **flood fill**.

---

## 🚀 ¿Qué es el Flood Fill?

El flood fill (también conocido como "relleno por inundación") es un algoritmo que:

- **🎯 Encuentra el color** del punto donde haces clic
- **🔍 Busca todos los píxeles conectados** del mismo color
- **🎨 Los cambia al nuevo color** que hayas seleccionado
- **🛡️ Respeta los bordes** y no afecta áreas de otros colores

Es como derramar pintura en un área cerrada - la pintura se expande hasta llenar toda el área del mismo color sin salirse de los bordes.

---

## ⌨️ Cómo Activar la Herramienta

### Método 1: Atajo de Teclado (Recomendado)
```
Cmd + Alt + B
```
> **💡 Tip:** B de "Balde" o "Bucket" en inglés

### Método 2: Desde el Menú del Tray
1. Haz clic en el icono de Yonier Color Presenter en la barra de menú
2. Selecciona "🪣 Recolorear"

### Método 3: Desde el Menú Principal
1. Con la aplicación activa, ve al menú "Herramientas"
2. Selecciona "🪣 Recolorear"

---

## 🎨 Proceso Paso a Paso

### Paso 1: Prepara tu Dibujo
- Dibuja algo usando cualquier herramienta (lápiz, rectángulos, círculos)
- Asegúrate de que las áreas que quieres recolorear estén bien definidas

### Paso 2: Activa la Herramienta
- Presiona `Cmd+Alt+B` para activar el recolorear

### Paso 3: Selecciona el Nuevo Color
Usa cualquiera de estos métodos:

**Colores Básicos:**
- `Option+1` → Rojo ❤️
- `Option+2` → Verde 💚  
- `Option+3` → Azul 💙
- `Option+4` → Amarillo 💛
- `Option+5` → Blanco 🤍
- `Option+6` → Negro 🖤

**Colores con Letras:**
- `Option+R` → Rojo
- `Option+G` → Verde
- `Option+B` → Azul
- `Option+Y` → Amarillo
- `Option+O` → Naranja
- `Option+P` → Púrpura

**Colores Adicionales:**
- `Option+7` → Naranja 🧡
- `Option+8` → Púrpura 💜
- `Option+9` → Rosa 🩷
- `Option+0` → Magenta 💗

### Paso 4: Haz Clic en el Área
- **🎯 Haz clic exactamente** en el color que quieres cambiar
- **✨ ¡Magia!** Toda el área conectada del mismo color cambiará instantáneamente

### Paso 5: Continúa o Deshaz
- **🔄 Para continuar:** Selecciona otro color y haz clic en otra área
- **⏪ Para deshacer:** Presiona `Cmd+Z` si no te gusta el resultado

---

## 💡 Casos de Uso Principales

### 🎓 Para Educadores
```
Escenario: Explicando un diagrama de flujo
1. Dibuja el diagrama inicial con un color base
2. Durante la explicación, usa recolorear para:
   - Resaltar diferentes procesos con colores únicos
   - Mostrar flujos alternativos
   - Crear variaciones del mismo concepto
```

### 📊 Para Presentadores de Negocio
```
Escenario: Presentando un organigrama
1. Crea la estructura básica
2. Usa recolorear para:
   - Diferencias departamentos por color
   - Destacar roles específicos
   - Mostrar jerarquías visualmente
```

### 🎨 Para Diseñadores
```
Escenario: Creando mockups rápidos
1. Dibuja formas básicas
2. Usa recolorear para:
   - Probar paletas de colores
   - Crear variaciones de tema
   - Adaptar a diferentes estilos de marca
```

### 🔧 Para Correcciones Rápidas
```
Escenario: Te equivocaste de color
1. ¡No hay problema!
2. Activa recolorear
3. Selecciona el color correcto
4. Un clic y está arreglado
```

---

## 🎯 Consejos Pro

### ✅ Mejores Prácticas

**🎨 Usa colores sólidos inicialmente:**
- Los colores sólidos funcionan mejor con recolorear
- Evita gradientes complejos al principio

**🎯 Sé preciso con el clic:**
- Haz clic exactamente en el color que quieres cambiar
- Un píxel puede hacer la diferencia

**🔄 Experimenta sin miedo:**
- `Cmd+Z` es tu amigo - deshace cualquier cambio
- Prueba diferentes combinaciones rápidamente

**⚡ Combina con atajos:**
- Aprende los atajos de colores más comunes
- `Option+R` → Recolorear a rojo es súper rápido

### ⚠️ Limitaciones a Considerar

**🔍 Precisión de color:**
- Solo cambia píxeles del color **exacto**
- Variaciones mínimas de tono no se consideran "el mismo color"

**🔗 Conexión requerida:**
- Solo afecta píxeles **conectados** entre sí
- Áreas separadas del mismo color requieren clics separados

**📏 Rendimiento:**
- Áreas muy grandes pueden tomar 1-2 segundos
- Normal para imágenes complejas

---

## 🔧 Casos Especiales

### 🖼️ Recolorear Formas Complejas

**Rectángulos con bordes:**
```
1. Si dibujaste un rectángulo con un color de relleno
2. Haz clic en el INTERIOR para cambiar el relleno
3. Haz clic en el BORDE para cambiar solo el contorno
```

**Círculos y óvalos:**
```
1. Similar a rectángulos
2. Distingue entre el área interna y el borde
3. Cada parte se recolorea independientemente
```

### 🎨 Trabajando con Múltiples Colores

**Dibujos con varias secciones:**
```
1. Cada color es independiente
2. Puedes recolorear cada sección por separado
3. Los bordes actúan como "barreras" naturales
```

**Texto dibujado:**
```
1. Si escribiste/dibujaste texto a mano
2. Cada letra puede ser recoloreada independientemente
3. Útil para crear énfasis en palabras específicas
```

---

## 🐛 Solución de Problemas

### ❓ "No pasa nada cuando hago clic"

**Posibles causas:**
- No has activado la herramienta de recolorear (`Cmd+Alt+B`)
- Estás haciendo clic en un área transparente
- El color nuevo es igual al color original

**Solución:**
1. Verifica que la herramienta esté activa
2. Haz clic en un área que tenga color visible
3. Selecciona un color diferente al actual

### ❓ "Solo cambia una pequeña parte"

**Causa:**
- Hay variaciones mínimas en el color que no son visibles al ojo
- El área no está completamente conectada

**Solución:**
1. Haz clic en diferentes puntos del área
2. Verifica que el dibujo original tenga colores uniformes

### ❓ "El recolorear es muy lento"

**Causa:**
- Área muy grande o compleja

**Solución:**
- Normal para áreas grandes
- Espera 1-2 segundos para el procesamiento

---

## 🎪 Trucos Avanzados

### 🌈 Creación Rápida de Paletas
```
1. Dibuja varias formas con el mismo color base
2. Usa recolorear para crear una paleta armoniosa
3. Perfecto para presentaciones con tema específico
```

### 🎯 Técnica de "Plantilla Base"
```
1. Crea un dibujo base en un color neutral (ej: gris)
2. Guárdalo mentalmente como "plantilla"
3. Usa recolorear para crear múltiples versiones temáticas
```

### ⚡ Flujo de Corrección Rápida
```
1. Dibuja sin preocuparte por el color exacto
2. Enfócate en formas y estructura
3. Al final, usa recolorear para perfeccionar colores
```

---

## 📊 Comparación con Otras Herramientas

| Herramienta | Recolorear | Borrar + Redibujar | Lápiz Manual |
|-------------|------------|-------------------|--------------|
| ⏱️ Velocidad | ⚡ Instantáneo | 🐌 Lento | 🐌 Muy lento |
| 🎯 Precisión | ✅ Perfecta | ❌ Imprecisa | ⚠️ Variable |
| 🔄 Reversible | ✅ Cmd+Z | ❌ Difícil | ❌ Imposible |
| 💪 Facilidad | ✅ Un clic | ❌ Múltiples pasos | ❌ Requiere habilidad |

---

## 🎓 Ejercicios Prácticos

### Ejercicio 1: Diagrama Simple
1. Dibuja 3 rectángulos conectados (flujo de proceso)
2. Usa recolorear para hacer cada uno de un color diferente
3. Practica cambiar los colores rápidamente

### Ejercicio 2: Presentación Interactiva
1. Dibuja un mapa mental con círculos
2. Durante una explicación, usa recolorear para:
   - Resaltar puntos importantes
   - Agrupar conceptos relacionados
   - Crear énfasis visual

### Ejercicio 3: Corrección Rápida
1. Dibuja algo deliberadamente con colores "incorrectos"
2. Practica corregir todos los colores usando solo recolorear
3. Cronométrate para mejorar velocidad

---

## 🔮 Próximas Mejoras

En futuras versiones, estamos considerando:

- **🎨 Tolerance slider:** Poder ajustar qué tan "similar" debe ser el color
- **👁️ Preview mode:** Ver qué área será afectada antes de hacer clic
- **🎭 Cursor personalizado:** Mostrar un cursor de "balde" para la herramienta
- **📱 Gradiente fill:** Posibilidad de aplicar gradientes con flood fill

---

## 🤝 ¿Preguntas o Sugerencias?

¿Tienes alguna idea para mejorar la herramienta de recolorear? ¿Encontraste un caso de uso interesante?

¡Nos encantaría escucharte! 🎉

---

**💡 Recuerda:** La herramienta de recolorear está diseñada para hacer tus presentaciones más dinámicas e interactivas. ¡No tengas miedo de experimentar!
