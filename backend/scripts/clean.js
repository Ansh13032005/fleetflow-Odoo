'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
try {
  fs.rmSync(path.join(root, 'dist'), { recursive: true });
} catch {}
try {
  fs.unlinkSync(path.join(root, 'tsconfig.build.tsbuildinfo'));
} catch {}
