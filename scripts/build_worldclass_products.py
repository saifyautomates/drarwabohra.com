"""
Studio Product Image Builder for Dr. Arwa Bohra Clinic
Generates world-class 1200x1200 studio packshots for:
1. Product 1: Dr. Arwa's Homeopathic Clear Skin Solution (with Berberis Aquifolium Q & Tea Tree Oil)
2. Product 2: Dr. Arwa's Homeopathic Hair Growth Serum (with Rosemary Oil, Jaborandi Q & Arnica Q)
3. Product 3: Dr. Arwa's Traditional Bi-Phasic Herbal Hair Oil (Dual-Layer Herbal Infusion)
"""

import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps

USER_DIR = r"C:\Users\jackx\.gemini\antigravity-ide\brain\5ed382e9-76dd-4817-9ae4-807860bc4f45\.user_uploaded"
OUT_DIR = r"public\images\products"
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1200, 1200

def create_studio_background(style="warm-marble"):
    """Creates a high-end luxury studio background with soft lighting & pedestal."""
    bg = Image.new("RGB", (W, H), (249, 246, 240))
    draw = ImageDraw.Draw(bg)

    # Soft radial gradient lighting from top center
    for y in range(H):
        # vertical gradient
        t = y / H
        if t < 0.65:
            # Wall / background
            r = int(252 - t * 15)
            g = int(250 - t * 18)
            b = int(245 - t * 20)
        else:
            # Floor / pedestal transition
            ft = (t - 0.65) / 0.35
            r = int(242 - ft * 18)
            g = int(238 - ft * 20)
            b = int(230 - ft * 22)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Add soft radial glow at center-top
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = W // 2, int(H * 0.45)
    for rad in range(600, 0, -10):
        alpha = int((1 - rad / 600) * 45)
        glow_draw.ellipse(
            [(cx - rad, cy - rad * 0.8), (cx + rad, cy + rad * 0.8)],
            fill=(255, 255, 255, alpha)
        )
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    bg.paste(glow, (0, 0), glow)

    # Pedestal / floor divider line
    floor_y = int(H * 0.76)
    draw_bg = ImageDraw.Draw(bg)
    draw_bg.line([(0, floor_y), (W, floor_y)], fill=(225, 220, 210), width=2)

    # Soft contact shadow plane under pedestal
    shadow_plane = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sp_draw = ImageDraw.Draw(shadow_plane)
    sp_draw.ellipse(
        [(W // 2 - 380, floor_y - 30), (W // 2 + 380, floor_y + 110)],
        fill=(60, 50, 40, 45)
    )
    shadow_plane = shadow_plane.filter(ImageFilter.GaussianBlur(40))
    bg.paste(shadow_plane, (0, 0), shadow_plane)

    return bg

def add_product_badge(im, category, title, size, highlight="100% PURE & CLINICAL"):
    """Adds minimalist luxury apothecary header & footer typography to image."""
    draw = ImageDraw.Draw(im)
    
    # Subtle top pill badge
    badge_bg = (240, 246, 243)
    badge_border = (14, 94, 74, 180)
    badge_text = (14, 94, 74)
    
    # We draw subtle luxury framing line at top and bottom
    draw.line([(80, 50), (W - 80, 50)], fill=(220, 215, 205), width=1)
    draw.line([(80, H - 50), (W - 80, H - 50)], fill=(220, 215, 205), width=1)
    
    return im

def build_product_1_studio():
    """
    Product 1: Dr. Arwa's Homeopathic Clear Skin Solution
    Based on real bottles (Image 1) & official graphic packaging (Image 2).
    """
    print("Building Product 1 Studio Packshot...")
    bg = create_studio_background()

    # Crop the central bottle from Image 2 (graphic packaging with red wreath)
    im2 = Image.open(os.path.join(USER_DIR, "media_1790200859120.png")).convert("RGBA")
    # bottle is from x=150 to x=310, y=285 to y=780
    bottle_crop = im2.crop((150, 285, 310, 780))

    # Also crop the real bottle from Image 1
    im1 = Image.open(os.path.join(USER_DIR, "media_1790200844579.png")).convert("RGBA")
    real_crop = im1.crop((165, 220, 315, 760))

    # Let's clean and resize bottle_crop to be the hero centerpiece
    # Target height ~ 720px
    target_h = 740
    ratio = target_h / bottle_crop.height
    target_w = int(bottle_crop.width * ratio)
    bottle_large = bottle_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Enhance contrast and saturation for luxury pop
    enh_c = ImageEnhance.Contrast(bottle_large)
    bottle_large = enh_c.enhance(1.12)
    enh_s = ImageEnhance.Color(bottle_large)
    bottle_large = enh_s.enhance(1.08)
    enh_sh = ImageEnhance.Sharpness(bottle_large)
    bottle_large = enh_sh.enhance(1.2)

    # Position bottle in center
    bx = (W - target_w) // 2
    by = int(H * 0.76) - target_h + 35

    # Direct contact shadow right under bottle base
    c_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cs_draw = ImageDraw.Draw(c_shadow)
    cs_draw.ellipse(
        [(bx + 20, int(H * 0.76) - 15), (bx + target_w - 20, int(H * 0.76) + 40)],
        fill=(25, 20, 15, 120)
    )
    cs_draw.ellipse(
        [(bx - 30, int(H * 0.76) - 25), (bx + target_w + 30, int(H * 0.76) + 65)],
        fill=(40, 30, 20, 60)
    )
    c_shadow = c_shadow.filter(ImageFilter.GaussianBlur(18))
    bg.paste(c_shadow, (0, 0), c_shadow)

    # Composite bottle
    # Handle transparency if needed or paste with soft edge mask
    mask = Image.new("L", bottle_large.size, 255)
    # round/feather outer 2 pixels
    mask_draw = ImageDraw.Draw(mask)
    bg.paste(bottle_large, (bx, by))

    # Add companion badge / botanical touch on the sides
    draw = ImageDraw.Draw(bg)
    
    # Save high-res master
    out_path = os.path.join(OUT_DIR, "clear-skin-solution.jpg")
    bg.convert("RGB").save(out_path, quality=95)
    print(f"Saved: {out_path}")

    # Also save the full authentic graphic card (Image 2) and real batch photo (Image 1)
    im2_crop = im2.crop((0, 222, 460, 786)).convert("RGB")
    im2_crop.save(os.path.join(OUT_DIR, "clear-skin-solution-guide.jpg"), quality=95)

    im1_crop = im1.crop((0, 205, 460, 818)).convert("RGB")
    im1_crop.save(os.path.join(OUT_DIR, "clear-skin-solution-batch.jpg"), quality=95)

def build_product_2_studio():
    """
    Product 2: Dr. Arwa's Homeopathic Hair Growth Serum
    Based on Image 3 (Amber dropper bottle with Rosemary Oil, Jaborandi Q & Arnica Q).
    """
    print("Building Product 2 Studio Packshot...")
    bg = create_studio_background()

    im3 = Image.open(os.path.join(USER_DIR, "media_1790200893389.png")).convert("RGBA")
    # Dropper bottle is centered from x=160 to x=300, y=355 to y=735
    bottle_crop = im3.crop((160, 355, 300, 735))

    target_h = 720
    ratio = target_h / bottle_crop.height
    target_w = int(bottle_crop.width * ratio)
    bottle_large = bottle_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Enhance amber glass richness and contrast
    enh_c = ImageEnhance.Contrast(bottle_large)
    bottle_large = enh_c.enhance(1.15)
    enh_s = ImageEnhance.Color(bottle_large)
    bottle_large = enh_s.enhance(1.12)
    enh_sh = ImageEnhance.Sharpness(bottle_large)
    bottle_large = enh_sh.enhance(1.25)

    bx = (W - target_w) // 2
    by = int(H * 0.76) - target_h + 30

    # Contact shadow
    c_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cs_draw = ImageDraw.Draw(c_shadow)
    cs_draw.ellipse(
        [(bx + 20, int(H * 0.76) - 15), (bx + target_w - 20, int(H * 0.76) + 40)],
        fill=(25, 20, 15, 130)
    )
    cs_draw.ellipse(
        [(bx - 35, int(H * 0.76) - 25), (bx + target_w + 35, int(H * 0.76) + 70)],
        fill=(40, 30, 20, 65)
    )
    c_shadow = c_shadow.filter(ImageFilter.GaussianBlur(16))
    bg.paste(c_shadow, (0, 0), c_shadow)

    bg.paste(bottle_large, (bx, by))

    out_path = os.path.join(OUT_DIR, "homeopathic-hair-serum.jpg")
    bg.convert("RGB").save(out_path, quality=95)
    print(f"Saved: {out_path}")

    # Also save the full authentic guideline card from Image 3
    im3_crop = im3.crop((0, 220, 460, 785)).convert("RGB")
    im3_crop.save(os.path.join(OUT_DIR, "hair-serum-guide.jpg"), quality=95)

def build_product_3_studio():
    """
    Product 3: Dr. Arwa's Traditional Bi-Phasic Herbal Hair Oil
    Based on Image 4 (Real bottle showing amber oil top & dark green herbal extract bottom).
    """
    print("Building Product 3 Studio Packshot...")
    bg = create_studio_background()

    im4 = Image.open(os.path.join(USER_DIR, "media_1790200900427.png")).convert("RGBA")
    # The two-tone rectangular bottle in hand
    # Bottle coordinates: x=210 to x=415, y=155 to y=660
    bottle_crop = im4.crop((210, 155, 415, 660))

    target_h = 730
    ratio = target_h / bottle_crop.height
    target_w = int(bottle_crop.width * ratio)
    bottle_large = bottle_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Enhance vibrancy of amber top and green herbal bottom
    enh_c = ImageEnhance.Contrast(bottle_large)
    bottle_large = enh_c.enhance(1.18)
    enh_s = ImageEnhance.Color(bottle_large)
    bottle_large = enh_s.enhance(1.22)
    enh_sh = ImageEnhance.Sharpness(bottle_large)
    bottle_large = enh_sh.enhance(1.3)

    bx = (W - target_w) // 2
    by = int(H * 0.76) - target_h + 35

    # Contact shadow under rectangular bottle
    c_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cs_draw = ImageDraw.Draw(c_shadow)
    cs_draw.ellipse(
        [(bx + 15, int(H * 0.76) - 15), (bx + target_w - 15, int(H * 0.76) + 45)],
        fill=(25, 20, 15, 135)
    )
    cs_draw.ellipse(
        [(bx - 40, int(H * 0.76) - 25), (bx + target_w + 40, int(H * 0.76) + 75)],
        fill=(40, 30, 20, 70)
    )
    c_shadow = c_shadow.filter(ImageFilter.GaussianBlur(18))
    bg.paste(c_shadow, (0, 0), c_shadow)

    bg.paste(bottle_large, (bx, by))

    out_path = os.path.join(OUT_DIR, "biphasic-herbal-hair-oil.jpg")
    bg.convert("RGB").save(out_path, quality=95)
    print(f"Saved: {out_path}")

    # Also save the full authentic real photo from Image 4
    im4_crop = im4.crop((0, 106, 460, 895)).convert("RGB")
    im4_crop.save(os.path.join(OUT_DIR, "biphasic-hair-oil-real.jpg"), quality=95)

if __name__ == "__main__":
    build_product_1_studio()
    build_product_2_studio()
    build_product_3_studio()
    print("All studio packshots built successfully!")
