#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
// Generates public/icon-192.png and public/icon-512.png
// No external dependencies — uses only Node built-ins (zlib, fs)
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

// CRC32 table for PNG chunks
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ b) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcVal]);
}

function inRoundedRect(x, y, rx, ry, rw, rh, r) {
  if (x < rx || x > rx + rw || y < ry || y > ry + rh) return false;
  // corners
  if (x < rx + r && y < ry + r) return Math.hypot(x - (rx + r), y - (ry + r)) <= r;
  if (x > rx + rw - r && y < ry + r) return Math.hypot(x - (rx + rw - r), y - (ry + r)) <= r;
  if (x < rx + r && y > ry + rh - r) return Math.hypot(x - (rx + r), y - (ry + rh - r)) <= r;
  if (x > rx + rw - r && y > ry + rh - r) return Math.hypot(x - (rx + rw - r), y - (ry + rh - r)) <= r;
  return true;
}

function lerp(a, b, t) { return Math.round(a + (b - a) * Math.max(0, Math.min(1, t))); }

function createIcon(size) {
  const cx = size / 2, cy = size / 2;

  // Card dimensions (portrait card shape)
  const cw = size * 0.56, ch = size * 0.72;
  const cr = size * 0.09; // corner radius
  const c1x = cx - cw / 2, c1y = cy - ch / 2;

  // Second card offset (deck effect)
  const offset = size * 0.07;
  const c2x = c1x + offset, c2y = c1y + offset;

  // Rows of RGBA pixels (with filter byte 0 = None prepended per row)
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = [0]; // filter byte
    for (let x = 0; x < size; x++) {
      // Background: #0f1117
      let r = 15, g = 17, b = 23;

      // Back card (slightly darker indigo)
      if (inRoundedRect(x, y, c2x, c2y, cw, ch, cr)) {
        const t = (y - c2y) / ch;
        r = lerp(55, 45, t);
        g = lerp(48, 40, t);
        b = lerp(163, 200, t);
      }

      // Front card (indigo → violet gradient)
      if (inRoundedRect(x, y, c1x, c1y, cw, ch, cr)) {
        const t = (y - c1y) / ch;
        r = lerp(99, 124, t);
        g = lerp(102, 58, t);
        b = lerp(241, 237, t);

        // Subtle inner border highlight (top-left glow)
        const distFromEdge = Math.min(x - c1x, c1x + cw - x, y - c1y, c1y + ch - y);
        if (distFromEdge < size * 0.015) {
          r = lerp(r, 200, 0.3);
          g = lerp(g, 190, 0.3);
          b = lerp(b, 255, 0.4);
        }

        // Center diamond / suit symbol (simplified as a rotated square)
        const dx = Math.abs(x - cx), dy = Math.abs(y - (c1y + ch * 0.42));
        const dm = size * 0.11;
        if (dx + dy < dm) {
          const dt = (dx + dy) / dm;
          r = lerp(220, r, dt);
          g = lerp(220, g, dt);
          b = lerp(255, b, dt);
        }
      }

      row.push(r, g, b, 255);
    }
    rows.push(...row);
  }

  const pixelData = Buffer.from(rows);
  const compressed = zlib.deflateSync(pixelData, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

const out = path.join(__dirname, "../public");
fs.writeFileSync(path.join(out, "icon-192.png"), createIcon(192));
fs.writeFileSync(path.join(out, "icon-512.png"), createIcon(512));
console.log("✓ icon-192.png and icon-512.png written to public/");
