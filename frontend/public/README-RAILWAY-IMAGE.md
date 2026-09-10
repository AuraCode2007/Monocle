# Railway Tunnel Background Image

## Instructions

To use the actual railway tunnel photograph as the login page background:

1. Save the railway tunnel image (the photo showing the red Indian train curving into the green tunnel on a rainy day) to this directory as:
   ```
   frontend/public/railway-tunnel.jpg
   ```

2. The image should be:
   - **Format:** JPG or JPEG
   - **Recommended size:** 1920x1080px or higher for best quality
   - **File name:** Exactly `railway-tunnel.jpg` (case-sensitive on some systems)

3. The LoginPage component is already configured to use this image with:
   - Slight blur effect (3px backdrop filter)
   - Dark vignette overlay for text readability
   - Proper centering and coverage

## Fallback

If the image file is not found, the browser will show a transparent background and the overlays will still render, maintaining the layout structure.

## Current Setup

The left side of the login page will display:
- The railway-tunnel.jpg image as background
- A subtle 3px blur effect
- A 20% dark overlay
- A radial vignette for depth
- "MONOCLE" branding text overlay with drop shadows

The right side remains unchanged with the glassmorphic login form.
