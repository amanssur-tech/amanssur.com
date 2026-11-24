#!/usr/bin/env python3
"""Build public/fonts/cv-tilde.ttf - the one-glyph font that renders the ASCII tilde
(U+007E) in the CV.

Why this exists
---------------
Syne draws U+007E as a ~0.10em speck that reads as a stray dot in "~3M to ~170k".
Syne's *other* tilde slot, U+02DC (SMALL TILDE), is a proper wave, so this script
takes that outline, scales it to the proportions of Trebuchet MS's tilde (the shape
that was signed off visually) and maps it onto U+007E.

The result is a 1 KB font served from our own origin, so the mark renders identically
on every machine with no dependency on installed system fonts - Trebuchet MS itself is
proprietary and cannot be shipped.

Usage
-----
    python3 scripts/build-cv-tilde.py

Requires fontTools (pip install fonttools). Re-run it if Syne-Variable.ttf is updated.

Licence
-------
The outline is derived from Syne by Bonjour Monde (SIL OFL 1.1), which permits
modification and redistribution. The family is renamed CvTilde and the licence note
ships alongside the generated file as public/fonts/cv-tilde.LICENSE.txt.
"""

from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "fonts" / "Syne-Variable.ttf"
OUT = ROOT / "public" / "fonts" / "cv-tilde.ttf"

SOURCE_CODEPOINT = 0x02DC  # Syne's real tilde (the ASCII slot, U+007E, is the speck)
TARGET_CODEPOINT = 0x007E  # what the markdown actually contains
WEIGHT = 500               # font-medium: the weight the CV body text uses

# 2000-01-01 in TrueType long-datetime seconds, used to keep builds reproducible.
PINNED_TIMESTAMP = 3029529600

# Trebuchet MS's tilde, in em units - the proportions that were approved by eye.
TARGET = {
    "width": 0.364,
    "height": 0.101,
    "ymin": 0.249,
    "ymax": 0.350,
    "advance": 0.5245,
}


def main() -> None:
    inst = instantiateVariableFont(TTFont(SRC), {"wght": WEIGHT}, inplace=True)
    glyph_set = inst.getGlyphSet()
    cmap = inst.getBestCmap()
    upm = inst["head"].unitsPerEm

    source_name = cmap[SOURCE_CODEPOINT]
    bounds_pen = BoundsPen(glyph_set)
    glyph_set[source_name].draw(bounds_pen)
    x_min, y_min, x_max, y_max = bounds_pen.bounds

    scale_x = TARGET["width"] * upm / (x_max - x_min)
    scale_y = TARGET["height"] * upm / (y_max - y_min)
    offset_x = -x_min * scale_x
    offset_y = TARGET["ymin"] * upm - y_min * scale_y

    # Decompose any components first, otherwise the pen would emit references to
    # glyphs that do not exist in the font we are about to build.
    recording = DecomposingRecordingPen(glyph_set)
    glyph_set[source_name].draw(recording)

    pen = TTGlyphPen(None)
    recording.replay(TransformPen(pen, (scale_x, 0, 0, scale_y, offset_x, offset_y)))
    tilde = pen.glyph()

    # round half up: round() would take 524.5 down to 524
    advance = int(TARGET["advance"] * upm + 0.5)
    builder = FontBuilder(upm, isTTF=True)
    builder.setupGlyphOrder([".notdef", "asciitilde"])
    builder.setupCharacterMap({TARGET_CODEPOINT: "asciitilde"})
    builder.setupGlyf({".notdef": TTGlyphPen(None).glyph(), "asciitilde": tilde})
    builder.setupHorizontalMetrics({".notdef": (advance, 0), "asciitilde": (advance, 0)})
    builder.setupHorizontalHeader(ascent=750, descent=-250)
    builder.setupNameTable(
        {
            "familyName": "CvTilde",
            "styleName": "Regular",
            "psName": "CvTilde-Regular",
            "copyright": "Tilde outline derived from Syne (SIL OFL 1.1) by Bonjour Monde",
            "licenseDescription": "SIL Open Font License 1.1",
        }
    )
    builder.setupOS2(
        sTypoAscender=750, sTypoDescender=-250, usWinAscent=750, usWinDescent=250
    )
    builder.setupPost()

    # Pin the timestamps so repeated builds are byte-identical (fontTools otherwise
    # stamps head.created/modified with the current time, which churns the file's hash
    # on every run even when the glyph is unchanged).
    builder.font["head"].created = PINNED_TIMESTAMP
    builder.font["head"].modified = PINNED_TIMESTAMP

    builder.save(OUT)

    check = TTFont(OUT)
    check_pen = BoundsPen(check.getGlyphSet())
    check.getGlyphSet()[check.getBestCmap()[TARGET_CODEPOINT]].draw(check_pen)
    b = check_pen.bounds
    print(f"wrote {OUT.relative_to(ROOT)}  ({OUT.stat().st_size} bytes)")
    print(
        f"  glyph  w={(b[2] - b[0]) / upm:.3f}em  h={(b[3] - b[1]) / upm:.3f}em  "
        f"y={b[1] / upm:.3f}..{b[3] / upm:.3f}  advance={advance / upm:.4f}em"
    )
    print(
        f"  target w={TARGET['width']:.3f}em  h={TARGET['height']:.3f}em  "
        f"y={TARGET['ymin']:.3f}..{TARGET['ymax']:.3f}  advance={TARGET['advance']:.4f}em"
    )


if __name__ == "__main__":
    main()
