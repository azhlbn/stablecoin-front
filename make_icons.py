from PIL import Image, ImageDraw
import struct, zlib

SRC = "az-logo.png"

def make_round_png(src_path, size, padding_ratio=0.0):
    img = Image.open(src_path).convert("RGBA")
    canvas = size
    pad = int(canvas * padding_ratio)
    inner = canvas - pad * 2
    img = img.resize((inner, inner), Image.LANCZOS)

    # Black circular background
    result = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    bg = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    draw = ImageDraw.Draw(bg)
    draw.ellipse((0, 0, canvas - 1, canvas - 1), fill=(0, 0, 0, 255))
    result.paste(bg, (0, 0), bg)
    result.paste(img, (pad, pad), img)

    # Circular mask
    mask = Image.new("L", (canvas, canvas), 0)
    draw2 = ImageDraw.Draw(mask)
    draw2.ellipse((0, 0, canvas - 1, canvas - 1), fill=255)
    final = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))
    final.paste(result, mask=mask)
    return final

def save_ico(images_dict, path):
    """
    Save multiple sizes as a proper .ico file.
    images_dict: {size: PIL.Image}
    """
    import io
    sizes = sorted(images_dict.keys())
    num = len(sizes)
    
    # ICO header: 6 bytes
    header = struct.pack("<HHH", 0, 1, num)
    
    # Each image entry: 16 bytes
    # We'll write PNG-compressed entries (modern .ico supports PNG)
    image_data = []
    for s in sizes:
        img = images_dict[s].convert("RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        image_data.append(buf.getvalue())
    
    # Directory entries start at offset 6 + num*16
    offset = 6 + num * 16
    directory = b""
    for i, s in enumerate(sizes):
        data_len = len(image_data[i])
        w = s if s < 256 else 0
        h = s if s < 256 else 0
        directory += struct.pack("<BBBBHHII",
            w, h,   # width, height (0 = 256)
            0,       # color count
            0,       # reserved
            1,       # color planes
            32,      # bits per pixel
            data_len,
            offset,
        )
        offset += data_len
    
    with open(path, "wb") as f:
        f.write(header)
        f.write(directory)
        for d in image_data:
            f.write(d)

# --- Generate files ---

# favicon.ico in public/ — multiple sizes, NO padding so logo fills the circle
ico_images = {
    16:  make_round_png(SRC, 16,  padding_ratio=0.0),
    32:  make_round_png(SRC, 32,  padding_ratio=0.0),
    48:  make_round_png(SRC, 48,  padding_ratio=0.0),
    64:  make_round_png(SRC, 64,  padding_ratio=0.0),
    128: make_round_png(SRC, 128, padding_ratio=0.0),
    256: make_round_png(SRC, 256, padding_ratio=0.0),
}
save_ico(ico_images, "public/favicon.ico")
print("Saved public/favicon.ico")

# app/icon.png — 512x512, small padding for aesthetics
icon = make_round_png(SRC, 512, padding_ratio=0.03)
icon.save("app/icon.png", "PNG")
print("Saved app/icon.png")

# app/apple-icon.png
apple = make_round_png(SRC, 180, padding_ratio=0.03)
apple.save("app/apple-icon.png", "PNG")
print("Saved app/apple-icon.png")

# public/logo.png — header logo
logo = make_round_png(SRC, 64, padding_ratio=0.03)
logo.save("public/logo.png", "PNG")
print("Saved public/logo.png")

print("Done.")
