from PIL import Image, ImageDraw, ImageOps
import cairosvg

# Convertir SVG a PNG temporal
cairosvg.svg2png(url='assets/palette.svg', write_to='assets/palette_tmp.png', output_width=16, output_height=16)

# Abrir PNG y convertir a negro puro sobre fondo transparente
img = Image.open('assets/palette_tmp.png').convert('L')
img = ImageOps.invert(img)

# Crear imagen RGBA y poner el canal alfa según la luminancia
rgba = Image.new('RGBA', img.size, (0, 0, 0, 0))
for y in range(img.height):
    for x in range(img.width):
        v = img.getpixel((x, y))
        # Si es suficientemente oscuro, poner negro puro
        if v < 128:
            rgba.putpixel((x, y), (0, 0, 0, 255))
        else:
            rgba.putpixel((x, y), (0, 0, 0, 0))
rgba.save('assets/tray-template.png')
print('Icono de paleta de colores (template, 16x16) generado en assets/tray-template.png')
