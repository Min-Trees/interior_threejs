import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

let cachedWoodTextures = null;
let cachedFabricBump = null;
let cachedMarbleTexture = null;
let cachedWallBump = null;

export function getParquetFloorTextures() {
  if (cachedWoodTextures) return cachedWoodTextures;

  try {
    const map = textureLoader.load('/textures/wood/diffuse.jpg');
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;

    const normalMap = textureLoader.load('/textures/wood/normal.jpg');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;

    const roughnessMap = textureLoader.load('/textures/wood/roughness.jpg');
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;

    const aoMap = textureLoader.load('/textures/wood/ao.jpg');
    aoMap.wrapS = THREE.RepeatWrapping;
    aoMap.wrapT = THREE.RepeatWrapping;

    cachedWoodTextures = {
      map,
      normalMap,
      roughnessMap,
      aoMap,
      diffuse: map,
      bumpMap: normalMap,
      bump: normalMap
    };
    return cachedWoodTextures;
  } catch (e) {
    console.warn('Fallback to procedural floor texture:', e);
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d');

  ctx.fillStyle = '#835436';
  ctx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  const rows = 16;
  const cols = 8;
  const plankH = size / rows;
  const plankW = size / cols;

  const oakColors = [
    '#8d5c3b', '#7f4f31', '#9c6742', '#885637',
    '#774a2e', '#95633e', '#a26c46', '#7d4c2d'
  ];

  for (let r = 0; r < rows; r++) {
    const isShifted = r % 2 === 1;
    const xOffset = isShifted ? -plankW / 2 : 0;

    for (let c = -1; c <= cols + 1; c++) {
      const x = c * plankW + xOffset;
      const y = r * plankH;

      const colIndex = Math.abs((r * 7 + c * 13) % oakColors.length);
      ctx.fillStyle = oakColors[colIndex];
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      ctx.fillStyle = 'rgba(40, 20, 10, 0.08)';
      for (let g = 3; g < plankH - 3; g += 4) {
        ctx.fillRect(x + 2, y + g, plankW - 4, 1.2);
      }

      bumpCtx.fillStyle = '#9e9e9e';
      bumpCtx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      bumpCtx.fillStyle = '#404040';
      bumpCtx.strokeRect(x + 0.5, y + 0.5, plankW - 1, plankH - 1);
    }
  }

  ctx.fillStyle = '#321c10';
  for (let r = 0; r <= rows; r++) {
    ctx.fillRect(0, r * plankH - 1, size, 2);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  cachedWoodTextures = { map, bumpMap, diffuse: map, bump: bumpMap, normalMap: bumpMap, roughnessMap: null, aoMap: null };
  return cachedWoodTextures;
}

export function getFabricBumpMap() {
  if (!cachedFabricBump) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#999999';
    for (let i = 0; i < size; i += 4) {
      ctx.fillRect(i, 0, 2, size);
      ctx.fillRect(0, i, size, 2);
    }

    const bumpMap = new THREE.CanvasTexture(canvas);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.repeat.set(8, 8);

    cachedFabricBump = bumpMap;
  }

  const clone = cachedFabricBump.clone();
  clone.wrapS = THREE.RepeatWrapping;
  clone.wrapT = THREE.RepeatWrapping;
  clone.needsUpdate = true;
  return clone;
}

export function getMarbleTexture() {
  if (cachedMarbleTexture) return cachedMarbleTexture;

  try {
    const map = textureLoader.load('/textures/marble/diffuse.jpg');
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.repeat.set(2, 2);

    const normalMap = textureLoader.load('/textures/marble/normal.jpg');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(2, 2);

    const roughnessMap = textureLoader.load('/textures/marble/roughness.jpg');
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(2, 2);

    const aoMap = textureLoader.load('/textures/marble/ao.jpg');
    aoMap.wrapS = THREE.RepeatWrapping;
    aoMap.wrapT = THREE.RepeatWrapping;
    aoMap.repeat.set(2, 2);

    cachedMarbleTexture = { map, normalMap, roughnessMap, aoMap };
    return cachedMarbleTexture;
  } catch (e) {
    console.warn('Fallback to procedural marble:', e);
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8f8fa';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(160, 160, 170, 0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.bezierCurveTo(70, 90, 140, 30, 256, 120);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.bezierCurveTo(90, 140, 180, 180, 220, 256);
  ctx.stroke();

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);

  cachedMarbleTexture = { map, normalMap: null, roughnessMap: null, aoMap: null };
  return cachedMarbleTexture;
}

export function getWallPlasterBump() {
  if (cachedWallBump) return cachedWallBump;

  try {
    const normalMap = textureLoader.load('/textures/plaster/normal.jpg');
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(4, 4);

    const diffMap = textureLoader.load('/textures/plaster/diffuse.jpg');
    diffMap.wrapS = THREE.RepeatWrapping;
    diffMap.wrapT = THREE.RepeatWrapping;
    diffMap.repeat.set(4, 4);

    cachedWallBump = normalMap;
    return cachedWallBump;
  } catch (e) {
    console.warn('Fallback to procedural plaster:', e);
  }

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const gray = 110 + Math.floor(Math.random() * 35);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const bumpMap = new THREE.CanvasTexture(canvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(6, 6);

  cachedWallBump = bumpMap;
  return cachedWallBump;
}

export function getSkylinePanoramaTexture(lightingMode = 'day') {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const isNight = lightingMode === 'night';

  if (!isNight) {
    // Daytime Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.72);
    skyGrad.addColorStop(0, '#5fa0d8');
    skyGrad.addColorStop(0.5, '#9bc5eb');
    skyGrad.addColorStop(0.85, '#e2effa');
    skyGrad.addColorStop(1, '#fffbf0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant soft clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.22, 110, 0, Math.PI * 2);
    ctx.arc(width * 0.28, height * 0.18, 140, 0, Math.PI * 2);
    ctx.arc(width * 0.38, height * 0.24, 90, 0, Math.PI * 2);
    ctx.fill();

    // Distant mountain silhouette
    ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.65);
    for (let x = 0; x <= width; x += 50) {
      const y = height * 0.62 + Math.sin(x * 0.012) * 18 + Math.cos(x * 0.02) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Far Skyscraper Silhouettes
    ctx.fillStyle = 'rgba(100, 116, 139, 0.55)';
    for (let i = 0; i < 42; i++) {
      const bw = 16 + (i % 5) * 8;
      const bh = 80 + ((i * 37) % 180);
      const bx = i * 25;
      ctx.fillRect(bx, height * 0.72 - bh, bw, bh + 120);
      if (i % 4 === 0) {
        ctx.fillRect(bx + bw / 2 - 1.5, height * 0.72 - bh - 20, 3, 20);
      }
    }

    // Near Skyscraper Silhouettes with glass windows
    ctx.fillStyle = 'rgba(51, 65, 85, 0.88)';
    for (let i = 0; i < 28; i++) {
      const bw = 24 + (i % 4) * 12;
      const bh = 110 + ((i * 47) % 220);
      const bx = i * 38 + 5;
      ctx.fillRect(bx, height * 0.75 - bh, bw, bh + 120);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      for (let fy = height * 0.75 - bh + 12; fy < height * 0.75; fy += 8) {
        ctx.fillRect(bx + 2, fy, bw - 4, 1.5);
      }
      ctx.fillStyle = 'rgba(51, 65, 85, 0.88)';
    }

    // Lush green park horizon
    const greenGrad = ctx.createLinearGradient(0, height * 0.72, 0, height);
    greenGrad.addColorStop(0, '#3f6212');
    greenGrad.addColorStop(0.4, '#15803d');
    greenGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = greenGrad;
    ctx.fillRect(0, height * 0.73, width, height * 0.27);
  } else {
    // Night Mode: Deep Midnight Navy to Indigo Horizon
    const nightGrad = ctx.createLinearGradient(0, 0, 0, height * 0.85);
    nightGrad.addColorStop(0, '#030712');
    nightGrad.addColorStop(0.45, '#0b1120');
    nightGrad.addColorStop(0.8, '#111827');
    nightGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let s = 0; s < 130; s++) {
      const sx = (s * 97) % width;
      const sy = (s * 37) % (height * 0.45);
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }

    // City glow horizon dome
    const glowGrad = ctx.createRadialGradient(width * 0.5, height * 0.75, 40, width * 0.5, height * 0.75, width * 0.6);
    glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.28)');
    glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Far Skyscraper Silhouettes
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 40; i++) {
      const bw = 18 + (i % 5) * 8;
      const bh = 90 + ((i * 37) % 180);
      const bx = i * 26;
      ctx.fillRect(bx, height * 0.76 - bh, bw, bh + 100);
    }

    // Near Skyscraper Silhouettes with Lit Window Grid
    for (let i = 0; i < 28; i++) {
      const bw = 24 + (i % 4) * 12;
      const bh = 110 + ((i * 47) % 220);
      const bx = i * 38 + 5;
      const topY = height * 0.78 - bh;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(bx, topY, bw, bh + 100);

      // Red antenna light
      if (i % 3 === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx + bw / 2 - 1, topY - 14, 2, 2);
      }

      // Lit Windows
      const winCols = Math.floor(bw / 5);
      const winRows = Math.floor(bh / 6);
      for (let r = 2; r < winRows - 2; r++) {
        for (let c = 1; c < winCols - 1; c++) {
          if (((r * 17 + c * 31 + i * 13) % 7) > 2) {
            const isWarm = ((r + c + i) % 3) === 0;
            ctx.fillStyle = isWarm ? 'rgba(254, 240, 138, 0.9)' : 'rgba(224, 242, 254, 0.8)';
            ctx.fillRect(bx + c * 5, topY + r * 6, 2.5, 3);
          }
        }
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function getContactShadowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(size / 2, size / 2, 6, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
  grad.addColorStop(0.35, 'rgba(15, 12, 10, 0.45)');
  grad.addColorStop(0.7, 'rgba(30, 25, 20, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// -------------------------------------------------------------
// PBR Photorealistic Detail & Micro-Imperfection Generators
// -------------------------------------------------------------
let cachedMicroImperfection = null;
let cachedDetailedFabric = null;
let cachedDetailedLeather = null;
let cachedDetailedWood = null;
let cachedBrushedMetal = null;

export function applyAnisotropicFiltering(texture, renderer) {
  if (!texture) return;
  const maxAniso = renderer?.capabilities?.getMaxAnisotropy?.() || 16;
  texture.anisotropy = maxAniso;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
}

export function getMicroImperfectionTexture() {
  if (cachedMicroImperfection) return cachedMicroImperfection;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base neutral grey
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Layer 1: Low-frequency organic cloud waviness
  for (let i = 0; i < 40; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rad = 40 + Math.random() * 80;
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
    const alpha = 0.04 + Math.random() * 0.05;
    const shade = Math.random() > 0.5 ? 255 : 0;
    grad.addColorStop(0, `rgba(${shade}, ${shade}, ${shade}, ${alpha})`);
    grad.addColorStop(1, `rgba(${shade}, ${shade}, ${shade}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 2: High-frequency micro-pores and fine grain
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let p = 0; p < data.length; p += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[p] = Math.max(0, Math.min(255, data[p] + noise));
    data[p + 1] = Math.max(0, Math.min(255, data[p + 1] + noise));
    data[p + 2] = Math.max(0, Math.min(255, data[p + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  cachedMicroImperfection = tex;
  return cachedMicroImperfection;
}

export function getDetailedFabricTextures() {
  if (cachedDetailedFabric) return cachedDetailedFabric;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fabric Normal Map: Cross-weave threads
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  const step = 4;
  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      const isWarp = (Math.floor(x / step) + Math.floor(y / step)) % 2 === 0;
      if (isWarp) {
        ctx.fillStyle = 'rgba(170, 128, 255, 0.7)';
        ctx.fillRect(x, y + 1, step, step - 2);
      } else {
        ctx.fillStyle = 'rgba(128, 170, 255, 0.7)';
        ctx.fillRect(x + 1, y, step - 2, step);
      }
    }
  }

  const normalMap = new THREE.CanvasTexture(canvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(16, 16);

  // Roughness Map: micro-variations for cloth sheen
  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');
  rCtx.fillStyle = '#dcdcdc';
  rCtx.fillRect(0, 0, size, size);
  for (let i = 0; i < size; i += 2) {
    rCtx.fillStyle = (i % 4 === 0) ? '#e6e6e6' : '#c8c8c8';
    rCtx.fillRect(0, i, size, 1);
    rCtx.fillRect(i, 0, 1, size);
  }

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(16, 16);

  cachedDetailedFabric = { normalMap, roughnessMap };
  return cachedDetailedFabric;
}

export function getDetailedLeatherTextures() {
  if (cachedDetailedLeather) return cachedDetailedLeather;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Leather normal map: Voronoi-like cellular pores
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(110, 110, 255, 0.65)';
  ctx.lineWidth = 1.2;

  const cells = 36;
  const cellSize = size / cells;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const cx = (i + 0.5) * cellSize + (Math.random() - 0.5) * (cellSize * 0.4);
      const cy = (j + 0.5) * cellSize + (Math.random() - 0.5) * (cellSize * 0.4);
      const r = cellSize * 0.45;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(90, 90, 220, 0.4)';
      ctx.fillRect(cx - 0.5, cy - 0.5, 1.5, 1.5);
    }
  }

  const normalMap = new THREE.CanvasTexture(canvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(12, 12);

  // Roughness Map: glossy peaks and matte crevices
  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');
  rCtx.fillStyle = '#7a7a7a';
  rCtx.fillRect(0, 0, size, size);

  for (let k = 0; k < 60; k++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rRad = 20 + Math.random() * 40;
    const grad = rCtx.createRadialGradient(rx, ry, 0, rx, ry, rRad);
    grad.addColorStop(0, 'rgba(160, 160, 160, 0.2)');
    grad.addColorStop(1, 'rgba(80, 80, 80, 0)');
    rCtx.fillStyle = grad;
    rCtx.beginPath();
    rCtx.arc(rx, ry, rRad, 0, Math.PI * 2);
    rCtx.fill();
  }

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(8, 8);

  cachedDetailedLeather = { normalMap, roughnessMap };
  return cachedDetailedLeather;
}

export function getDetailedWoodTextures() {
  if (cachedDetailedWood) return cachedDetailedWood;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Wood Grain Normal Map
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(150, 110, 255, 0.5)';
  ctx.lineWidth = 1.0;

  for (let y = 0; y < size; y += 4) {
    const waveAmp = 6 + Math.sin(y * 0.05) * 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < size; x += 16) {
      const wy = y + Math.sin((x + y) * 0.03) * waveAmp;
      ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  const normalMap = new THREE.CanvasTexture(canvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(3, 3);

  // Roughness Map
  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');
  rCtx.fillStyle = '#666666';
  rCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = 'rgba(150, 150, 150, 0.15)';
  for (let y = 0; y < size; y += 8) {
    rCtx.fillRect(0, y, size, 2);
  }

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(3, 3);

  cachedDetailedWood = { normalMap, roughnessMap };
  return cachedDetailedWood;
}

export function getBrushedMetalTextures() {
  if (cachedBrushedMetal) return cachedBrushedMetal;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);

  // Fine hairline brushed streaks
  ctx.fillStyle = 'rgba(160, 128, 255, 0.4)';
  for (let i = 0; i < 300; i++) {
    const y = Math.random() * size;
    const len = 40 + Math.random() * 80;
    const x = Math.random() * (size - len);
    ctx.fillRect(x, y, len, 0.8);
  }

  const normalMap = new THREE.CanvasTexture(canvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(4, 4);

  const rCanvas = document.createElement('canvas');
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext('2d');
  rCtx.fillStyle = '#333333';
  rCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = 'rgba(90, 90, 90, 0.3)';
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * size;
    rCtx.fillRect(0, y, size, 1);
  }

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  cachedBrushedMetal = { normalMap, roughnessMap };
  return cachedBrushedMetal;
}
