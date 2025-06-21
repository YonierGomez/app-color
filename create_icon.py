#!/usr/bin/env python3
from PIL import Image, ImageDraw
import sys
import os

def create_colorful_icon(size=512):
    # Crear una imagen con fondo transparente
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Colores de la paleta
    colors = [
        (255, 0, 0, 255),    # Rojo
        (0, 255, 0, 255),    # Verde
        (0, 0, 255, 255),    # Azul
        (255, 255, 0, 255),  # Amarillo
        (255, 0, 255, 255),  # Magenta
        (0, 255, 255, 255),  # Cian
    ]
    
    # Dibujar círculos de colores en forma de paleta
    center = size // 2
    radius = size // 3
    
    # Círculo de fondo blanco
    draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                fill=(255, 255, 255, 255), outline=(0, 0, 0, 255), width=3)
    
    # Dibujar los colores en círculos pequeños alrededor
    import math
    for i, color in enumerate(colors):
        angle = (i * 60) * math.pi / 180
        x = center + int((radius * 0.7) * math.cos(angle))
        y = center + int((radius * 0.7) * math.sin(angle))
        small_radius = size // 12
        
        draw.ellipse([x - small_radius, y - small_radius, x + small_radius, y + small_radius],
                    fill=color, outline=(0, 0, 0, 255), width=2)
    
    # Círculo central negro (representando el pincel)
    center_radius = size // 20
    draw.ellipse([center - center_radius, center - center_radius, 
                  center + center_radius, center + center_radius],
                fill=(0, 0, 0, 255))
    
    return image

if __name__ == "__main__":
    try:
        # Crear el icono
        icon = create_colorful_icon()
        
        # Guardar en la carpeta assets
        output_path = "assets/tray-icon.png"
        os.makedirs("assets", exist_ok=True)
        icon.save(output_path, "PNG")
        
        print(f"Icono creado exitosamente: {output_path}")
        
    except ImportError:
        print("Error: PIL (Pillow) no está instalado. Instalando...")
        sys.exit(1)
    except Exception as e:
        print(f"Error creando el icono: {e}")
        sys.exit(1)
