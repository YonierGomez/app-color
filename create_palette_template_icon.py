from PIL import Image, ImageDraw
import math

size = 16
image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

# Paleta base (forma de círculo grande)
center = size // 2
radius = size // 2 - 1
draw.ellipse([center - radius, center - radius, center + radius, center + radius], fill=(0, 0, 0, 255))

# Círculos pequeños simulando colores (negro, para template)
for i in range(4):
    angle = (i * 90 + 30) * math.pi / 180
    x = center + int((radius - 3) * math.cos(angle))
    y = center + int((radius - 3) * math.sin(angle))
    draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(0, 0, 0, 255))

# Agujero del pulgar (transparente)
draw.ellipse([center + 2, center + 2, center + 5, center + 5], fill=(0, 0, 0, 0))

image.save('assets/tray-template.png')
print("Icono de paleta de colores (template) guardado en assets/tray-template.png (16x16)")
