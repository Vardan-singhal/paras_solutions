import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const frontend = fileURLToPath(new URL('../', import.meta.url));
const root = path.dirname(frontend.replace(/[\\/]$/, ''));
const publicRoot = path.join(frontend, 'public');
const limit = 500_000;
const reportPath = path.join(frontend, 'output/image-optimization.json');
const check = process.argv.includes('--check');
const imageExtension = /\.(?:jpe?g|png|webp|gif|avif|tiff?|bmp)$/i;

async function filesIn(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map((entry) => {
      const filename = path.join(directory, entry.name);
      return entry.isDirectory() ? filesIn(filename) : [filename];
    }),
  );
  return groups.flat();
}

const images = (await filesIn(publicRoot)).filter((filename) => imageExtension.test(filename));
if (check) {
  for (const filename of images) {
    assert.equal(path.extname(filename).toLowerCase(), '.webp', filename);
    assert((await fs.stat(filename)).size <= limit, `${filename} exceeds 500 KB`);
    assert.equal((await sharp(filename).metadata()).format, 'webp', filename);
  }
  const references = new Set();
  const sourceFiles = (
    await Promise.all([
      filesIn(path.join(frontend, 'src')),
      filesIn(path.join(root, 'backend/data/original')),
    ])
  )
    .flat()
    .filter((filename) => /\.(?:jsx?|ts|json|css)$/.test(filename));
  for (const filename of sourceFiles) {
    const source = await fs.readFile(filename, 'utf8');
    for (const [, reference] of source.matchAll(/["'](\/assets\/[^"']+)["']/g)) {
      references.add(reference);
    }
    if (filename.endsWith('ClientIdentity.jsx')) {
      for (const [, logo] of source.matchAll(/: '([^']+\.webp)'/g)) {
        references.add('/assets/Client Logos/' + logo);
      }
    }
  }
  for (const reference of references) {
    const pathname = decodeURIComponent(new URL(reference, 'http://localhost').pathname);
    assert.equal(path.posix.extname(pathname), '.webp', reference);
    await fs.access(path.join(publicRoot, pathname.slice(1)));
  }
  console.log(
    `Verified ${images.length} public images: all WebP and at most 500 KB; ${references.size} local asset references resolve.`,
  );
} else {
  const backup = path.join(root, '.local-backup', `images-${Date.now()}`);
  const entries = [];
  const destinations = new Set();
  for (const filename of images) {
    const destination = filename.replace(imageExtension, '.webp');
    assert(!destinations.has(destination), `Conflicting WebP destination: ${destination}`);
    destinations.add(destination);
    const input = await fs.readFile(filename);
    const metadata = await sharp(input).metadata();
    const relative = path.relative(publicRoot, filename);
    const backupFile = path.join(backup, relative);
    await fs.mkdir(path.dirname(backupFile), { recursive: true });
    await fs.writeFile(backupFile, input);

    let output;
    if (metadata.format === 'webp' && input.length <= limit) {
      output = input;
    } else {
      const budget = Math.min(limit, input.length);
      // Keep small artwork and transparency lossless whenever the budget allows.
      if (input.length <= limit && metadata.format !== 'jpeg') {
        const lossless = await sharp(input).webp({ lossless: true, effort: 5 }).toBuffer();
        if (lossless.length <= budget) output = lossless;
      }
      let smallest;
      for (const quality of [92, 88, 84, 80, 76, 72, 68, 64, 60, 50, 40, 30, 20, 10]) {
        if (output) break;
        const candidate = await sharp(input)
          .webp({ quality, alphaQuality: 100, effort: 5 })
          .toBuffer();
        if (!smallest || candidate.length < smallest.length) smallest = candidate;
        if (candidate.length <= budget) output = candidate;
      }
      if (!output && smallest?.length <= limit) output = smallest;
    }
    assert(
      output,
      `Cannot meet 500 KB without resizing ${relative}; originals backed up at ${backup}`,
    );
    const converted = await sharp(output).metadata();
    assert.equal(converted.width, metadata.width, relative);
    assert.equal(converted.height, metadata.height, relative);
    if (metadata.hasAlpha && !(await sharp(input).stats()).isOpaque) {
      assert(converted.hasAlpha, `Transparency lost: ${relative}`);
    }
    await fs.writeFile(destination, output);
    entries.push({
      from: '/' + relative.split(path.sep).join('/'),
      to: '/' + path.relative(publicRoot, destination).split(path.sep).join('/'),
      originalBytes: input.length,
      bytes: output.length,
      width: converted.width,
      height: converted.height,
      sha256: crypto.createHash('sha256').update(output).digest('hex'),
    });
    console.log(
      `${relative}: ${Math.ceil(input.length / 1000)} KB → ${Math.ceil(output.length / 1000)} KB`,
    );
  }

  // Update executable source and content, including seed data and asset-generation scripts.
  const sourceFiles = (
    await Promise.all([
      filesIn(path.join(frontend, 'src')),
      filesIn(path.join(frontend, 'scripts')),
      filesIn(path.join(root, 'backend/data/original')),
      filesIn(path.join(root, 'backend/src')),
    ])
  )
    .flat()
    .filter(
      (filename) =>
        /\.(?:jsx?|mjs|cjs|ts|json|css|html)$/.test(filename) &&
        filename !== fileURLToPath(import.meta.url),
    );
  for (const filename of sourceFiles) {
    let source = await fs.readFile(filename, 'utf8');
    const previous = source;
    for (const entry of entries.filter((entry) => entry.from !== entry.to)) {
      source = source
        .replaceAll(entry.from, entry.to)
        .replaceAll(encodeURI(entry.from), encodeURI(entry.to));
      if (filename.endsWith('ClientIdentity.jsx') || filename.endsWith('create-content.cjs')) {
        source = source.replaceAll(path.posix.basename(entry.from), path.posix.basename(entry.to));
      }
    }
    if (source !== previous) await fs.writeFile(filename, source);
  }
  // Remove superseded public files only after conversion and source migration succeed.
  for (const entry of entries.filter((entry) => entry.from !== entry.to)) {
    const filename = path.resolve(publicRoot, '.' + entry.from);
    assert(filename.startsWith(publicRoot + path.sep), 'Image path outside public directory');
    await fs.unlink(filename);
  }
  const originalBytes = entries.reduce((total, entry) => total + entry.originalBytes, 0);
  const bytes = entries.reduce((total, entry) => total + entry.bytes, 0);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(
    reportPath,
    JSON.stringify({ limit, backup, originalBytes, bytes, entries }, null, 2) + '\n',
  );
  console.log(JSON.stringify({ images: entries.length, originalBytes, bytes, backup, reportPath }));
}
