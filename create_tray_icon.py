#!/usr/bin/env python3
"""
Script para crear un icono PNG de paleta de colores para el tray de macOS
"""

from PIL import Image, ImageDraw
import os

def create_tray_icon():
    # Crear imagen de 16x16 (tamaño estándar para tray de macOS)
    size = 16
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))  # Fondo transparente
    draw = ImageDraw.Draw(img)
    
    # Colores para la paleta
    colors = [
        (255, 0, 0),    # Rojo
        (0, 255, 0),    # Verde
        (0, 102, 255),  # Azul
        (255, 255, 0),  # Amarillo
    ]
    
    # Posiciones para los círculos de colores
    positions = [(2, 2), (12, 2), (2, 12), (12, 12)]
    
    # Dibujar círculos de colores
    for i, (color, pos) in enumerate(zip(colors, positions)):
        # Círculo de color
        draw.ellipse([pos[0]-2, pos[1]-2, pos[0]+2, pos[1]+2], 
                    fill=color, outline=(0, 0, 0), width=1)
    
    # Círculo central (representando el pincel)
    draw.ellipse([7, 7, 9, 9], fill=(0, 0, 0), outline=(255, 255, 255), width=1)
    
    # Guardar el archivo
    output_path = 'assets/tray-icon.png'
    os.makedirs('assets', exist_ok=True)
    img.save(output_path)
    print(f"Icono del tray creado en: {output_path}")
    
    # Crear también una versión de 32x32 para alta resolución
    img_32 = img.resize((32, 32), Image.NEAREST)
    img_32.save('assets/tray-icon@2x.png')
    print(f"Icono del tray (alta resolución) creado en: assets/tray-icon@2x.png")

if __name__ == "__main__":
    create_tray_icon()
