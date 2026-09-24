"""Crop the four printed eye panels from the supplied 2238 x 703 reference."""

from pathlib import Path

from PIL import Image


SOURCE = Path(r"C:\Users\verma\OneDrive\Pictures\Screenshots\scroll eye reference.png")
OUTPUT = Path(__file__).resolve().parents[1] / "public/images/eye-sequence"

# Include each panel's black printed border and no surrounding red field.
PANELS = (
    (121, 243, 601, 449),
    (610, 241, 1109, 449),
    (1121, 243, 1624, 449),
    (1635, 241, 2122, 449),
)


def main() -> None:
    with Image.open(SOURCE) as image:
        if image.size != (2238, 703):
            raise ValueError(f"Unexpected reference dimensions: {image.size}")

        OUTPUT.mkdir(parents=True, exist_ok=True)
        for index, box in enumerate(PANELS, start=1):
            panel = image.crop(box)
            destination = OUTPUT / f"eye-{index}.png"
            panel.save(destination, format="PNG", optimize=True)
            print(f"{destination.relative_to(OUTPUT.parent)}: {panel.width}x{panel.height}")


if __name__ == "__main__":
    main()
