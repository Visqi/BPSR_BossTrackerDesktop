# Boss Images

Boss images are loaded from the bptimer.com CDN and displayed in the application.

## Structure

- `images/bosses/` - Boss creature images
- `images/magical-creatures/` - Magical creature images

## Image Format

- Format: WebP
- Size: 256x256px or larger
- Square aspect ratio preferred

Images are loaded remotely and cached by the application. If an image fails to load, the UI gracefully handles the missing image.

