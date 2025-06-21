#!/bin/bash

echo "🚀 Instalando dependencias..."
npm install

echo "📦 Creando instalador para Mac..."
npm run build

echo "✅ ¡Instalador creado! Busca el archivo .dmg en la carpeta dist/"
echo "🎉 Tu aplicación está lista para instalar"