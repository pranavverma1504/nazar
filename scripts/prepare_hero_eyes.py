"""Prepare every NAZAR hero eye as reproducible layered PNG assets.

The measurements in this file use the original 1672 x 941 artwork coordinate
system. At neutral position the source-pixel iris and pupil layers completely
cover the generated bed, so the reconstructed artwork is pixel-identical to
the reference image.
"""

from __future__ import annotations

import argparse
import math
import random
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/images/hero/belief-reference.png"
OUTPUT_ROOT = ROOT / "public/images/hero/eyes"


Point = tuple[int, int]


@dataclass(frozen=True)
class EyeConfig:
    identifier: str
    crop_box: tuple[int, int, int, int]
    iris_center: Point
    clean_radius: int
    inner_iris_inner_radius: int
    inner_iris_outer_radius: int
    pupil_radius: int
    upper_lid: tuple[Point, ...]
    lower_lid: tuple[Point, ...]
    texture_seed: int


EYES = (
    EyeConfig(
        identifier="eye-left-large",
        crop_box=(0, 110, 540, 460),
        iris_center=(264, 175),
        clean_radius=113,
        inner_iris_inner_radius=43,
        inner_iris_outer_radius=116,
        pupil_radius=51,
        upper_lid=((0, 211), (35, 201), (70, 180), (105, 145), (140, 118), (180, 88), (225, 72), (270, 69), (315, 78), (360, 100), (405, 127), (450, 155), (490, 184), (520, 194), (540, 198)),
        lower_lid=((540, 205), (515, 224), (485, 244), (450, 263), (410, 280), (360, 291), (310, 296), (260, 294), (210, 286), (160, 274), (110, 258), (65, 246), (30, 240), (0, 238)),
        texture_seed=2202,
    ),
    EyeConfig(
        identifier="eye-top-center",
        crop_box=(680, 130, 1000, 330),
        iris_center=(156, 94),
        clean_radius=39,
        inner_iris_inner_radius=14,
        inner_iris_outer_radius=42,
        pupil_radius=17,
        upper_lid=((18, 104), (45, 86), (75, 69), (110, 56), (145, 50), (180, 52), (215, 61), (250, 77), (282, 96), (310, 103)),
        lower_lid=((310, 108), (280, 119), (245, 129), (210, 137), (175, 143), (140, 142), (105, 137), (70, 128), (40, 117), (18, 109)),
        texture_seed=2203,
    ),
    EyeConfig(
        identifier="eye-top-right",
        crop_box=(1000, 80, 1480, 340),
        iris_center=(223, 109),
        clean_radius=74,
        inner_iris_inner_radius=28,
        inner_iris_outer_radius=77,
        pupil_radius=33,
        upper_lid=((50, 126), (72, 103), (100, 76), (135, 57), (175, 43), (220, 36), (265, 40), (310, 52), (350, 68), (390, 87), (430, 102), (458, 110)),
        lower_lid=((458, 126), (430, 143), (395, 158), (355, 171), (310, 180), (265, 185), (220, 186), (175, 181), (135, 171), (100, 158), (72, 143), (50, 133)),
        texture_seed=2204,
    ),
    EyeConfig(
        identifier="eye-left-small",
        crop_box=(0, 500, 210, 680),
        iris_center=(93, 86),
        clean_radius=29,
        inner_iris_inner_radius=11,
        inner_iris_outer_radius=32,
        pupil_radius=14,
        upper_lid=((3, 101), (25, 86), (52, 72), (80, 65), (105, 65), (130, 72), (153, 83), (176, 96)),
        lower_lid=((176, 103), (153, 114), (128, 121), (100, 125), (72, 123), (45, 117), (22, 109), (3, 104)),
        texture_seed=2205,
    ),
    EyeConfig(
        identifier="eye-bottom-left-large",
        crop_box=(120, 620, 680, 941),
        iris_center=(270, 195),
        clean_radius=75,
        inner_iris_inner_radius=28,
        inner_iris_outer_radius=79,
        pupil_radius=34,
        upper_lid=((43, 215), (70, 195), (105, 173), (145, 150), (190, 136), (235, 128), (280, 128), (325, 137), (370, 150), (415, 165), (460, 185), (500, 203), (535, 212)),
        lower_lid=((535, 224), (505, 245), (470, 264), (430, 279), (385, 290), (340, 298), (295, 302), (250, 300), (205, 294), (160, 284), (120, 270), (85, 251), (58, 231), (43, 222)),
        texture_seed=2206,
    ),
    EyeConfig(
        identifier="eye-bottom-center",
        crop_box=(710, 650, 970, 850),
        iris_center=(127, 99),
        clean_radius=31,
        inner_iris_inner_radius=12,
        inner_iris_outer_radius=34,
        pupil_radius=15,
        upper_lid=((18, 108), (38, 92), (65, 77), (95, 68), (125, 66), (155, 72), (185, 83), (210, 97), (228, 105)),
        lower_lid=((228, 112), (208, 122), (180, 132), (150, 139), (120, 142), (90, 138), (62, 130), (38, 120), (18, 112)),
        texture_seed=2207,
    ),
    EyeConfig(
        identifier="eye-right-large",
        crop_box=(1080, 470, 1672, 941),
        iris_center=(370, 264),
        clean_radius=121,
        inner_iris_inner_radius=46,
        inner_iris_outer_radius=125,
        pupil_radius=54,
        upper_lid=((42, 323), (70, 293), (105, 261), (145, 230), (190, 199), (240, 173), (295, 153), (350, 143), (405, 147), (460, 162), (510, 185), (550, 210), (580, 230), (592, 237)),
        lower_lid=((592, 363), (565, 378), (530, 394), (490, 408), (445, 419), (395, 424), (345, 421), (295, 411), (245, 397), (195, 380), (150, 361), (110, 345), (75, 332), (42, 326)),
        texture_seed=2208,
    ),
)


def smooth_curve(controls: tuple[Point, ...], samples: int = 8) -> list[tuple[float, float]]:
    result: list[tuple[float, float]] = []
    for index in range(len(controls) - 1):
        p0 = controls[max(0, index - 1)]
        p1 = controls[index]
        p2 = controls[index + 1]
        p3 = controls[min(len(controls) - 1, index + 2)]
        for sample in range(samples):
            t = sample / samples
            t2 = t * t
            t3 = t2 * t
            x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            result.append((x, y))
    result.append(controls[-1])
    return result


def aperture_mask(config: EyeConfig, size: tuple[int, int]) -> Image.Image:
    scale = 4
    mask = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    points = smooth_curve(config.upper_lid) + smooth_curve(config.lower_lid)
    ImageDraw.Draw(mask).polygon([(round(x * scale), round(y * scale)) for x, y in points], fill=255)
    return mask.resize(size, Image.Resampling.LANCZOS)


def circle_mask(config: EyeConfig, size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    cx, cy = config.iris_center
    ImageDraw.Draw(mask).ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=255)
    return mask


def annulus_mask(config: EyeConfig, size: tuple[int, int]) -> Image.Image:
    outer = circle_mask(config, size, config.inner_iris_outer_radius)
    inner = circle_mask(config, size, config.inner_iris_inner_radius)
    return ImageChops.subtract(outer, inner)


def make_ring_bed(config: EyeConfig, size: tuple[int, int]) -> Image.Image:
    rng = random.Random(config.texture_seed)
    width, height = size
    cx, cy = config.iris_center
    pixels: list[tuple[int, int, int, int]] = []
    for y in range(height):
        for x in range(width):
            grain = rng.gauss(0, 3.1)
            vignette = 3.5 * math.hypot((x - cx) / width, (y - cy) / height)
            speckle = -rng.uniform(10, 24) if rng.random() < 0.006 else 0
            pixels.append((
                max(0, min(255, round(229 + grain - vignette + speckle))),
                max(0, min(255, round(222 + grain - vignette + speckle))),
                max(0, min(255, round(204 + grain - vignette + speckle))),
                255,
            ))
    texture = Image.new("RGBA", size)
    texture.putdata(pixels)
    texture = ImageEnhance.Contrast(texture).enhance(0.96)
    draw = ImageDraw.Draw(texture)
    for radius in range(9, config.clean_radius + 5, 7):
        shade = 18 + (radius % 4)
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=(shade, shade, shade - 2, 255), width=2)
    return texture


def apply_alpha(image: Image.Image, alpha: Image.Image) -> Image.Image:
    result = image.convert("RGBA")
    result.putalpha(alpha)
    return result


def save_png(image: Image.Image, destination: Path) -> None:
    temporary = destination.with_suffix(".png.tmp")
    image.save(temporary, format="PNG", optimize=True)
    temporary.replace(destination)


def prepare_eye(source: Image.Image, config: EyeConfig, debug_dir: Path | None) -> None:
    crop = source.crop(config.crop_box)
    size = crop.size
    aperture = aperture_mask(config, size)
    cleaned_bed = apply_alpha(make_ring_bed(config, size), circle_mask(config, size, config.clean_radius))
    inner_iris = apply_alpha(crop, annulus_mask(config, size))
    pupil = apply_alpha(crop, circle_mask(config, size, config.pupil_radius))

    output = OUTPUT_ROOT / config.identifier
    output.mkdir(parents=True, exist_ok=True)
    save_png(cleaned_bed, output / "cleaned-bed.png")
    save_png(inner_iris, output / "inner-iris.png")
    save_png(pupil, output / "pupil.png")
    save_png(aperture, output / "aperture-mask.png")
    (output / "iris.png").unlink(missing_ok=True)

    group = Image.alpha_composite(cleaned_bed, inner_iris)
    group = Image.alpha_composite(group, pupil)
    group.putalpha(ImageChops.multiply(group.getchannel("A"), aperture))
    reconstructed = Image.alpha_composite(crop, group)
    difference = ImageChops.difference(crop.convert("RGB"), reconstructed.convert("RGB"))
    extrema = difference.getextrema()
    max_delta = max(channel[1] for channel in extrema)
    changed = sum(1 for pixel in difference.get_flattened_data() if pixel != (0, 0, 0))
    print(f"{config.identifier}: crop={size[0]}x{size[1]} max_delta={max_delta} changed_pixels={changed}")

    if debug_dir is not None:
        debug_dir.mkdir(parents=True, exist_ok=True)
        crop.save(debug_dir / f"{config.identifier}-original.png", optimize=True)
        reconstructed.save(debug_dir / f"{config.identifier}-reconstructed.png", optimize=True)
        ImageEnhance.Brightness(difference).enhance(8).save(debug_dir / f"{config.identifier}-difference-x8.png", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--debug-dir", type=Path)
    parser.add_argument("--eye", choices=[eye.identifier for eye in EYES], action="append")
    args = parser.parse_args()
    selected = set(args.eye or (eye.identifier for eye in EYES))
    source = Image.open(SOURCE).convert("RGBA")
    for config in EYES:
        if config.identifier in selected:
            prepare_eye(source, config, args.debug_dir)


if __name__ == "__main__":
    main()
