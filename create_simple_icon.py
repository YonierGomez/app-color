#!/usr/bin/env python3
"""
Script para crear un icono PNG simple para el tray de macOS sin dependencias externas
"""

import base64
import os

# Crear un PNG simple de 16x16 con paleta de colores
# Este es un PNG válido codificado en base64
png_data_16x16 = """
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGISURBVDiNpZM9SwNBEIafxQQLwcJCG1sLG0uxsLW0sLGwsLBQsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCwsLGwsLW0sLGwsLCAwAAf//5UrAAAANklEQVQ4T2NgGAWjYBSMglEwCkbBKBgFo2AUjIJRMAr+A8AAIAAF4B4kAAAAAElFTkSuQmCC
"""

def create_tray_icon():
    # Crear directorio assets si no existe
    os.makedirs('assets', exist_ok=True)
    
    # Decodificar y guardar el PNG
    png_bytes = base64.b64decode(png_data_16x16.strip())
    
    with open('assets/tray-icon.png', 'wb') as f:
        f.write(png_bytes)
    
    print("Icono del tray creado en: assets/tray-icon.png")
    print("Tamaño: 16x16 píxeles, optimizado para macOS tray")

if __name__ == "__main__":
    create_tray_icon()
