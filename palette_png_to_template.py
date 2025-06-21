from PIL import Image

# Abrir el PNG generado y convertirlo a template (negro puro sobre fondo transparente)
img = Image.open('assets/palette_material.png').convert('L')
img = img.point(lambda x: 0 if x < 128 else 255, '1')

rgba = Image.new('RGBA', img.size, (0, 0, 0, 0))
for y in range(img.height):
    for x in range(img.width):
        v = img.getpixel((x, y))
        if v == 0:
            rgba.putpixel((x, y), (0, 0, 0, 255))
        else:
            rgba.putpixel((x, y), (0, 0, 0, 0))
rgba.save('assets/tray-template.png')
print('Icono de paleta de colores (template, 16x16) generado en assets/tray-template.png')
