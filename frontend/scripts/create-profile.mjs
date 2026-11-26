import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import sharp from 'sharp';
const pdf = await PDFDocument.create();
pdf.setTitle('Paras Prints Solutions — Company Profile');
pdf.setSubject('Company profile with updated contact details.');
for (let n = 1; n <= 12; n++) {
  const filename = `Company Profile Paras_page-${String(n).padStart(4, '0')}.webp`;
  const bytes = await sharp(await fs.readFile(path.join('public/assets', filename)))
    .png()
    .toBuffer();
  const image = await pdf.embedPng(bytes);
  const page = pdf.addPage([595.28, 841.89]);
  const scale = Math.min(page.getWidth() / image.width, page.getHeight() / image.height);
  const width = image.width * scale,
    height = image.height * scale;
  page.drawImage(image, {
    x: (page.getWidth() - width) / 2,
    y: (page.getHeight() - height) / 2,
    width,
    height,
  });
}
// Typeset the current contact page from the same settings as the website.
const {
  settings: { company },
} = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
const contact = pdf.addPage([595.28, 841.89]);
const regular = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const ink = rgb(0.13, 0.13, 0.13);
const accent = rgb(0.61, 0.31, 0.18);
contact.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(0.98, 0.97, 0.95) });
contact.drawRectangle({ x: 0, y: 817, width: 595.28, height: 25, color: accent });
const logo = await pdf.embedPng(await sharp('public/assets/logo.webp').png().toBuffer());
contact.drawImage(logo, { x: 48, y: 704, width: 230, height: (230 * logo.height) / logo.width });
const text = (value, x, y, size = 14, font = regular, color = ink) =>
  contact.drawText(value, { x, y, size, font, color });
text('CONTACT US', 48, 650, 11, bold, accent);
text("Let's talk about your", 48, 602, 32, bold);
text('next project.', 48, 560, 32, bold);
contact.drawLine({
  start: { x: 48, y: 527 },
  end: { x: 547, y: 527 },
  thickness: 1,
  color: rgb(0.8, 0.77, 0.72),
});
text('CALL THE TEAM', 48, 491, 10, bold, accent);
company.phones.forEach(({ number }, index) => text(number, 48, 461 - index * 30, 20, bold));
text('EMAIL', 48, 350, 10, bold, accent);
text(company.email, 48, 322, 19);
text('WHATSAPP', 48, 271, 10, bold, accent);
text('+91 87503 81381', 48, 243, 20, bold);
text(company.whatsapp, 48, 220, 12);
text('VISIT US', 48, 169, 10, bold, accent);
text('B-8, B.S. Road Industrial Area,', 48, 142, 14);
text('Ghaziabad (UP), India', 48, 121, 14);
text('Please contact the team before visiting.', 48, 93, 11);
text(company.name, 48, 36, 10, bold, accent);
const directory = 'public/downloads';
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(path.join(directory, 'paras-prints-company-profile.pdf'), await pdf.save());
console.log('Company profile created: 12 supplied pages and an updated contact page.');
