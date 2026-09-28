// Performance pass (2026-09-28): generates a .webp sibling for every raster
// image in assets/img (the original .jpg/.png stays as the <picture> / image-set
// fallback), plus the favicon set and the Open Graph image.
//
// Usage (sharp is not a repo dependency — install it ad hoc):
//   npm i --no-save sharp && node scripts/build-images.mjs
//
// Re-run whenever a .jpg/.png is added or replaced in assets/img.
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const IMG = path.join(ROOT, "assets/img");

// Sources far larger than their biggest rendered box get a smaller WebP
// (long edge, px). Every cap is still >= 2x the largest CSS size at 1440px,
// so retina rendering is unchanged. Everything else keeps its source size.
const MAX_EDGE = {
  "intro-statue.jpg": 840,       // box 205x204
  "intro-tower.jpg": 840,        // box 245x327
  "intro-instruments.jpg": 840,  // box 272x280
  "intro-dress.jpg": 840,        // box 272x407
  "intro-carpets.jpg": 840,      // box 367x245
  "intro-tourists.jpg": 840,     // box 231x308
  "appar-tower-bg.jpg": 2800,    // box 1392 wide
};

async function toWebp(file) {
  const src = path.join(IMG, file);
  const out = src.replace(/\.(jpe?g|png)$/i, ".webp");
  let img = sharp(src);
  const cap = MAX_EDGE[file];
  if (cap) img = img.resize({ width: cap, height: cap, fit: "inside", withoutEnlargement: true });
  const isPng = /\.png$/i.test(file);
  await img.webp({ quality: isPng ? 82 : 80, alphaQuality: 100, effort: 6 }).toFile(out);
}

// ---------- Favicon set: bull-head emblem from the logo, white on brand ----------
const BRAND = "#886D46"; // --c-brand (css/tokens.css)
async function favicons() {
  const logo = (await import("node:fs")).readFileSync(path.join(IMG, "hero-logo-dark.svg"), "utf8");
  // Crop the logo's viewBox to the central bull-head emblem (logo units).
  const inner = logo.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/#222222/g, "#FFFFFF");
  const pad = 5, x = 51.4 - pad, y = 56.4 - pad, s = 22 + pad * 2;
  const svg = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${s} ${s}">` +
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * radius}" fill="${BRAND}"/>${inner}</svg>`;
  const render = (size, radius, name) =>
    sharp(Buffer.from(svg(radius)), { density: 72 * size / s * 4 }).resize(size, size).png().toFile(path.join(ROOT, name));

  await render(16, 0.18, "favicon-16x16.png");
  await render(32, 0.18, "favicon-32x32.png");
  await render(180, 0, "apple-touch-icon.png"); // iOS applies its own mask
  await render(192, 0.18, "android-chrome-192x192.png");
  await render(512, 0.18, "android-chrome-512x512.png");

  // favicon.ico with PNG-encoded 16/32/48 entries (valid since Windows Vista).
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map((n) =>
    sharp(Buffer.from(svg(0.18)), { density: 72 * n / s * 4 }).resize(n, n).png().toBuffer()));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((n, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(n, e); header.writeUInt8(n, e + 1);
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(pngs[i].length, e + 8); header.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  await writeFile(path.join(ROOT, "favicon.ico"), Buffer.concat([header, ...pngs]));
}

// ---------- Open Graph image (1200x630): hero photo + white logo ----------
async function ogImage() {
  const W = 1200, H = 630;
  const logo = await sharp(path.join(IMG, "hero-logo.svg"), { density: 600 }).resize({ width: 300 }).png().toBuffer();
  const scrim = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".55" stop-color="#000" stop-opacity="0"/>
    </linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`);
  await sharp(path.join(IMG, "hero-bg.jpg"))
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([{ input: scrim }, { input: logo, top: 56, left: 64 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(IMG, "og-image.jpg"));
}

await ogImage();
const files = (await readdir(IMG)).filter((f) => /\.(jpe?g|png)$/i.test(f));
await Promise.all(files.map(toWebp));
await favicons();
console.log(`webp: ${files.length} files`);
