import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_transparent_assets():
    src_path = r'c:\Users\YOHANNA\.gemini\antigravity-ide\brain\601998dd-a688-46eb-b911-f4ed5a073879\.user_uploaded\media_1787299348436.png'
    out_dir = r'c:\Users\YOHANNA\Desktop\Agamos\frontend\public'

    img = Image.open(src_path).convert('RGBA')
    width, height = img.size

    # Crop out the upper symbol area
    # In media_1787299348436.png (784x1024), symbol is roughly in top 60%
    symbol_box = (int(width * 0.15), int(height * 0.05), int(width * 0.85), int(height * 0.65))
    symbol_crop = img.crop(symbol_box)
    
    # Process transparency for the symbol:
    # Any dark background (near black) should become transparent with smooth alpha
    datas = symbol_crop.getdata()
    new_data = []
    
    for item in datas:
        r, g, b, a = item
        # Luminance / brightness
        brightness = (r * 0.299 + g * 0.587 + b * 0.114)
        
        # If dark background
        if brightness < 35 and max(r, g, b) < 45:
            # Fully transparent
            new_data.append((r, g, b, 0))
        elif brightness < 70 and max(r, g, b) < 80:
            # Smooth feather transition
            alpha = int(((brightness - 35) / 35.0) * 255)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))
            
    symbol_crop.putdata(new_data)
    
    # Autocrop transparent borders
    bbox = symbol_crop.getbbox()
    if bbox:
        symbol_cropped = symbol_crop.crop(bbox)
    else:
        symbol_cropped = symbol_crop

    # Save agamos-symbol.png
    symbol_cropped.save(os.path.join(out_dir, 'agamos-symbol.png'), 'PNG')
    print("Saved agamos-symbol.png:", symbol_cropped.size)

    # Now create agamos-logo-dark.png (For dark backgrounds: Noir, Emerald, Velvet)
    # 600x160 transparent canvas
    dark_canvas = Image.new('RGBA', (600, 160), (0, 0, 0, 0))
    # Resize symbol to height ~130 maintaining aspect ratio
    sym_w, sym_h = symbol_cropped.size
    aspect = sym_w / sym_h
    new_h = 130
    new_w = int(new_h * aspect)
    symbol_resized = symbol_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    dark_canvas.paste(symbol_resized, (15, 15), symbol_resized)
    
    # Save dark logo
    dark_canvas.save(os.path.join(out_dir, 'agamos-logo-dark.png'), 'PNG')
    print("Saved agamos-logo-dark.png")

    # Save light logo (Same transparent symbol, blends on light background)
    light_canvas = Image.new('RGBA', (600, 160), (0, 0, 0, 0))
    light_canvas.paste(symbol_resized, (15, 15), symbol_resized)
    light_canvas.save(os.path.join(out_dir, 'agamos-logo-light.png'), 'PNG')
    print("Saved agamos-logo-light.png")

if __name__ == '__main__':
    create_transparent_assets()
