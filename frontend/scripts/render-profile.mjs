import fs from 'node:fs/promises';
import sharp from 'sharp';
import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
globalThis.DOMMatrix = DOMMatrix;
globalThis.ImageData = ImageData;
globalThis.Path2D = Path2D;
const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
class CanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  }
  getNoAlphaContext(canvas) {
    return canvas.getContext('2d', { alpha: false });
  }
  reset(target, width, height) {
    target.canvas.width = width;
    target.canvas.height = height;
  }
  destroy(target) {
    target.canvas.width = 0;
    target.canvas.height = 0;
    target.canvas = null;
    target.context = null;
  }
}
const bytes = new Uint8Array(
  await fs.readFile('public/downloads/paras-prints-company-profile.pdf'),
);
const document = await getDocument({
  data: bytes,
  CanvasFactory,
  isEvalSupported: false,
  useSystemFonts: true,
}).promise;
await fs.mkdir('tmp/pdfs', { recursive: true });
for (let n = 1; n <= document.numPages; n++) {
  const page = await document.getPage(n);
  const viewport = page.getViewport({ scale: 0.65 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  await fs.writeFile(`tmp/pdfs/profile-${n}.png`, canvas.toBuffer('image/png'));
  if (n === 13) {
    // The gallery uses the current typeset contact page, matching the download.
    const fullViewport = page.getViewport({ scale: 1241 / page.getViewport({ scale: 1 }).width });
    const fullCanvas = createCanvas(Math.ceil(fullViewport.width), Math.ceil(fullViewport.height));
    await page.render({ canvasContext: fullCanvas.getContext('2d'), viewport: fullViewport })
      .promise;
    await sharp(fullCanvas.toBuffer('image/png'))
      .resize(1241, 1754, { fit: 'fill' })
      .webp({ quality: 90 })
      .toFile('public/assets/Company Profile Paras_page-0013.webp');
  }
}
console.log(`Rendered ${document.numPages} profile pages for verification.`);
