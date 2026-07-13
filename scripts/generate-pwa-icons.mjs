// Generates PWA + Apple icons from the brand SVG.
//
//   npm i -D sharp        # one-off (build-time only)
//   node scripts/generate-pwa-icons.mjs
//
// Outputs into public/icons and public/. Re-run whenever the source logo
// changes. For full native (Android adaptive / iOS) asset sets, prefer
// `npx @capacitor/assets generate` once the android/ios projects exist.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "public/icons/taskutark-logo.svg");
const ICONS = resolve(root, "public/icons");
const PUBLIC = resolve(root, "public");
const BG = "#ffffff"; // matches manifest background_color

await mkdir(ICONS, { recursive: true });

// "any"-purpose icons: full-bleed transparent, crisp at every size.
async function anyIcon(size) {
  await sharp(SRC, { density: 512 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(ICONS, `icon-${size}.png`));
}

// maskable icons: logo at 80% inside the safe zone on an opaque background so
// Android's circular/squircle mask never clips it.
async function maskableIcon(size) {
  const inner = Math.round(size * 0.8);
  const logo = await sharp(SRC, { density: 512 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const pad = Math.round((size - inner) / 2);
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(resolve(ICONS, `icon-maskable-${size}.png`));
}

// Apple touch icon: opaque background (iOS ignores transparency), 180×180.
async function appleTouchIcon() {
  const inner = 148;
  const logo = await sharp(SRC, { density: 512 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const pad = Math.round((180 - inner) / 2);
  await sharp({ create: { width: 180, height: 180, channels: 4, background: BG } })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(resolve(PUBLIC, "apple-touch-icon.png"));
}

await Promise.all([
  anyIcon(192),
  anyIcon(512),
  maskableIcon(192),
  maskableIcon(512),
  appleTouchIcon(),
  sharp(SRC, { density: 512 }).resize(32, 32).png().toFile(resolve(PUBLIC, "favicon.png")),
]);

console.log("✓ Generated PWA icons in public/icons and public/");
