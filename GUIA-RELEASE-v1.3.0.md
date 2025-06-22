# 📋 Guía para Crear el Release v1.3.0 en GitHub

## 🎯 Pasos para Crear el Release:

### 1. **Ir a GitHub Releases**
- Ve a: https://github.com/YonierGomez/app-color/releases
- Haz clic en **"Create a new release"**

### 2. **Configurar el Release**

#### **Tag version:**
```
v1.3.0
```

#### **Release title:**
```
🎉 Yonier Color Presenter v1.3.0 - Nueva Herramienta de Mano (Drag & Move)
```

#### **Description (Release notes):**
Copia y pega el contenido del archivo `CHANGELOG-v1.3.0.md` que se encuentra en la raíz del proyecto.

### 3. **Subir el Archivo .dmg**

#### **Ubicación del archivo:**
```
/Users/yasprill/work_yonier/app-color/dist/Yonier Color Presenter-1.3.0-arm64.dmg
```

#### **Pasos:**
1. En la sección **"Attach binaries"** del release
2. Arrastra o selecciona el archivo `.dmg` desde la carpeta `dist/`
3. Espera a que se complete la subida (puede tomar unos minutos debido al tamaño)

### 4. **Configuración Final**

#### **Opciones recomendadas:**
- ✅ **Set as the latest release** (marcar)
- ✅ **Create a discussion for this release** (opcional, pero recomendado)
- ❌ **Set as a pre-release** (dejar sin marcar)

### 5. **Publicar**
- Haz clic en **"Publish release"**
- ¡El release estará disponible públicamente!

## 📱 URL Final del Release
Una vez publicado, el release estará disponible en:
```
https://github.com/YonierGomez/app-color/releases/tag/v1.3.0
```

## 📥 URL de Descarga Directa
El archivo .dmg estará disponible en:
```
https://github.com/YonierGomez/app-color/releases/download/v1.3.0/Yonier-Color-Presenter-1.3.0-arm64.dmg
```

## ✅ Verificación Post-Release

### Después de publicar, verifica:
1. **Descarga directa funciona**: Prueba el enlace de descarga
2. **README actualizado**: El enlace en el README debe apuntar al nuevo release
3. **Tamaño del archivo**: Debe ser aproximadamente ~98MB
4. **Instalación**: Descarga y prueba la instalación en un Mac limpio

## 🔄 Si necesitas actualizar el README después del release:

El archivo README ya está actualizado con el enlace a v1.3.0, pero si GitHub cambia la URL final, puedes actualizarlo con:

```bash
git checkout master
# Editar README.md con la URL correcta
git add README.md
git commit -m "docs: Update download link for v1.3.0 release"
git push origin master
```

## 📊 Información del Archivo .dmg

- **Nombre**: `Yonier Color Presenter-1.3.0-arm64.dmg`
- **Tamaño**: ~98MB
- **Arquitectura**: ARM64 (Apple Silicon)
- **Compatibilidad**: macOS 12+
- **Formato**: APFS (compatible con macOS 10.12+)

---

**🎉 ¡Listo!** Una vez completados estos pasos, la versión v1.3.0 con la nueva herramienta de mano estará disponible públicamente para descarga.
