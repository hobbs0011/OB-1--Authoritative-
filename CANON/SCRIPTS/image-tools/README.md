# CANON Image Tools

Resize and render image assets for CANON portals and apps.

## Scripts

- `node resize.js <input> <output> [width] [quality]`
- `node render.js <input> [outputDir]`
- `node audit.js [assetsDir] [maxSizeKB]`

## Notes

- Uses `sharp` for all image operations
- Output formats: jpeg or png based on extension
- Default max audit size: 500KB
