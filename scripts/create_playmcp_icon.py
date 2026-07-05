#!/usr/bin/env python3
import math
import os
import struct
import zlib


SIZE = 600
OUT = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "playmcp-icon.png")


def mix(a, b, t):
    return int(a + (b - a) * t)


def blend(dst, src, alpha):
    return tuple(mix(dst[i], src[i], alpha) for i in range(3))


def png_chunk(kind, data):
    body = kind + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


def set_pixel(pixels, x, y, color, alpha=1.0):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        idx = y * SIZE + x
        pixels[idx] = blend(pixels[idx], color, alpha)


def draw_disc(pixels, cx, cy, radius, color, alpha=1.0):
    r2 = radius * radius
    for y in range(max(0, int(cy - radius - 1)), min(SIZE, int(cy + radius + 2))):
        for x in range(max(0, int(cx - radius - 1)), min(SIZE, int(cx + radius + 2))):
            d2 = (x - cx) ** 2 + (y - cy) ** 2
            if d2 <= r2:
                edge = max(0.0, min(1.0, (radius - math.sqrt(d2)) / 2.0))
                set_pixel(pixels, x, y, color, alpha * min(1.0, edge + 0.35))


def draw_ring(pixels, cx, cy, radius, width, color, alpha=1.0):
    outer = radius + width / 2
    inner = radius - width / 2
    for y in range(max(0, int(cy - outer - 2)), min(SIZE, int(cy + outer + 3))):
        for x in range(max(0, int(cx - outer - 2)), min(SIZE, int(cx + outer + 3))):
            dist = math.hypot(x - cx, y - cy)
            if inner <= dist <= outer:
                edge = 1.0 - min(1.0, abs(dist - radius) / (width / 2 + 0.01))
                set_pixel(pixels, x, y, color, alpha * (0.35 + 0.65 * edge))


def draw_line(pixels, x1, y1, x2, y2, width, color, alpha=1.0):
    steps = int(max(abs(x2 - x1), abs(y2 - y1)) * 2)
    for i in range(steps + 1):
        t = i / max(1, steps)
        x = x1 + (x2 - x1) * t
        y = y1 + (y2 - y1) * t
        draw_disc(pixels, x, y, width / 2, color, alpha)


def make_icon():
    pixels = []
    for y in range(SIZE):
        for x in range(SIZE):
            nx = (x - SIZE / 2) / (SIZE / 2)
            ny = (y - SIZE / 2) / (SIZE / 2)
            r = min(1.0, math.hypot(nx, ny))
            top = (20, 27, 35)
            bottom = (8, 12, 18)
            bg = tuple(mix(top[i], bottom[i], y / SIZE) for i in range(3))
            glow = max(0.0, 1.0 - r) ** 1.8
            pixels.append(blend(bg, (36, 72, 88), glow * 0.35))

    gold = (248, 196, 76)
    teal = (80, 198, 176)
    soft = (237, 231, 216)

    for radius, width, alpha in [(206, 4, 0.55), (151, 3, 0.5), (96, 2, 0.35)]:
        draw_ring(pixels, 300, 300, radius, width, gold, alpha)

    for deg in range(0, 360, 30):
        rad = math.radians(deg - 90)
        x1 = 300 + math.cos(rad) * 96
        y1 = 300 + math.sin(rad) * 96
        x2 = 300 + math.cos(rad) * 206
        y2 = 300 + math.sin(rad) * 206
        draw_line(pixels, x1, y1, x2, y2, 2.4, gold, 0.35)

    points = [
        (220, 204), (282, 246), (358, 214), (395, 292),
        (337, 358), (266, 348), (204, 410), (402, 414),
    ]
    for a, b in zip(points, points[1:]):
        draw_line(pixels, a[0], a[1], b[0], b[1], 3.0, teal, 0.72)
    draw_line(pixels, points[1][0], points[1][1], points[5][0], points[5][1], 2.2, teal, 0.45)
    draw_line(pixels, points[2][0], points[2][1], points[4][0], points[4][1], 2.2, teal, 0.45)

    for idx, (x, y) in enumerate(points):
        draw_disc(pixels, x, y, 9 if idx in (0, 3, 7) else 7, soft, 0.95)
        draw_disc(pixels, x, y, 4, gold if idx in (0, 3, 7) else teal, 0.95)

    draw_disc(pixels, 300, 300, 44, (16, 23, 31), 0.9)
    draw_ring(pixels, 300, 300, 44, 5, gold, 0.85)
    draw_disc(pixels, 300, 300, 11, soft, 0.9)

    raw = bytearray()
    for y in range(SIZE):
        raw.append(0)
        for x in range(SIZE):
            raw.extend(pixels[y * SIZE + x])

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(png_chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 2, 0, 0, 0)))
        f.write(png_chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
        f.write(png_chunk(b"IEND", b""))


if __name__ == "__main__":
    make_icon()
    print(OUT)
