# Boss Images

This app uses boss images from the bptimer.com website. The images should be placed in the following structure:

## Boss Images (`images/bosses/`)

Required files (all `.webp` format):

1. `golden_juggernaut.webp`
2. `frost_ogre.webp`
3. `inferno_ogre.webp`
4. `phantom_arachnocrab.webp`
5. `brigand_leader.webp`
6. `venobzzar_incubator.webp`
7. `muku_chief.webp`
8. `iron_fang.webp`
9. `storm_goblin_king.webp`
10. `tempest_ogre.webp`
11. `celestial_flier.webp`
12. `lizardman_king.webp`
13. `goblin_king.webp`
14. `muku_king.webp`

## Where to get the images

The original images can be found at:
- https://bptimer.com website (inspect network tab to find image URLs)
- Or use placeholder images

## Image Specifications

- Format: WebP
- Recommended size: 256x256px or larger
- Square aspect ratio preferred
- Transparent background optional

## Fallback Behavior

If an image fails to load, the `onerror` handler will hide the image element, so the app will still function without images.
