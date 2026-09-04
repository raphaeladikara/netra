/**
 * Turns the Indonesian License Plate Dataset into the assets this demo ships:
 *
 *   public/frames/<id>.jpg   16:9 camera frame, lightly graded to read as CCTV
 *   public/plates/<id>_<n>.jpg   zoomed crop of one plate
 *   src/lib/frames.ts        real bounding boxes + plate text + per-character OCR boxes
 *
 * The dataset is not vendored. Point DATA_ROOT at a local copy and run:
 *   npx --yes -p sharp@0.34 node scripts/prepare-frames.mjs
 *
 * Source: "Indonesian License Plate Dataset" and "Indonesian License Plate
 * Recognition Dataset" (Kaggle). Detection labels are YOLO-normalised; the
 * recognition set carries one crop per plate, named <image>_<plateIndex>.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = require('sharp')

const ROOT = process.env.DATA_ROOT ?? 'C:/Users/Raphael Angelo/Code/IMS/NodeFlux/data'
const DET = path.join(ROOT, 'Indonesian License Plate Dataset')
const REC = path.join(ROOT, 'Indonesian License Plate Recognition Dataset')

const FRAME_W = 1024
const FRAME_H = 576
const PLATE_W = 720

const PICKS = JSON.parse(fs.readFileSync('scripts/frames.picks.json', 'utf8'))

fs.mkdirSync('public/frames', { recursive: true })
fs.mkdirSync('public/plates', { recursive: true })

const CLASSES = fs.readFileSync(path.join(REC, 'classes.names'), 'utf8').trim().split(/\r?\n/)

const splitOf = (id) => (id.startsWith('train') ? 'train' : id.startsWith('val') ? 'val' : 'test')

function detPlates(id) {
  const p = path.join(DET, 'labelswithLP', splitOf(id), `${id}.txt`)
  return fs
    .readFileSync(p, 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [, cx, cy, w, h, text] = line.trim().split(/\s+/)
      return { cx: +cx, cy: +cy, w: +w, h: +h, text: text ?? '' }
    })
}

/** per-character boxes for plate #n of an image, if the recognition set has it */
function recChars(id, n) {
  const p = path.join(REC, 'labels', splitOf(id), `${id}_${n}.txt`)
  if (!fs.existsSync(p)) return null
  return fs
    .readFileSync(p, 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [c, cx, cy, w, h] = line.trim().split(/\s+/)
      return { c: CLASSES[+c], cx: +cx, cy: +cy, w: +w, h: +h }
    })
    .sort((a, b) => a.cx - b.cx)
    .map((k) => ({
      c: k.c,
      x: +((k.cx - k.w / 2) * 100).toFixed(2),
      y: +((k.cy - k.h / 2) * 100).toFixed(2),
      w: +(k.w * 100).toFixed(2),
      h: +(k.h * 100).toFixed(2),
    }))
}

const out = {}

for (const [id, cfg] of Object.entries(PICKS)) {
  const src = path.join(DET, 'images', splitOf(id), `${id}.jpg`)
  const plates = detPlates(id)
  const { width: W, height: H } = await sharp(src).metadata()

  const heroIdx = cfg.plate ?? plates.reduce((best, p, i) => (p.w > plates[best].w ? i : best), 0)
  const hero = plates[heroIdx]

  const bandH = Math.round(W * (9 / 16))
  const top = Math.max(0, Math.min(H - bandH, Math.round(hero.cy * H - bandH / 2)))

  await sharp(src)
    .extract({ left: 0, top, width: W, height: bandH })
    .resize(FRAME_W, FRAME_H, { fit: 'cover' })
    // a light grade: CCTV sensors are less saturated and a touch flatter than a phone
    .modulate({ saturation: 0.74, brightness: 0.96 })
    .linear(1.06, -8)
    .jpeg({ quality: 74, mozjpeg: true })
    .toFile(`public/frames/${id}.jpg`)

  const boxes = plates
    .map((p, i) => {
      const yPx = p.cy * H - top
      const hPx = p.h * H
      if (yPx - hPx / 2 < -4 || yPx + hPx / 2 > bandH + 4) return null
      return {
        i,
        text: p.text,
        x: +((p.cx - p.w / 2) * 100).toFixed(2),
        y: +(((yPx - hPx / 2) / bandH) * 100).toFixed(2),
        w: +(p.w * 100).toFixed(2),
        h: +((hPx / bandH) * 100).toFixed(2),
      }
    })
    .filter(Boolean)
    .filter((b) => b.text)

  // zoomed crop of the hero plate, for the ANPR extraction panel
  const padX = hero.w * W * 0.3
  const padY = hero.h * H * 0.9
  const left = Math.max(0, Math.round((hero.cx - hero.w / 2) * W - padX))
  const cTop = Math.max(0, Math.round((hero.cy - hero.h / 2) * H - padY))
  const cropName = `${id}_${heroIdx + 1}`
  await sharp(src)
    .extract({
      left,
      top: cTop,
      width: Math.min(W - left, Math.round(hero.w * W + padX * 2)),
      height: Math.min(H - cTop, Math.round(hero.h * H + padY * 2)),
    })
    .resize(PLATE_W, null, { fit: 'inside' })
    .sharpen()
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(`public/plates/${cropName}.jpg`)

  // the recognition set ships its own tight crop; the character boxes are
  // measured against that, so overlay them on it rather than on the padded one
  let ocr = null
  const recSrc = path.join(REC, 'images', splitOf(id), `${cropName}.jpg`)
  if (fs.existsSync(recSrc)) {
    await sharp(recSrc)
      .resize(760, null, { fit: 'inside' })
      .sharpen()
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(`public/plates/${cropName}_ocr.jpg`)
    ocr = `/plates/${cropName}_ocr.jpg`
  }

  out[id] = {
    id,
    src: `/frames/${id}.jpg`,
    zone: cfg.zone,
    hero: heroIdx,
    crop: `/plates/${cropName}.jpg`,
    ocr,
    chars: recChars(id, heroIdx + 1),
    boxes: boxes.map(({ i, ...b }) => b),
  }

  const kb = (fs.statSync(`public/frames/${id}.jpg`).size / 1024).toFixed(0)
  console.log(`${id.padEnd(10)} ${hero.text.padEnd(10)} ${kb.padStart(3)}KB  boxes=${boxes.length} chars=${out[id].chars?.length ?? 0}`)
}

const ts = `// GENERATED by scripts/prepare-frames.mjs — do not edit by hand.
// Frames and boxes come from the Indonesian License Plate Dataset; every plate
// string and every rectangle below is the dataset's own annotation, not invented.

export type CharBox = { c: string; x: number; y: number; w: number; h: number }
export type PlateBox = { text: string; x: number; y: number; w: number; h: number }

export type Frame = {
  id: string
  src: string
  /** zoomed crop of the primary plate, with context */
  crop: string
  /** tight crop the character boxes are measured against */
  ocr: string | null
  /** index of the primary plate within \`boxes\` */
  hero: number
  /** per-character OCR boxes for the primary plate, in crop coordinates */
  chars: CharBox[] | null
  boxes: PlateBox[]
}

export const frames: Record<string, Frame> = ${JSON.stringify(
  Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { id: v.id, src: v.src, crop: v.crop, ocr: v.ocr, hero: v.hero, chars: v.chars, boxes: v.boxes }])),
  null,
  2,
)}

export { formatPlate } from './plate'
`
fs.writeFileSync('src/lib/frames.ts', ts)
console.log(`\nwrote ${Object.keys(out).length} frames -> src/lib/frames.ts`)
