# Reference Color Card Specification

## Purpose

The reference color card enables **in-frame lighting calibration** for field drug test image capture. By including known color patches in every photo, the classification pipeline can normalize for varying lighting conditions (sunlight, fluorescent, shade).

## Physical Specifications

| Property | Value |
|---|---|
| Card size | 50mm × 30mm (recommended) |
| Patch layout | 2 rows × 3 columns |
| Patch size | ~15mm × 14mm each |
| Material | Matte photo paper or laminated print |
| Placement | Beside test kit, within camera guide frame (right side) |

## Color Patches (sRGB)

| # | Color | sRGB Values | Purpose |
|---|---|---|---|
| 1 | White | (255, 255, 255) | White balance reference |
| 2 | 18% Gray | (118, 118, 118) | Mid-tone calibration |
| 3 | Red | (255, 0, 0) | Primary color anchor |
| 4 | Green | (0, 255, 0) | Primary color anchor |
| 5 | Blue | (0, 0, 255) | Primary color anchor |
| 6 | Black | (0, 0, 0) | Shadow reference |

## Printable SVG

Save the following as `reference-card.svg` and print at 50×30mm:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="50mm" height="30mm" viewBox="0 0 500 300">
  <rect x="10" y="10" width="150" height="130" fill="#FFFFFF" stroke="#000" stroke-width="2"/>
  <rect x="175" y="10" width="150" height="130" fill="#767676" stroke="#000" stroke-width="2"/>
  <rect x="340" y="10" width="150" height="130" fill="#FF0000" stroke="#000" stroke-width="2"/>
  <rect x="10" y="160" width="150" height="130" fill="#00FF00" stroke="#000" stroke-width="2"/>
  <rect x="175" y="160" width="150" height="130" fill="#0000FF" stroke="#000" stroke-width="2"/>
  <rect x="340" y="160" width="150" height="130" fill="#000000" stroke="#000" stroke-width="2"/>
</svg>
```

## Usage Instructions for Officers

1. **Print** the reference card on matte paper; laminate for durability.
2. **Place** the card beside the test kit within the camera overlay guides.
3. **Capture** the image with both the test reaction zone and all 6 color patches visible.
4. **Wait** for the color reaction to stabilize (per kit instructions) before capturing.
5. **Avoid** shadows falling across the test zone or reference card.

## In-App Guide

The mobile app includes a Reference Card Setup Guide accessible from the New Test screen (`/guide`).

## Calibration Algorithm

The backend classification service:

1. Detects the reference card region (bottom-right of image)
2. Extracts the gray patch for white-balance correction
3. Applies color correction to the full image
4. Analyzes the test zone color in LAB space
5. Compares against kit-specific positive/negative thresholds

If the reference card is not detected, the system falls back to gray-world white balance and may return a lower confidence or inconclusive result.
