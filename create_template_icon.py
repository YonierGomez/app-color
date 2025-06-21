#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

def create_template_icon(size=32):
    """Crea un icono de plantilla simple (negro y transparente) para la bandeja de macOS."""
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0)) # Fondo transparente
    draw = ImageDraw.Draw(image)
    
    # El color debe ser negro para que setTemplateImage funcione correctamente
    icon_color = (0, 0, 0, 255) # Negro opaco
    
    # Dibuja una paleta de artista simple como plantilla
    # El sistema operativo invertirá el color a blanco en modo oscuro
    draw.ellipse((2, 8, size - 8, size - 2), fill=icon_color)
    draw.ellipse((size - 14, 4, size - 4, 14), fill=icon_color)
    draw.ellipse((size - 22, 6, size - 12, 16), fill=icon_color)
    
    # Agujero para el pulgar (transparente)
    draw.ellipse((6, size - 14, 12, size - 8), fill=(0, 0, 0, 0))

    # Guardar el icono de plantilla
    output_path = "assets/tray-template.png"
    os.makedirs("assets", exist_ok=True)
    image.save(output_path, "PNG")
    print(f"Icono de plantilla creado exitosamente: {output_path}")

if __name__ == "__main__":
    try:
        create_template_icon()
    except ImportError:
        print("Error: La librería Pillow no está instalada. Por favor, instálala con 'pip install Pillow'")
    except Exception as e:
        print(f"Ocurrió un error al crear el icono: {e}")
