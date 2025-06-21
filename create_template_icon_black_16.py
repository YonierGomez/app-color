from PIL import Image, ImageDraw

size = 16
image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
draw.ellipse([2, 2, size-2, size-2], fill=(0, 0, 0, 255))
image.save('assets/tray-template.png')
print("Icono template negro puro guardado en assets/tray-template.png (16x16)")
