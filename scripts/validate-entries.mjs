#!/usr/bin/env node
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const kinds = new Set(
  JSON.parse(readFileSync(join(root, 'scripts/element-kinds.json'), 'utf8')),
);
const SCENE_MAX = 512_000;
const PREVIEW_MAX = 400_000;
const META_DESC_MAX = 2_000;

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`${path}: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

const entriesDir = join(root, 'entries');
const slugs = readdirSync(entriesDir).filter((name) => {
  if (name.startsWith('.') || name === 'README.md') {
    return false;
  }
  return statSync(join(entriesDir, name)).isDirectory();
});

for (const slug of slugs) {
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(slug)) {
    fail(`entries/${slug}: slug must be lowercase kebab-case`);
  }
  const dir = join(entriesDir, slug);
  const scenePath = join(dir, 'scene.json');
  const metaPath = join(dir, 'meta.json');
  const previewPath = join(dir, 'preview.jpg');

  for (const file of [scenePath, metaPath, previewPath]) {
    try {
      statSync(file);
    } catch {
      fail(`missing ${file.slice(root.length + 1)}`);
    }
  }

  const sceneStat = statSync(scenePath);
  if (sceneStat.size > SCENE_MAX) {
    fail(`entries/${slug}/scene.json is ${sceneStat.size} bytes (max ${SCENE_MAX})`);
  }
  const previewStat = statSync(previewPath);
  if (previewStat.size > PREVIEW_MAX) {
    fail(`entries/${slug}/preview.jpg is ${previewStat.size} bytes (max ${PREVIEW_MAX})`);
  }

  const scene = loadJson(scenePath);
  if (!scene || typeof scene !== 'object') {
    continue;
  }
  if (!Array.isArray(scene.elements)) {
    fail(`entries/${slug}/scene.json: elements must be an array`);
    continue;
  }
  for (const element of scene.elements) {
    const kind = element && typeof element === 'object' ? element.kind : null;
    if (typeof kind !== 'string' || !kinds.has(kind)) {
      fail(`entries/${slug}/scene.json: unknown kind ${JSON.stringify(kind)}`);
    }
  }

  const meta = loadJson(metaPath);
  if (!meta || typeof meta !== 'object') {
    continue;
  }
  if (typeof meta.title !== 'string' || !meta.title.trim()) {
    fail(`entries/${slug}/meta.json: title required`);
  }
  if (typeof meta.description !== 'string' || !meta.description.trim()) {
    fail(`entries/${slug}/meta.json: description required`);
  }
  if (meta.description.length > META_DESC_MAX) {
    fail(`entries/${slug}/meta.json: description too long`);
  }
  if (!Array.isArray(meta.kinds)) {
    fail(`entries/${slug}/meta.json: kinds must be an array`);
  } else {
    for (const kind of meta.kinds) {
      if (!kinds.has(kind)) {
        fail(`entries/${slug}/meta.json: unknown kind ${JSON.stringify(kind)}`);
      }
    }
  }
  if (typeof meta.githubLogin !== 'string' || !meta.githubLogin.trim()) {
    fail(`entries/${slug}/meta.json: githubLogin required`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
console.log(`ok (${slugs.length} entries)`);
