#!/usr/bin/env node

/**
 * Extract embedded cover art from MP3 files (ID3 tags) and save as static images.
 *
 * Scans public/tracks/*.mp3, extracts artwork via jsmediatags,
 * and writes to public/covers/<track-id>.jpg
 *
 * Usage:
 *   node cli/extract-covers.mjs
 *   npm run extract-covers
 */

import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import jsmediatags from 'jsmediatags';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const TRACKS_DIR = join(ROOT, 'public', 'tracks');
const COVERS_DIR = join(ROOT, 'public', 'covers');

/** Map MIME format from ID3 to file extension */
const extForFormat = (format) => {
  if (format.includes('png')) return '.png';
  if (format.includes('webp')) return '.webp';
  return '.jpg'; // default for image/jpeg and others
};

/** Read ID3 cover from an MP3 file — promise wrapper around jsmediatags */
const extractCover = (filePath) =>
  new Promise((resolve, reject) => {
    jsmediatags.read(filePath, {
      onSuccess: (tag) => {
        const picture = tag.tags.picture;
        if (!picture) {
          resolve(null);
          return;
        }
        resolve({
          data: Buffer.from(picture.data),
          format: picture.format,
        });
      },
      onError: (err) => reject(new Error(`${err.type}: ${err.info}`)),
    });
  });

async function main() {
  if (!existsSync(TRACKS_DIR)) {
    console.error(`Tracks directory not found: ${TRACKS_DIR}`);
    process.exit(1);
  }

  if (!existsSync(COVERS_DIR)) {
    mkdirSync(COVERS_DIR, { recursive: true });
  }

  const mp3Files = readdirSync(TRACKS_DIR)
    .filter((f) => extname(f).toLowerCase() === '.mp3')
    .sort();

  if (mp3Files.length === 0) {
    console.log('No MP3 files found.');
    return;
  }

  console.log(`Found ${mp3Files.length} MP3 files, extracting covers...\n`);

  let extracted = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of mp3Files) {
    const trackId = basename(file, '.mp3');
    const mp3Path = join(TRACKS_DIR, file);

    try {
      const cover = await extractCover(mp3Path);

      if (!cover) {
        console.log(`  ⚠ ${trackId} — no embedded cover`);
        skipped++;
        continue;
      }

      const ext = extForFormat(cover.format);
      const outPath = join(COVERS_DIR, `${trackId}${ext}`);
      writeFileSync(outPath, cover.data);
      console.log(`  ✓ ${trackId}${ext} (${(cover.data.length / 1024).toFixed(1)} KB)`);
      extracted++;
    } catch (err) {
      console.error(`  ✗ ${trackId} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${extracted} extracted, ${skipped} skipped, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
