import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Camera,
  ShoppingBag,
  RefreshCw,
  Eye,
  Check,
  Sun,
  Moon,
  Sparkles,
  Footprints,
  Compass,
  Navigation,
  Lock,
  Unlock,
  HelpCircle,
  Move,
  Layers,
  Palette,
  Ruler,
  X,
  ExternalLink,
  Box
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  getParquetFloorTextures,
  getFabricBumpMap,
  getMarbleTexture,
  getWallPlasterBump,
  getSkylinePanoramaTexture,
  getContactShadowTexture,
  applyAnisotropicFiltering,
  getMicroImperfectionTexture,
  getDetailedFabricTextures,
  getDetailedLeatherTextures,
  getDetailedWoodTextures,
  getBrushedMetalTextures
} from '../utils/roomTextures';

// DRACOLoader and GLTFLoader Singleton setup
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/gltf/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Model Cache Map to prevent redundant downloads
const modelCacheMap = new Map();

// Environment Map Cache Map
const envCacheMap = new Map();
const rgbeLoader = new RGBELoader();

// High-fidelity Photorealistic Model Map
const ROLE_TO_MODEL_MAP = {
  SOFA: '/models/furniture/sofa_luxury.glb',
  ARMCHAIR: '/models/furniture/armchair_barcelona.glb',
  COFFEE_TABLE: '/models/furniture/coffee_table/scene.gltf',
  TV_STAND: '/models/furniture/cabinet/scene.gltf',
  DINING_TABLE: '/models/furniture/dining_table/scene.gltf',
  DINING_CHAIR: '/models/furniture/dining_chair/scene.gltf',
  BED: '/models/furniture/bed/scene.gltf',
  WARDROBE: '/models/furniture/cabinet/scene.gltf',
  DESK: '/models/furniture/desk/scene.gltf',
  OFFICE_CHAIR: '/models/furniture/office_chair/scene.gltf',
  BOOKSHELF: '/models/furniture/bookshelf/scene.gltf',
  FLOOR_LAMP: '/models/furniture/lamp/scene.gltf',
  PLANT: '/models/furniture/plant/scene.gltf',
};

const updateHDRIEnvironment = (renderer, scene, mode) => {
  if (!renderer || !scene) return;
  const isNight = mode === 'night';
  const hdrUrl = isNight ? '/hdri/night_environment.hdr' : '/hdri/day_environment.hdr';

  const applyTexture = (envTexture) => {
    scene.environment = envTexture;
    if ('environmentIntensity' in scene) {
      scene.environmentIntensity = isNight ? 0.35 : 0.68;
    }
  };

  if (envCacheMap.has(hdrUrl)) {
    applyTexture(envCacheMap.get(hdrUrl));
  } else {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    rgbeLoader.load(
      hdrUrl,
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        envCacheMap.set(hdrUrl, envMap);
        applyTexture(envMap);
        texture.dispose();
        pmremGenerator.dispose();
      },
      undefined,
      (err) => {
        console.warn('Fallback HDRI load:', err);
      }
    );
  }
};

const formatPrice = (amount) => {
  if (!amount) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
};

const INSPECTION_MATERIAL_PRESETS = [
  { id: 'cognac', name: 'Da Bò Ý', color: '#7a421f', roughness: 0.45, metalness: 0.05, type: 'leather' },
  { id: 'nappa_black', name: 'Da Đen Nappa', color: '#18191c', roughness: 0.42, metalness: 0.08, type: 'leather' },
  { id: 'scandi_grey', name: 'Vải Nỉ Bắc Âu', color: '#4a4c52', roughness: 0.88, metalness: 0.02, type: 'fabric' },
  { id: 'navy_velvet', name: 'Nhung Tuyết Navy', color: '#16233b', roughness: 0.82, metalness: 0.05, type: 'fabric' },
  { id: 'walnut_wood', name: 'Gỗ Óc Chó Mỹ', color: '#382216', roughness: 0.38, metalness: 0.04, type: 'wood' },
  { id: 'calacatta_marble', name: 'Đá Calacatta', color: '#edebe6', roughness: 0.26, metalness: 0.04, type: 'marble' }
];

function upgradeModelMaterials(model, renderer, item) {
  const role = item?.roomPlacementRole || '';
  const detailedFabric = getDetailedFabricTextures();
  const detailedLeather = getDetailedLeatherTextures();
  const detailedWood = getDetailedWoodTextures();
  const brushedMetal = getBrushedMetalTextures();
  const microImperfection = getMicroImperfectionTexture();

  model.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];

    mats.forEach((mat) => {
      // 1. Anisotropic Filtering on all existing textures
      [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap].forEach((tex) => {
        if (tex) applyAnisotropicFiltering(tex, renderer);
      });

      const name = ((child.name || '') + ' ' + (mat.name || '')).toLowerCase();

      // 2. Identify material categories
      const isFabric = name.includes('fabric') || name.includes('cushion') || name.includes('cloth') || 
                       name.includes('pillow') || name.includes('blanket') || name.includes('mattress') ||
                       (role === 'BED' && !name.includes('wood') && !name.includes('frame'));

      const isLeather = name.includes('leather') || name.includes('da') || 
                        (role === 'SOFA' && !name.includes('leg') && !name.includes('wood') && !isFabric) ||
                        (role === 'ARMCHAIR' && !name.includes('frame') && !name.includes('metal'));

      const isWood = name.includes('wood') || name.includes('timber') || name.includes('oak') || 
                     name.includes('walnut') || role === 'DINING_TABLE' || role === 'TV_STAND';

      const isMetal = name.includes('metal') || name.includes('chrome') || name.includes('brass') || 
                      name.includes('gold') || name.includes('steel') || name.includes('leg') || name.includes('frame');

      const isGlass = name.includes('glass') || name.includes('mirror') || name.includes('window');

      // 3. Convert or upgrade to MeshPhysicalMaterial
      if (isFabric) {
        if (!(mat instanceof THREE.MeshPhysicalMaterial)) {
          child.material = new THREE.MeshPhysicalMaterial({
            map: mat.map,
            color: mat.color,
            roughness: 0.88,
            metalness: 0.02,
            normalMap: mat.normalMap || detailedFabric.normalMap,
            normalScale: new THREE.Vector2(0.8, 0.8),
            roughnessMap: mat.roughnessMap || detailedFabric.roughnessMap,
            sheen: 0.35,
            sheenRoughness: 0.6,
            sheenColor: new THREE.Color(0xdad7ce),
          });
        } else {
          mat.sheen = 0.35;
          mat.sheenRoughness = 0.6;
          mat.sheenColor = new THREE.Color(0xdad7ce);
          mat.roughness = Math.max(mat.roughness, 0.82);
          if (!mat.normalMap) mat.normalMap = detailedFabric.normalMap;
        }
      } else if (isLeather) {
        if (!(mat instanceof THREE.MeshPhysicalMaterial)) {
          child.material = new THREE.MeshPhysicalMaterial({
            map: mat.map,
            color: mat.color,
            roughness: 0.48,
            metalness: 0.05,
            normalMap: mat.normalMap || detailedLeather.normalMap,
            normalScale: new THREE.Vector2(0.9, 0.9),
            roughnessMap: mat.roughnessMap || detailedLeather.roughnessMap,
            clearcoat: 0.15,
            clearcoatRoughness: 0.4,
            specularIntensity: 0.85,
          });
        } else {
          mat.roughness = 0.48;
          mat.clearcoat = 0.15;
          mat.specularIntensity = 0.85;
          if (!mat.normalMap) mat.normalMap = detailedLeather.normalMap;
        }
      } else if (isWood) {
        if (!(mat instanceof THREE.MeshPhysicalMaterial)) {
          child.material = new THREE.MeshPhysicalMaterial({
            map: mat.map,
            color: mat.color,
            roughness: 0.42,
            metalness: 0.04,
            normalMap: mat.normalMap || detailedWood.normalMap,
            normalScale: new THREE.Vector2(0.6, 0.6),
            roughnessMap: mat.roughnessMap || detailedWood.roughnessMap,
            clearcoat: 0.35,
            clearcoatRoughness: 0.25,
          });
        } else {
          mat.clearcoat = 0.35;
          mat.clearcoatRoughness = 0.25;
          if (!mat.normalMap) mat.normalMap = detailedWood.normalMap;
        }
      } else if (isMetal) {
        mat.metalness = 0.95;
        mat.roughness = 0.16;
        if (!mat.normalMap && brushedMetal?.normalMap) {
          mat.normalMap = brushedMetal.normalMap;
          mat.normalScale = new THREE.Vector2(0.4, 0.4);
        }
      } else if (isGlass) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.95,
          opacity: 1.0,
          transparent: true,
          roughness: 0.04,
          ior: 1.52,
          thickness: 0.06,
          specularIntensity: 1.0,
        });
      }

      // 4. Inject subtle micro-imperfections if no dedicated roughness map exists
      if (child.material && !child.material.roughnessMap && microImperfection) {
        child.material.roughnessMap = microImperfection;
      }
      child.material.needsUpdate = true;
    });
  });
}

export default function RoomScene3D({
  layoutData,
  onSelectItem,
  selectedItem,
  onRefineItem,
  lightingMode = 'day', // 'day' | 'night'
  wallColor = '#25262a', // hex string
  activeFloor = 1,
  onSelectFloor,
}) {
  const mountRef = useRef(null);
  const minimapCanvasRef = useRef(null);
  const { addToCart } = useCart();

  // Navigation Mode: 'walkthrough' (First-person 1.6m) | 'orbit' (Overhead 360°)
  const [navMode, setNavMode] = useState('walkthrough');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [nearbyItem, setNearbyItem] = useState(null);
  const [addedItemSuccess, setAddedItemSuccess] = useState(false);
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectedMaterialPreset, setInspectedMaterialPreset] = useState(null);
  const [showRuler, setShowRuler] = useState(false);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const pmremGenRef = useRef(null);
  const controlsRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const itemMeshesMapRef = useRef(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const selectionRingRef = useRef(null);
  const contactDiscRef = useRef(null);
  const rulerGroupRef = useRef(null);
  const prevCameraRef = useRef(null);
  const lastTouchTapRef = useRef({ time: 0, x: 0, y: 0 });
  const inspectAnimRef = useRef({ active: false, t: 0, startPos: new THREE.Vector3(), targetPos: new THREE.Vector3(), startTarget: new THREE.Vector3(), endTarget: new THREE.Vector3(), onComplete: null });
  const lightsRef = useRef({});
  const wallsRef = useRef([]);
  const ceilingMeshRef = useRef(null);
  const floor2ElementsRef = useRef([]);
  const coveLightRef = useRef(null);
  const skylineMeshRef = useRef(null);

  const room = layoutData?.roomDimensions || { widthM: 6.0, lengthM: 5.2, heightM: 3.0 };
  const items = layoutData?.items || [];

  // First Person Player State
  const playerRef = useRef({
    pos: new THREE.Vector3(0, 1.6, (room.lengthM || 5.2) / 2 - 0.7),
    velocity: new THREE.Vector3(0, 0, 0),
    yaw: Math.PI,
    pitch: 0,
    bobTimer: 0,
    keys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    },
    joystick: {
      active: false,
      x: 0,
      y: 0,
    },
    isDraggingMouse: false,
    lastMouseX: 0,
    lastMouseY: 0,
    touchLook: {
      active: false,
      identifier: null,
      lastX: 0,
      lastY: 0,
    }
  });

  // 1. Setup Scene, Camera, Renderer, Controls & Base Architecture
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lightingMode === 'night' ? 0x0c0d12 : 0x16171a);
    sceneRef.current = scene;

    // Camera: 70° FOV for realistic human wide-angle interior view (like Matterport)
    const initialFov = navMode === 'walkthrough' ? 70 : 50;
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.1, 80);
    cameraRef.current = camera;

    // Initial Camera Placement according to mode
    if (navMode === 'walkthrough') {
      const p = playerRef.current;
      camera.position.set(p.pos.x, p.pos.y, p.pos.z);
      camera.lookAt(p.pos.x, p.pos.y, p.pos.z - 1);
    } else {
      const maxDim = Math.max(room.widthM || 6.0, room.lengthM || 5.2);
      camera.position.set(0, maxDim * 0.85, maxDim * 1.15);
    }

    // WebGL Renderer with PBR ToneMapping & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = lightingMode === 'night' ? 0.84 : 0.98;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Initialize Realistic HDRI Image-Based Lighting
    updateHDRIEnvironment(renderer, scene, lightingMode);

    // Setup Post-processing EffectComposer with UnrealBloomPass & OutputPass
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.07, // crisp photographic glow for bulbs without blooming white furniture
      0.22, // compact radius
      0.94  // high threshold
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);
    composerRef.current = composer;

    // OrbitControls (only active in 'orbit' mode)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 10.0;
    controls.target.set(0, 0.75, 0.1);
    controls.enabled = navMode === 'orbit';
    controlsRef.current = controls;

    // Lighting setup - Uniform, bright architectural ambient fill & soft realistic shadows
    const ambientLight = new THREE.AmbientLight(
      lightingMode === 'night' ? 0x22283e : 0xfff8ee,
      lightingMode === 'night' ? 0.32 : 0.54
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      lightingMode === 'night' ? 0x485a85 : 0xfff8ea,
      lightingMode === 'night' ? 0.18 : 0.85
    );
    sunLight.position.set(3.5, 5.5, 3.0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.bias = -0.00015;
    const maxDim = Math.max(room.widthM || 6.0, room.lengthM || 5.2);
    const d = maxDim * 0.85;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    const windowLight = new THREE.DirectionalLight(
      lightingMode === 'night' ? 0x2b3d63 : 0xfff4e6,
      lightingMode === 'night' ? 0.22 : 0.60
    );
    windowLight.position.set(-4, 2.5, 0);
    scene.add(windowLight);

    const ceilingLight = new THREE.PointLight(
      0xffe6c2,
      lightingMode === 'night' ? 1.15 : 0.38,
      8.5,
      2
    );
    ceilingLight.position.set(0, room.heightM * 0.82, 0);
    scene.add(ceilingLight);

    lightsRef.current = { ambientLight, sunLight, windowLight, ceilingLight };

    // Selection Halo Ring (neon gold)
    const ringGeo = new THREE.RingGeometry(0.5, 0.55, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.set(0, 0.004, 0);
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    // Contact Shadow Focus Disc
    const contactDiscMat = new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    const contactDisc = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), contactDiscMat);
    contactDisc.rotation.x = -Math.PI / 2;
    contactDisc.position.set(0, 0.003, 0);
    contactDisc.visible = false;
    scene.add(contactDisc);
    contactDiscRef.current = contactDisc;

    // 3D Caliper Ruler Group
    const rulerGroup = new THREE.Group();
    rulerGroup.visible = false;
    scene.add(rulerGroup);
    rulerGroupRef.current = rulerGroup;

    // Build Room Enclosure
    const { walls, ceiling, coveLight, skylineMesh, floor2Elements } = buildRoomEnclosure(scene, room, wallColor, lightingMode);
    wallsRef.current = walls;
    ceilingMeshRef.current = ceiling;
    coveLightRef.current = coveLight;
    skylineMeshRef.current = skylineMesh;
    floor2ElementsRef.current = floor2Elements || [];

    // Reset player position to room entrance (smart safe spawn point)
    let spawnZ = (room.lengthM || 5.2) / 2 - 0.8;
    let spawnX = 0;
    for (const it of items) {
      if (it.roomPlacementRole === 'RUG') continue;
      const px = it.position?.x ?? 0;
      const pz = it.position?.z ?? 0;
      const halfW = ((it.dimensions?.widthM || 0.8) / 2) + 0.5;
      const halfD = ((it.dimensions?.depthM || 0.8) / 2) + 0.5;
      if (Math.abs(spawnX - px) < halfW && Math.abs(spawnZ - pz) < halfD) {
        spawnX = px <= 0 ? halfW + 0.5 : -(halfW + 0.5);
        break;
      }
    }
    playerRef.current.pos.set(spawnX, 1.6, spawnZ);
    playerRef.current.yaw = Math.PI;
    playerRef.current.pitch = 0;

    // Animation Loop
    let animationFrameId;
    lastTimeRef.current = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // 1. Camera Inspection Transition Lerp Animation
      if (inspectAnimRef.current.active) {
        const anim = inspectAnimRef.current;
        anim.t = Math.min(1.0, anim.t + delta * 2.2);
        // Smooth Cubic Ease-Out
        const ease = 1 - Math.pow(1 - anim.t, 3);
        camera.position.lerpVectors(anim.startPos, anim.targetPos, ease);
        if (controlsRef.current) {
          controlsRef.current.target.lerpVectors(anim.startTarget, anim.endTarget, ease);
          controlsRef.current.update();
        }
        if (anim.t >= 1.0) {
          anim.active = false;
          anim.onComplete?.();
        }
      } else if (controlsRef.current && controlsRef.current.enabled) {
        controlsRef.current.update();
      } else {
        updateFirstPersonPhysics(delta);
      }

      // 2. Selection Ring & Contact Disc Subtle Breathing Pulse
      if (selectionRingRef.current && selectionRingRef.current.visible) {
        const time = Date.now() * 0.003;
        const scale = 1.0 + Math.sin(time) * 0.04;
        selectionRingRef.current.scale.set(scale, scale, scale);
      }

      // 3. Dynamic Distance-Based LOD & Shadow Optimization (Keeps 60 FPS)
      const camPos = camera.position;
      itemMeshesMapRef.current.forEach((grp, id) => {
        const dist = camPos.distanceTo(grp.position);
        const isFocus = selectedItem?.productId === id;
        const isNear = dist < 6.0 || isFocus;
        grp.traverse((child) => {
          if (child.isMesh && child.castShadow !== isNear) {
            child.castShadow = isNear;
          }
        });
      });

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
      renderMinimap();
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composerRef.current) {
        composerRef.current.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      if (composerRef.current) {
        composerRef.current.dispose();
        composerRef.current = null;
      }
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [room.widthM, room.lengthM, room.heightM]);

  // 2. Real-time Lighting Rig & HDRI Swapping (No Scene Reload)
  useEffect(() => {
    const lights = lightsRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!lights.ambientLight || !scene) return;

    const isNight = lightingMode === 'night';

    // Update Real-time HDRI Environment Map
    updateHDRIEnvironment(renderer, scene, lightingMode);

    scene.background = new THREE.Color(isNight ? 0x0a0c10 : 0x16171a);
    lights.ambientLight.intensity = isNight ? 0.32 : 0.54;
    lights.ambientLight.color.setHex(isNight ? 0x22283e : 0xfff8ee);

    lights.sunLight.intensity = isNight ? 0.18 : 0.85;
    lights.sunLight.color.setHex(isNight ? 0x485a85 : 0xfff8ea);

    lights.windowLight.intensity = isNight ? 0.22 : 0.60;
    lights.windowLight.color.setHex(isNight ? 0x2b3d63 : 0xfff4e6);

    lights.ceilingLight.intensity = isNight ? 1.15 : 0.38;

    if (coveLightRef.current) {
      coveLightRef.current.intensity = isNight ? 0.50 : 0.12;
    }

    if (skylineMeshRef.current) {
      skylineMeshRef.current.material.map = getSkylinePanoramaTexture(lightingMode);
      skylineMeshRef.current.material.needsUpdate = true;
    }

    if (renderer) {
      renderer.toneMappingExposure = isNight ? 0.84 : 0.98;
    }
  }, [lightingMode]);

  // 3. Real-time Wall Paint Update (No Model Reload)
  useEffect(() => {
    if (!wallsRef.current || wallsRef.current.length === 0) return;
    const wallCol = parseInt(wallColor.replace('#', '0x'), 16) || 0x25262a;
    wallsRef.current.forEach((wall) => {
      if (wall && wall.material) {
        wall.material.color.setHex(wallCol);
        wall.material.needsUpdate = true;
      }
    });
  }, [wallColor]);

  // 4. Navigation Mode & Floor Switcher Controller (Orbit vs Walkthrough, Floor 1 vs 2)
  useEffect(() => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    const isVilla = (room.widthM || 6.0) >= 10.0;

    // Orbit mode floor visibility management
    if (isVilla && floor2ElementsRef.current.length > 0) {
      if (navMode === 'orbit') {
        if (activeFloor === 1) {
          // Hide Floor 2 slab & walls so Floor 1 layout is seen unobstructed from above
          floor2ElementsRef.current.forEach((el) => { if (el) el.visible = false; });
          if (ceilingMeshRef.current) ceilingMeshRef.current.visible = false;
        } else {
          // Show Floor 2 slab & walls, hide top roof
          floor2ElementsRef.current.forEach((el) => { if (el) el.visible = true; });
          if (ceilingMeshRef.current) ceilingMeshRef.current.visible = false;
        }
      } else {
        // Walkthrough mode: all architectural elements are solid and physically visible
        floor2ElementsRef.current.forEach((el) => { if (el) el.visible = true; });
        if (ceilingMeshRef.current) ceilingMeshRef.current.visible = true;
      }
    }

    if (navMode === 'orbit') {
      controls.enabled = true;
      if (isVilla) {
        if (activeFloor === 2) {
          controls.target.set(3.8, 3.8, 0.0);
          camera.position.set(3.8, 9.8, 7.5);
        } else {
          controls.target.set(-2.0, 1.2, 0.0);
          camera.position.set(-2.0, 8.5, 9.2);
        }
      } else {
        const maxD = Math.max(room.widthM || 6.0, room.lengthM || 5.2);
        controls.target.set(0, 0.75, 0.1);
        camera.position.set(0, maxD * 0.85, maxD * 1.15);
      }
      camera.fov = 50;
      camera.updateProjectionMatrix();
      controls.update();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      setIsPointerLocked(false);
    } else {
      controls.enabled = false;
      camera.fov = 70;
      camera.updateProjectionMatrix();
      const p = playerRef.current;

      // Smart Floor Transition in Walkthrough mode
      if (isVilla) {
        if (activeFloor === 2 && p.pos.y < 3.0) {
          p.pos.set(1.4, 5.2, 0.0);
          p.yaw = 0;
          p.pitch = 0;
        } else if (activeFloor === 1 && p.pos.y > 3.0) {
          p.pos.set(-1.0, 1.6, 3.6);
          p.yaw = Math.PI;
          p.pitch = 0;
        }
      }

      camera.position.set(p.pos.x, p.pos.y, p.pos.z);
      const lookDirX = Math.sin(p.yaw) * Math.cos(p.pitch);
      const lookDirY = Math.sin(p.pitch);
      const lookDirZ = -Math.cos(p.yaw) * Math.cos(p.pitch);
      camera.lookAt(p.pos.x + lookDirX, p.pos.y + lookDirY, p.pos.z + lookDirZ);
    }
  }, [navMode, activeFloor, room.widthM, room.lengthM]);

  // 5. Populate / Update Furniture Items with High-Fidelity 3D Models & Cache
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous items
    itemMeshesMapRef.current.forEach((mesh) => {
      scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
    });
    itemMeshesMapRef.current.clear();

    items.forEach((item) => {
      const group = new THREE.Group();
      group.name = `furniture-${item.productId}`;
      group.userData = { item };

      // Set Position & Rotation
      group.position.set(item.position.x, item.position.y, item.position.z);
      group.rotation.y = item.rotationY || 0;

      // Soft Ambient Occlusion Contact Shadow under solid furniture
      if (item.roomPlacementRole !== 'RUG' && item.roomPlacementRole !== 'FLOOR_LAMP') {
        const sW = (item.dimensions?.widthM || 0.9) * 1.2;
        const sD = (item.dimensions?.depthM || 0.9) * 1.2;
        const shadowMat = new THREE.MeshBasicMaterial({
          map: getContactShadowTexture(),
          transparent: true,
          opacity: 0.62,
          depthWrite: false,
        });
        const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(sW, sD), shadowMat);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.set(0, 0.002, 0);
        group.add(shadowPlane);
      }

      // Check if glTF model exists in cache or needs loading
      const modelUrl = item.model3dUrl || ROLE_TO_MODEL_MAP[item.roomPlacementRole];

      const applyModel = (sourceScene) => {
        const model = sourceScene.clone(true);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData = { item };
          }
        });
        upgradeModelMaterials(model, rendererRef.current, item);
        scaleModelToDimensions(model, item.dimensions);
        group.add(model);
      };

      if (modelUrl) {
        if (modelCacheMap.has(modelUrl)) {
          applyModel(modelCacheMap.get(modelUrl));
        } else {
          gltfLoader.load(
            modelUrl,
            (gltf) => {
              modelCacheMap.set(modelUrl, gltf.scene);
              applyModel(gltf.scene);
            },
            undefined,
            () => {
              createProceduralFurniture(group, item, lightingMode);
            }
          );
        }
      } else {
        createProceduralFurniture(group, item, lightingMode);
      }

      scene.add(group);
      itemMeshesMapRef.current.set(item.productId, group);
    });
  }, [items, lightingMode]);

  // 6. Inspection Mode & 3D Caliper Ruler Helpers
  const updateRuler = useCallback((targetGroup, item) => {
    const rulerGroup = rulerGroupRef.current;
    if (!rulerGroup) return;

    while (rulerGroup.children.length > 0) {
      const child = rulerGroup.children[0];
      rulerGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (!showRuler || !targetGroup || !item) {
      rulerGroup.visible = false;
      return;
    }

    const box = new THREE.Box3().setFromObject(targetGroup);
    const min = box.min;
    const max = box.max;

    const lineMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      dashSize: 0.06,
      gapSize: 0.04,
      linewidth: 2,
    });

    const createDashedLine = (p1, p2) => {
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(geo, lineMat);
      line.computeLineDistances();
      return line;
    };

    const offset = 0.08;
    // Width caliper (X axis)
    const wP1 = new THREE.Vector3(min.x, min.y + 0.02, max.z + offset);
    const wP2 = new THREE.Vector3(max.x, min.y + 0.02, max.z + offset);
    rulerGroup.add(createDashedLine(wP1, wP2));

    // Depth caliper (Z axis)
    const dP1 = new THREE.Vector3(max.x + offset, min.y + 0.02, min.z);
    const dP2 = new THREE.Vector3(max.x + offset, min.y + 0.02, max.z);
    rulerGroup.add(createDashedLine(dP1, dP2));

    // Height caliper (Y axis)
    const hP1 = new THREE.Vector3(max.x + offset, min.y, max.z + offset);
    const hP2 = new THREE.Vector3(max.x + offset, max.y, max.z + offset);
    rulerGroup.add(createDashedLine(hP1, hP2));

    rulerGroup.visible = true;
  }, [showRuler]);

  // Inspection Camera Focus & Orbit Transition
  useEffect(() => {
    const ring = selectionRingRef.current;
    const contactDisc = contactDiscRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (selectedItem && itemMeshesMapRef.current.has(selectedItem.productId)) {
      const targetGroup = itemMeshesMapRef.current.get(selectedItem.productId);

      // Save previous camera/walk state before entering inspection mode
      if (!isInspecting) {
        prevCameraRef.current = {
          pos: camera.position.clone(),
          target: controls.target.clone(),
          navMode,
          fov: camera.fov,
          playerPos: playerRef.current.pos.clone(),
          yaw: playerRef.current.yaw,
          pitch: playerRef.current.pitch,
        };
      }

      setIsInspecting(true);

      // Calculate Bounding Box and Center
      const box = new THREE.Box3().setFromObject(targetGroup);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z, 0.7);

      // Position Ring & Contact Shadow Disc right under this item
      if (ring) {
        ring.position.set(center.x, box.min.y + 0.005, center.z);
        const radius = Math.max(size.x, size.z) * 0.55 + 0.15;
        ring.scale.set(radius * 1.8, radius * 1.8, 1);
        ring.visible = true;
      }
      if (contactDisc) {
        contactDisc.position.set(center.x, box.min.y + 0.003, center.z);
        const discSize = Math.max(size.x, size.z) * 1.4;
        contactDisc.scale.set(discSize, discSize, 1);
        contactDisc.visible = true;
      }

      // Smooth camera transition toward product inspection viewpoint
      const viewOffset = new THREE.Vector3(maxDim * 1.3, maxDim * 0.75 + 0.2, maxDim * 1.4);
      const targetCamPos = center.clone().add(viewOffset);

      inspectAnimRef.current = {
        active: true,
        t: 0,
        startPos: camera.position.clone(),
        targetPos: targetCamPos,
        startTarget: controls.target.clone(),
        endTarget: center.clone(),
        onComplete: () => {
          controls.enabled = true;
          controls.target.copy(center);
          controls.minDistance = maxDim * 0.75;
          controls.maxDistance = maxDim * 3.8;
          controls.update();
        }
      };

      updateRuler(targetGroup, selectedItem);
    } else {
      if (ring) ring.visible = false;
      if (contactDisc) contactDisc.visible = false;
      if (rulerGroupRef.current) rulerGroupRef.current.visible = false;
      setIsInspecting(false);
      setInspectedMaterialPreset(null);
    }
  }, [selectedItem, showRuler, updateRuler]);

  const handleExitInspection = useCallback(() => {
    if (!isInspecting || !prevCameraRef.current) {
      onSelectItem?.(null);
      return;
    }

    const prev = prevCameraRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    inspectAnimRef.current = {
      active: true,
      t: 0,
      startPos: camera.position.clone(),
      targetPos: prev.pos.clone(),
      startTarget: controls.target.clone(),
      endTarget: prev.target.clone(),
      onComplete: () => {
        controls.minDistance = 1.5;
        controls.maxDistance = 15.0;
        if (prev.navMode === 'walkthrough') {
          controls.enabled = false;
          playerRef.current.pos.copy(prev.playerPos);
          playerRef.current.yaw = prev.yaw;
          playerRef.current.pitch = prev.pitch;
          camera.position.copy(prev.playerPos);
          camera.fov = 70;
        } else {
          controls.enabled = true;
          camera.fov = 50;
        }
        camera.updateProjectionMatrix();
        controls.update();
      }
    };

    onSelectItem?.(null);
    setIsInspecting(false);
  }, [isInspecting, onSelectItem]);

  const handleApplyMaterialPreset = (preset) => {
    if (!selectedItem || !itemMeshesMapRef.current.has(selectedItem.productId)) return;
    setInspectedMaterialPreset(preset.id);
    const grp = itemMeshesMapRef.current.get(selectedItem.productId);

    grp.traverse((child) => {
      if (child.isMesh && child.material) {
        const isLeg = child.name.toLowerCase().includes('leg') || child.name.toLowerCase().includes('metal');
        if (!isLeg) {
          if (preset.type === 'leather') {
            const detailedLeather = getDetailedLeatherTextures();
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(preset.color),
              roughness: preset.roughness,
              metalness: preset.metalness,
              normalMap: detailedLeather.normalMap,
              normalScale: new THREE.Vector2(0.9, 0.9),
              roughnessMap: detailedLeather.roughnessMap,
              clearcoat: 0.15,
              clearcoatRoughness: 0.35,
              specularIntensity: 0.85,
            });
          } else if (preset.type === 'fabric') {
            const detailedFabric = getDetailedFabricTextures();
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(preset.color),
              roughness: preset.roughness,
              metalness: preset.metalness,
              normalMap: detailedFabric.normalMap,
              normalScale: new THREE.Vector2(0.8, 0.8),
              roughnessMap: detailedFabric.roughnessMap,
              sheen: 0.35,
              sheenRoughness: 0.6,
              sheenColor: new THREE.Color(preset.color),
            });
          } else if (preset.type === 'wood') {
            const detailedWood = getDetailedWoodTextures();
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(preset.color),
              roughness: preset.roughness,
              metalness: preset.metalness,
              normalMap: detailedWood.normalMap,
              normalScale: new THREE.Vector2(0.7, 0.7),
              roughnessMap: detailedWood.roughnessMap,
              clearcoat: 0.35,
              clearcoatRoughness: 0.2,
            });
          } else if (preset.type === 'marble') {
            const marbleTex = getMarbleTexture();
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(preset.color),
              map: marbleTex?.map || null,
              roughness: preset.roughness,
              metalness: preset.metalness,
              clearcoat: 0.38,
              clearcoatRoughness: 0.25,
            });
          }
          child.material.needsUpdate = true;
        }
      }
    });
  };

  // 7. First-Person Physics & Collision Detection Engine
  const updateFirstPersonPhysics = (delta) => {
    const p = playerRef.current;
    const camera = cameraRef.current;
    if (!camera) return;

    // Movement Intent
    let moveForward = 0;
    let moveRight = 0;

    if (p.keys.forward) moveForward += 1;
    if (p.keys.backward) moveForward -= 1;
    if (p.keys.left) moveRight -= 1;
    if (p.keys.right) moveRight += 1;

    // Mobile Joystick
    if (p.joystick.active) {
      moveForward -= p.joystick.y;
      moveRight += p.joystick.x;
    }

    const len = Math.hypot(moveForward, moveRight);
    if (len > 1) {
      moveForward /= len;
      moveRight /= len;
    }

    const speed = p.keys.sprint ? 3.4 : 2.0; // m/s

    const forwardX = Math.sin(p.yaw);
    const forwardZ = -Math.cos(p.yaw);
    const rightX = Math.cos(p.yaw);
    const rightZ = Math.sin(p.yaw);

    const targetVx = (forwardX * moveForward + rightX * moveRight) * speed;
    const targetVz = (forwardZ * moveForward + rightZ * moveRight) * speed;

    p.velocity.x += (targetVx - p.velocity.x) * (delta * 12);
    p.velocity.z += (targetVz - p.velocity.z) * (delta * 12);

    const stepX = p.velocity.x * delta;
    const stepZ = p.velocity.z * delta;

    // Collision Check with Room Boundaries, Multi-floor Partitions & Furniture
    const R = 0.35; // Player Body Collision Radius
    const roomW = room.widthM || 4.2;
    const roomL = room.lengthM || 3.6;
    const isVilla = roomW >= 10.0;

    const checkCollision = (tx, tz, curX, curZ) => {
      // 1. Room Boundaries: allow movement back inside if outside bounds
      const minX = -roomW / 2 + R;
      const maxX = roomW / 2 - R;
      const minZ = -roomL / 2 + R;
      const maxZ = roomL / 2 - R;

      if (curX !== undefined && curZ !== undefined) {
        if (tx < minX && tx < curX) return true;
        if (tx > maxX && tx > curX) return true;
        if (tz < minZ && tz < curZ) return true;
        if (tz > maxZ && tz > curZ) return true;
      } else {
        if (tx < minX || tx > maxX || tz < minZ || tz > maxZ) return true;
      }

      // 2. Multi-floor Villa Partitions & Void Protections
      if (isVilla) {
        const isUpstairs = p.pos.y > 3.0;
        if (isUpstairs) {
          // Mezzanine Void barrier (glass railing prevents walking into double-height void)
          if (tx < 0.45 && tz < 0.75) {
            return true;
          }
          // Partition Wall separating Master Suite & Study at Z = 0 (X >= 2.35)
          if (tx >= 2.35) {
            if ((curZ !== undefined && ((curZ < -0.06 && tz >= -0.06) || (curZ > 0.06 && tz <= 0.06))) || Math.abs(tz) < 0.08) {
              return true;
            }
          }
          // Corridor Wall at X = 2.4 (doors at Z in [-1.65, -0.55] and [0.55, 1.65])
          if ((curX !== undefined && ((curX < 2.35 && tx >= 2.35) || (curX > 2.45 && tx <= 2.45))) || Math.abs(tx - 2.4) < 0.08) {
            const inMasterDoor = tz >= -1.65 && tz <= -0.55;
            const inStudyDoor = tz >= 0.55 && tz <= 1.65;
            if (!inMasterDoor && !inStudyDoor) {
              return true;
            }
          }
        }
      }

      // 3. Solid Furniture Items (RUG is walkable)
      for (const it of items) {
        if (it.roomPlacementRole === 'RUG') continue;

        // Skip furniture placed on another floor
        if (isVilla) {
          const itemUpstairs = (it.position?.y || 0) > 2.0;
          const playerUpstairs = p.pos.y > 3.0;
          if (itemUpstairs !== playerUpstairs) continue;
        }

        const isRot = Math.abs(Math.abs(it.rotationY || 0) - Math.PI / 2) < 0.2;
        const w = (isRot ? (it.dimensions?.depthM || 0.8) : (it.dimensions?.widthM || 0.8));
        const d = (isRot ? (it.dimensions?.widthM || 0.8) : (it.dimensions?.depthM || 0.8));
        const halfW = w / 2 + R;
        const halfD = d / 2 + R;
        const px = it.position?.x ?? 0;
        const pz = it.position?.z ?? 0;

        if (tx >= px - halfW && tx <= px + halfW && tz >= pz - halfD && tz <= pz + halfD) {
          // SMART UNSTUCK: If player is currently intersecting this obstacle,
          // allow movement directed away from obstacle center so player never gets trapped!
          if (curX !== undefined && curZ !== undefined) {
            const curDistSq = (curX - px) * (curX - px) + (curZ - pz) * (curZ - pz);
            const nextDistSq = (tx - px) * (tx - px) + (tz - pz) * (tz - pz);
            if (nextDistSq > curDistSq) {
              continue; // Moving away from obstacle center -> ALLOW
            }
          }
          return true;
        }
      }
      return false;
    };

    // Smooth Wall & Furniture Sliding along X and Z axes independently
    if (!checkCollision(p.pos.x + stepX, p.pos.z, p.pos.x, p.pos.z)) {
      p.pos.x += stepX;
    }
    if (!checkCollision(p.pos.x, p.pos.z + stepZ, p.pos.x, p.pos.z)) {
      p.pos.z += stepZ;
    }

    // Staircase Slope & Vertical Elevation Management
    let targetBaseY = 0.0;
    if (isVilla) {
      const inStairX = p.pos.x >= 0.4 && p.pos.x <= 2.2;
      const inStairZ = p.pos.z >= 0.7 && p.pos.z <= 3.6;
      if (inStairX && inStairZ) {
        // Smooth staircase ramp from Z = 3.5 (Y = 0) to Z = 0.8 (Y = 3.6)
        const t = Math.max(0, Math.min(1, (3.5 - p.pos.z) / (3.5 - 0.8)));
        targetBaseY = t * 3.6;
      } else if (p.pos.y > 3.0) {
        targetBaseY = 3.6; // Upper floor (Floor 2)
      } else {
        targetBaseY = 0.0; // Ground floor (Floor 1)
      }
    }

    // Realistic Human Head-Bobbing & Vertical Smoothing
    const curSpeed = Math.hypot(p.velocity.x, p.velocity.z);
    const targetEyeY = targetBaseY + 1.6;
    if (curSpeed > 0.1) {
      p.bobTimer += delta * (p.keys.sprint ? 14 : 9);
      p.pos.y += (targetEyeY + Math.sin(p.bobTimer) * 0.022 - p.pos.y) * 0.2;
    } else {
      p.pos.y += (targetEyeY - p.pos.y) * 0.2;
    }

    // Apply to camera
    camera.position.set(p.pos.x, p.pos.y, p.pos.z);
    const lookDirX = Math.sin(p.yaw) * Math.cos(p.pitch);
    const lookDirY = Math.sin(p.pitch);
    const lookDirZ = -Math.cos(p.yaw) * Math.cos(p.pitch);

    camera.lookAt(
      p.pos.x + lookDirX,
      p.pos.y + lookDirY,
      p.pos.z + lookDirZ
    );

    // Proximity item check (<1.5m)
    let closest = null;
    let minDist = 1.6;
    for (const it of items) {
      const px = it.position?.x ?? 0;
      const pz = it.position?.z ?? 0;
      const d = Math.hypot(p.pos.x - px, p.pos.z - pz);
      if (d < minDist) {
        minDist = d;
        closest = it;
      }
    }
    if (closest !== nearbyItem) {
      setNearbyItem(closest);
    }
  };

  // 8. 2D Minimap Radar Rendering
  const renderMinimap = () => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Border and Background
    ctx.fillStyle = 'rgba(18, 19, 24, 0.9)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, w, h);

    const roomW = room.widthM || 6.0;
    const roomL = room.lengthM || 5.2;
    const isVilla = roomW >= 10.0;
    const padding = 14;
    const scale = Math.min((w - padding * 2) / roomW, (h - padding * 2) / roomL);
    const cx = w / 2;
    const cy = h / 2;

    // Room boundary
    const floorW = roomW * scale;
    const floorH = roomL * scale;
    ctx.fillStyle = 'rgba(32, 33, 38, 0.95)';
    ctx.fillRect(cx - floorW / 2, cy - floorH / 2, floorW, floorH);
    ctx.strokeStyle = 'rgba(168, 162, 158, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - floorW / 2, cy - floorH / 2, floorW, floorH);

    const p = playerRef.current;
    const currentFloor = (isVilla && p.pos.y > 3.0) ? 2 : 1;

    // For Villa Floor 2: draw the double-height void (Living room)
    if (isVilla && currentFloor === 2) {
      const voidX = cx - floorW / 2;
      const voidZ = cy - floorH / 2;
      const voidW = (0.4 - (-roomW / 2)) * scale;
      const voidH = (0.7 - (-roomL / 2)) * scale;
      ctx.fillStyle = 'rgba(15, 16, 20, 0.85)';
      ctx.fillRect(voidX, voidZ, voidW, voidH);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(voidX, voidZ, voidW, voidH);
      ctx.fillStyle = 'rgba(212, 175, 55, 0.7)';
      ctx.font = '8px sans-serif';
      ctx.fillText('THÔNG TẦNG', voidX + 6, voidZ + 14);
    }

    // Furniture Blocks
    items.forEach((it) => {
      if (isVilla) {
        const itemFloor = (it.position?.y || 0) > 2.0 ? 2 : 1;
        if (itemFloor !== currentFloor) return;
      }

      const px = cx + (it.position?.x || 0) * scale;
      const py = cy + (it.position?.z || 0) * scale;
      const isRot = Math.abs(Math.abs(it.rotationY || 0) - Math.PI / 2) < 0.2;
      const iw = (isRot ? (it.dimensions?.depthM || 0.8) : (it.dimensions?.widthM || 0.8)) * scale;
      const ih = (isRot ? (it.dimensions?.widthM || 0.8) : (it.dimensions?.depthM || 0.8)) * scale;

      if (it.roomPlacementRole === 'RUG') {
        ctx.fillStyle = 'rgba(120, 113, 108, 0.2)';
        ctx.fillRect(px - iw / 2, py - ih / 2, iw, ih);
      } else {
        const isSel = selectedItem?.productId === it.productId;
        ctx.fillStyle = isSel ? 'rgba(245, 158, 11, 0.7)' : 'rgba(180, 130, 80, 0.4)';
        ctx.strokeStyle = isSel ? '#fbbf24' : 'rgba(217, 119, 6, 0.5)';
        ctx.lineWidth = 1;
        ctx.fillRect(px - iw / 2, py - ih / 2, iw, ih);
        ctx.strokeRect(px - iw / 2, py - ih / 2, iw, ih);
      }
    });

    // Floor Label Badge on Minimap
    if (isVilla) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(currentFloor === 2 ? 'TẦNG 2 (LẦU)' : 'TẦNG 1 (TRỆT)', 6, 14);
    }

    // Player position and vision cone
    const pX = cx + p.pos.x * scale;
    const pY = cy + p.pos.z * scale;

    // Vision cone
    const fov = Math.PI / 3;
    const coneRadius = 24;
    const startAngle = p.yaw - Math.PI / 2 - fov / 2;
    const endAngle = p.yaw - Math.PI / 2 + fov / 2;

    const coneGrad = ctx.createRadialGradient(pX, pY, 2, pX, pY, coneRadius);
    coneGrad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
    coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.arc(pX, pY, coneRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    // Player dot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(pX, pY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  // 9. Minimap Click to Teleport / Walk
  const handleMinimapClick = (e) => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const roomW = room.widthM || 6.0;
    const roomL = room.lengthM || 5.2;
    const padding = 14;
    const scale = Math.min((canvas.width - padding * 2) / roomW, (canvas.height - padding * 2) / roomL);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const targetX = (mx - cx) / scale;
    const targetZ = (my - cy) / scale;

    const R = 0.4;
    if (
      targetX >= -roomW / 2 + R &&
      targetX <= roomW / 2 - R &&
      targetZ >= -roomL / 2 + R &&
      targetZ <= roomL / 2 - R
    ) {
      playerRef.current.pos.x = targetX;
      playerRef.current.pos.z = targetZ;
    }
  };

  // 10. Desktop Keyboard Listeners (WASD + Arrows + Shift + E)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const p = playerRef.current;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') p.keys.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') p.keys.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') p.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') p.keys.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') p.keys.sprint = true;

      // [E] key: Inspect nearby item
      if (e.code === 'KeyE' && nearbyItem) {
        onSelectItem?.(nearbyItem);
      }

      // [V] key: Toggle camera view mode
      if (e.code === 'KeyV') {
        setNavMode((prev) => (prev === 'walkthrough' ? 'orbit' : 'walkthrough'));
      }
    };

    const handleKeyUp = (e) => {
      const p = playerRef.current;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') p.keys.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') p.keys.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') p.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') p.keys.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') p.keys.sprint = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyItem, onSelectItem]);

  // 11. Mouse Drag Look & Pointer Lock
  const handleMouseDown = (e) => {
    if (navMode !== 'walkthrough') return;
    if (e.button === 0) {
      playerRef.current.isDraggingMouse = true;
      playerRef.current.lastMouseX = e.clientX;
      playerRef.current.lastMouseY = e.clientY;
    }
  };

  const handleMouseMove = (e) => {
    const p = playerRef.current;
    if (navMode === 'walkthrough') {
      if (document.pointerLockElement) {
        const sens = 0.0022;
        p.yaw -= e.movementX * sens;
        p.pitch = Math.max(-1.1, Math.min(1.0, p.pitch - e.movementY * sens));
      } else if (p.isDraggingMouse) {
        const dx = e.clientX - p.lastMouseX;
        const dy = e.clientY - p.lastMouseY;
        p.lastMouseX = e.clientX;
        p.lastMouseY = e.clientY;
        const sens = 0.0035;
        p.yaw -= dx * sens;
        p.pitch = Math.max(-1.1, Math.min(1.0, p.pitch - dy * sens));
      }
    }

    // Raycast hover detection
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);
    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && !hitObj.userData?.item && hitObj.parent) {
        hitObj = hitObj.parent;
      }
      if (hitObj?.userData?.item) {
        setHoveredItem(hitObj.userData.item);
        container.style.cursor = 'pointer';
        return;
      }
    }
    setHoveredItem(null);
    container.style.cursor = 'default';
  };

  const handleMouseUp = () => {
    playerRef.current.isDraggingMouse = false;
  };

  // Request / Exit Pointer Lock
  const togglePointerLock = () => {
    const canvas = mountRef.current?.querySelector('canvas');
    if (!canvas) return;

    if (!document.pointerLockElement) {
      canvas.requestPointerLock?.();
      setIsPointerLocked(true);
    } else {
      document.exitPointerLock?.();
      setIsPointerLocked(false);
    }
  };

  useEffect(() => {
    const handleLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // 12. Mobile Touch Controls (Virtual Joystick & Touch Look)
  const handleTouchStart = (e) => {
    if (navMode !== 'walkthrough') return;
    const container = mountRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const relX = touch.clientX - rect.left;

      if (relX > rect.width * 0.4 && !playerRef.current.touchLook.active) {
        playerRef.current.touchLook = {
          active: true,
          identifier: touch.identifier,
          lastX: touch.clientX,
          lastY: touch.clientY,
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (navMode !== 'walkthrough') return;
    const p = playerRef.current;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (p.touchLook.active && touch.identifier === p.touchLook.identifier) {
        const dx = touch.clientX - p.touchLook.lastX;
        const dy = touch.clientY - p.touchLook.lastY;
        p.touchLook.lastX = touch.clientX;
        p.touchLook.lastY = touch.clientY;

        const sens = 0.005;
        p.yaw -= dx * sens;
        p.pitch = Math.max(-1.1, Math.min(1.0, p.pitch - dy * sens));
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (navMode === 'walkthrough') {
      const p = playerRef.current;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (p.touchLook.active && touch.identifier === p.touchLook.identifier) {
          p.touchLook.active = false;
          p.touchLook.identifier = null;
        }
      }
    }

    // Double-tap on mobile touch screens to inspect 3D furniture
    if (e.changedTouches && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const now = Date.now();
      const dt = now - lastTouchTapRef.current.time;
      const dist = Math.hypot(touch.clientX - lastTouchTapRef.current.x, touch.clientY - lastTouchTapRef.current.y);
      if (dt > 40 && dt < 360 && dist < 25) {
        triggerInspectRaycast(touch.clientX, touch.clientY);
      }
      lastTouchTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
    }
  };

  // Joystick on-screen thumb drag
  const handleJoystickMove = (dx, dy) => {
    playerRef.current.joystick.active = dx !== 0 || dy !== 0;
    playerRef.current.joystick.x = dx;
    playerRef.current.joystick.y = dy;
  };

  // Trigger inspection raycast from screen coordinates
  const triggerInspectRaycast = (clientX, clientY) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);
    if (intersects.length > 0) {
      let hitObj = intersects[0].object;
      while (hitObj && !hitObj.userData?.item && hitObj.parent) {
        hitObj = hitObj.parent;
      }
      if (hitObj?.userData?.item) {
        onSelectItem?.(hitObj.userData.item);
      }
    }
  };

  // Item Double-Click detection (Click chuột 2 lần để vào xem chi tiết sản phẩm)
  const handleDoubleClick = (e) => {
    triggerInspectRaycast(e.clientX, e.clientY);
  };

  // Reset Camera View
  const resetCamera = () => {
    if (navMode === 'walkthrough') {
      playerRef.current.pos.set(0, 1.6, (room.lengthM || 3.6) / 2 - 0.7);
      playerRef.current.yaw = Math.PI;
      playerRef.current.pitch = 0;
      playerRef.current.velocity.set(0, 0, 0);
    } else if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 3.4, 5.0);
      controlsRef.current.target.set(0, 0.75, 0.1);
      controlsRef.current.update();
    }
  };

  const toggleFullscreen = () => {
    if (!mountRef.current?.parentElement) return;
    if (!isFullscreen) {
      mountRef.current.parentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const takeSnapshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const composer = composerRef.current;
    if (!renderer || !scene || !camera) return;

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
    const dataURL = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${layoutData?.conceptTitle || 'phuquy-3d-room'}-snapshot.png`;
    a.click();

    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);
  };

  const handleQuickAdd = async (product) => {
    if (!product) return;
    try {
      await addToCart(product.productId, 1);
      setAddedItemSuccess(true);
      setTimeout(() => setAddedItemSuccess(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="relative w-full h-[580px] sm:h-[650px] bg-stone-950 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl select-none group">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: Navigation Mode Switcher Pill */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="flex p-1 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-700/80 shadow-xl">
          <button
            onClick={() => setNavMode('walkthrough')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
              navMode === 'walkthrough'
                ? 'bg-amber-500 text-amber-950 shadow-md scale-102'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Đi Bộ (First-Person)</span>
          </button>
          <button
            onClick={() => setNavMode('orbit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
              navMode === 'orbit'
                ? 'bg-amber-500 text-amber-950 shadow-md scale-102'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Xoay 360° (Orbit)</span>
          </button>
        </div>

        {/* Villa Floor Switcher Pill */}
        {(room.widthM || 6.0) >= 10.0 && (
          <div className="flex p-1 bg-stone-900/90 backdrop-blur-md rounded-2xl border border-amber-500/40 shadow-xl">
            <button
              onClick={() => onSelectFloor?.(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeFloor === 1
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tầng 1 (Trệt)</span>
            </button>
            <button
              onClick={() => onSelectFloor?.(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeFloor === 2
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tầng 2 (Lầu)</span>
            </button>
          </div>
        )}

        {/* Pointer Lock Button on Desktop Walkthrough */}
        {navMode === 'walkthrough' && (
          <button
            onClick={togglePointerLock}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/85 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-stone-700 backdrop-blur-md transition shadow"
            title="Khóa chuột để xoay nhìn như game FPS (Bấm Esc để thoát)"
          >
            {isPointerLocked ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-stone-400" />}
            <span>{isPointerLocked ? 'Đã khóa chuột' : 'Khóa chuột'}</span>
          </button>
        )}
      </div>

      {/* Top Right: Actions & 2D Minimap */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-3 z-10">
        {/* Action button bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-stone-900/85 hover:bg-stone-800 text-stone-200 rounded-xl border border-stone-700 backdrop-blur-md transition shadow"
            title="Hướng dẫn điều khiển"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={takeSnapshot}
            className="p-2 bg-stone-900/85 hover:bg-amber-500 hover:text-amber-950 text-stone-200 rounded-xl border border-stone-700 backdrop-blur-md transition shadow flex items-center gap-1.5 text-xs font-bold"
            title="Chụp ảnh 3D không gian"
          >
            {snapshotTaken ? <Check className="w-4 h-4 text-emerald-400" /> : <Camera className="w-4 h-4" />}
            <span className="hidden md:inline">{snapshotTaken ? 'Đã lưu!' : 'Chụp 3D'}</span>
          </button>

          <button
            onClick={resetCamera}
            className="p-2 bg-stone-900/85 hover:bg-stone-800 text-stone-200 rounded-xl border border-stone-700 backdrop-blur-md transition shadow"
            title="Đưa về vị trí cửa vào ban đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-stone-900/85 hover:bg-stone-800 text-stone-200 rounded-xl border border-stone-700 backdrop-blur-md transition shadow"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* 2D Architectural Minimap Radar */}
        <div className="relative group/map">
          <canvas
            ref={minimapCanvasRef}
            width={130}
            height={130}
            onClick={handleMinimapClick}
            className="rounded-2xl border border-amber-500/40 shadow-xl cursor-crosshair bg-stone-950/80 backdrop-blur-md transition hover:scale-105"
            title="Mặt bằng 2D mini • Bấm để dịch chuyển tức thời"
          />
          <span className="absolute bottom-1 right-2 text-[9px] font-mono text-stone-400 pointer-events-none font-bold">
            {room.widthM}×{room.lengthM}m
          </span>
        </div>
      </div>

      {/* On-Screen Mobile Virtual Joystick */}
      {navMode === 'walkthrough' && (
        <div className="absolute bottom-6 left-6 z-20 md:hidden">
          <MobileJoystick onMove={handleJoystickMove} />
        </div>
      )}

      {/* Desktop Controls Floating Guide Pill */}
      {navMode === 'walkthrough' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-stone-900/85 backdrop-blur-md border border-stone-800 text-[11px] text-stone-300 shadow-xl pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Move className="w-3.5 h-3.5" />
            <span>WASD / Mũi tên: Đi bộ</span>
          </div>
          <span className="text-stone-600">•</span>
          <span>Shift: Chạy</span>
          <span className="text-stone-600">•</span>
          <span>Kéo chuột: Xoay nhìn</span>
          <span className="text-stone-600">•</span>
          <span className="text-amber-300 font-semibold">Click đúp (2 lần): Xem chi tiết món đồ</span>
          <span className="text-stone-600">•</span>
          <span>Click Minimap: Teleport</span>
        </div>
      )}

      {/* Proximity Prompt (Khi người đi bộ lại gần món đồ < 1.5m) */}
      {navMode === 'walkthrough' && nearbyItem && !selectedItem && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md border border-amber-500/60 px-4 py-2.5 rounded-2xl text-xs text-white shadow-2xl flex items-center gap-2.5 animate-in fade-in zoom-in-95">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>
            Đang đứng gần: <strong className="text-amber-300">{nearbyItem.name}</strong>
          </span>
          <button
            onClick={() => onSelectItem?.(nearbyItem)}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-lg text-[10px] transition shadow"
          >
            Nhấn [E] hoặc Click đúp xem chi tiết
          </button>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredItem && !selectedItem && !nearbyItem && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md border border-amber-500/40 px-4 py-2.5 rounded-2xl text-xs text-amber-200 pointer-events-none shadow-2xl flex items-center gap-2.5 animate-in fade-in zoom-in-95">
          <Eye className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Click chuột 2 lần (Double-click) để xem chi tiết & đổi mẫu: <strong className="text-amber-300">{hoveredItem.name}</strong>
          </span>
        </div>
      )}

      {/* Product Inspection Mode HUD Overlay (When user clicks a 3D furniture item) */}
      {selectedItem && (
        <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] bg-stone-900/95 backdrop-blur-xl border border-amber-500/50 rounded-3xl p-4 sm:p-5 text-stone-100 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-30 space-y-3.5">
          {/* Header & Product Identity */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={selectedItem.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=200&q=80'}
                alt={selectedItem.name}
                className="w-14 h-14 rounded-2xl object-cover border border-stone-700 flex-shrink-0 bg-stone-800 shadow"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Xem Chi Tiết 360°</span>
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{selectedItem.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-mono font-black text-amber-300">
                    {formatPrice(selectedItem.discountPrice || selectedItem.price)}
                  </span>
                  {selectedItem.discountPrice && selectedItem.discountPrice < selectedItem.price && (
                    <span className="text-[10px] text-stone-500 line-through font-mono">
                      {formatPrice(selectedItem.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleExitInspection}
              className="text-stone-400 hover:text-white p-1.5 rounded-xl hover:bg-stone-800 transition"
              title="Thoát chế độ xem chi tiết (Quay lại góc nhìn phòng)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Real-Time Material Swatches */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-stone-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Thử Đổi Chất Liệu Thực Tế:</span>
              </span>
              <span className="text-[10px] text-amber-400/90 font-medium">
                {INSPECTION_MATERIAL_PRESETS.find((p) => p.id === inspectedMaterialPreset)?.name || 'Mặc định'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {INSPECTION_MATERIAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyMaterialPreset(preset)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition flex flex-col items-center gap-1 ${
                    inspectedMaterialPreset === preset.id
                      ? 'border-amber-400 bg-amber-500/20 text-white ring-1 ring-amber-400'
                      : 'border-stone-700/80 bg-stone-800/80 hover:bg-stone-700 text-stone-300'
                  }`}
                  title={preset.name}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-stone-600 shadow-xs"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="truncate max-w-full text-[8px] scale-90">{preset.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Specifications & 3D Ruler Toggle */}
          <div className="p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800/90 flex items-center justify-between text-[11px]">
            <div className="space-y-0.5">
              <span className="text-[10px] text-stone-400 block font-medium">Kích thước 3D thực tế:</span>
              <span className="text-amber-200 font-mono font-bold">
                {Math.round((selectedItem.dimensions?.widthM || 1) * 100)} × {Math.round((selectedItem.dimensions?.depthM || 1) * 100)} × {Math.round((selectedItem.dimensions?.heightM || 1) * 100)} cm
              </span>
            </div>

            <button
              onClick={() => setShowRuler(!showRuler)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
                showRuler
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
              title="Bật/Tắt thước đo kích thước 3D nổi quanh sản phẩm"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>{showRuler ? 'Ẩn Thước' : 'Thước Đo 3D'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800/80">
            <button
              onClick={() => onRefineItem?.(selectedItem)}
              className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-amber-500/20 shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đổi Món Này</span>
            </button>

            <button
              onClick={() => handleQuickAdd(selectedItem)}
              className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              {addedItemSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-stone-950" />
                  <span>Đã Thêm!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Thêm Vào Giỏ</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleExitInspection}
            className="w-full py-1.5 rounded-xl bg-stone-800/60 hover:bg-stone-800 text-[11px] text-stone-400 hover:text-white transition flex items-center justify-center gap-1"
          >
            <span>← Quay lại góc nhìn toàn phòng</span>
          </button>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Footprints className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Hướng Dẫn Điều Khiển 3D</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-stone-400 hover:text-white p-1 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-stone-800/60 rounded-2xl border border-stone-700/60 space-y-1.5">
                <h4 className="font-bold text-amber-300">🚶 Chế độ Đi Bộ (First-Person Walkthrough):</h4>
                <p>• <strong>W, A, S, D</strong> hoặc <strong>Phím Mũi Tên</strong>: Đi tới, lùi, sang trái, sang phải.</p>
                <p>• <strong>Giữ phím Shift</strong>: Chạy nhanh.</p>
                <p>• <strong>Kéo chuột trên màn hình</strong>: Quay góc nhìn xung quanh 360°.</p>
                <p>• <strong>Bấm nút "Khóa chuột"</strong>: Trải nghiệm xoay camera tự nhiên như game góc nhìn thứ nhất.</p>
                <p>• <strong>Phím [E]</strong>: Mở thông số món đồ nội thất khi lại gần.</p>
                <p>• <strong>Bấm vào Minimap 2D</strong>: Dịch chuyển tức thời đến tọa độ bấm.</p>
              </div>

              <div className="p-3 bg-stone-800/60 rounded-2xl border border-stone-700/60 space-y-1.5">
                <h4 className="font-bold text-amber-300">📱 Trên Thiết Bị Di Động / Cảm Ứng:</h4>
                <p>• <strong>Cần Joystick góc trái</strong>: Chạm và kéo để di chuyển tự do.</p>
                <p>• <strong>Vuốt ngón tay nửa phải màn hình</strong>: Xoay góc nhìn camera.</p>
              </div>

              <div className="p-3 bg-stone-800/60 rounded-2xl border border-stone-700/60 space-y-1.5">
                <h4 className="font-bold text-amber-300">🌐 Chế độ Xoay Toàn Cảnh (Orbit 360°):</h4>
                <p>• Giữ chuột trái xoay xem phòng từ trên cao.</p>
                <p>• Cuộn chuột để phóng to / thu nhỏ.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl transition shadow"
            >
              Đã Hiểu, Bắt Đầu Khám Phá!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// MOBILE VIRTUAL JOYSTICK COMPONENT
// -------------------------------------------------------------
function MobileJoystick({ onMove }) {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    e.stopPropagation();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const maxRadius = 35;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    setKnobPos({ x: kx, y: ky });

    onMove?.(kx / maxRadius, ky / maxRadius);
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    touchStartRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onMove?.(0, 0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-24 h-24 rounded-full bg-stone-900/80 border-2 border-amber-500/40 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none"
    >
      <div className="absolute inset-2 rounded-full border border-stone-700/40 pointer-events-none" />
      <div
        className="w-10 h-10 rounded-full bg-amber-500/90 border-2 border-white shadow-lg pointer-events-none transition-transform"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      />
    </div>
  );
}

// -------------------------------------------------------------
// HELPER 1: Dựng Kiến Trúc Phòng Sang Trọng (Cửa sổ lớn, Tranh tường, Chậu cây, Đèn trần)
// -------------------------------------------------------------
function buildRoomEnclosure(scene, room, wallColorHex, lightingMode) {
  const w = room.widthM || 6.0;
  const l = room.lengthM || 5.2;
  const h = room.heightM || 3.0;

  // Floor (Sàn gỗ sồi xương cá tự nhiên với PBR bump map & phản xạ nhẹ)
  const floorTextures = getParquetFloorTextures();
  const floorDiff = floorTextures?.diffuse || floorTextures?.map;
  const floorBump = floorTextures?.bump || floorTextures?.bumpMap;
  if (floorDiff?.repeat) floorDiff.repeat.set(Math.max(1, w * 0.8), Math.max(1, l * 0.8));
  if (floorBump?.repeat) floorBump.repeat.set(Math.max(1, w * 0.8), Math.max(1, l * 0.8));

  const floorGeo = new THREE.PlaneGeometry(w, l, 32, 32);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorDiff || null,
    bumpMap: floorBump || null,
    bumpScale: 0.015,
    roughness: 0.42,
    metalness: 0.02,
    color: floorDiff ? 0xffffff : 0x8a5b3a,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor Grid Overlay
  const gridHelper = new THREE.GridHelper(Math.max(w, l), Math.round(Math.max(w, l) * 2), 0xaf7e59, 0x332219);
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);

  // Wall Material with Stucco Plaster bump
  const wallCol = parseInt(wallColorHex.replace('#', '0x'), 16) || 0x25262a;
  const wallBump = getWallPlasterBump();
  if (wallBump?.repeat) wallBump.repeat.set(Math.max(1, w * 0.6), Math.max(1, h * 0.6));
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallCol,
    bumpMap: wallBump || null,
    bumpScale: 0.006,
    roughness: 0.92,
    metalness: 0.0,
  });

  // Back Wall (Z = -l/2)
  const backWallGeo = new THREE.PlaneGeometry(w, h);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, h / 2, -l / 2);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Left Wall (X = -w/2) with Floor-to-ceiling Window Frame
  const leftWallGeo = new THREE.PlaneGeometry(l, h);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-w / 2, h / 2, 0);
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Right Wall (X = +w/2)
  const rightWallGeo = new THREE.PlaneGeometry(l, h);
  const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(w / 2, h / 2, 0);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Front Wall (Z = +l/2) with Entrance Doorway (Tường lối vào có cửa thông phòng)
  const doorW = 1.3;
  const doorH = 2.3;
  const sideW = (w - doorW) / 2;

  const frontWallLeft = new THREE.Mesh(new THREE.PlaneGeometry(sideW, h), wallMat);
  frontWallLeft.rotation.y = Math.PI;
  frontWallLeft.position.set(-w / 2 + sideW / 2, h / 2, l / 2);
  frontWallLeft.receiveShadow = true;
  scene.add(frontWallLeft);

  const frontWallRight = new THREE.Mesh(new THREE.PlaneGeometry(sideW, h), wallMat);
  frontWallRight.rotation.y = Math.PI;
  frontWallRight.position.set(w / 2 - sideW / 2, h / 2, l / 2);
  frontWallRight.receiveShadow = true;
  scene.add(frontWallRight);

  const frontWallTop = new THREE.Mesh(new THREE.PlaneGeometry(doorW, h - doorH), wallMat);
  frontWallTop.rotation.y = Math.PI;
  frontWallTop.position.set(0, doorH + (h - doorH) / 2, l / 2);
  scene.add(frontWallTop);

  // Wooden Door Leaf (Cánh cửa gỗ hơi hé mở)
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x221a15, roughness: 0.5 });
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.95, doorH, 0.05), doorMat);
  doorLeaf.position.set(doorW * 0.42, doorH / 2, l / 2 + 0.15);
  doorLeaf.rotation.y = -0.38;
  scene.add(doorLeaf);

  // Ceiling (Trần thạch cao - Hướng xuống, tàng hình từ trên cao khi ở Orbit mode)
  const ceilingGeo = new THREE.PlaneGeometry(w, l);
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.FrontSide,
  });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, h, 0);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  // Recessed Cove LED Ambient Light - soft diffuse fill without ceiling hotspots
  const coveLight = new THREE.PointLight(
    0xffecc2,
    lightingMode === 'night' ? 0.50 : 0.12,
    Math.max(w, l) * 2.0,
    2
  );
  coveLight.position.set(0, h * 0.78, 0);
  scene.add(coveLight);

  // 4 Recessed Ceiling Spotlights (Đèn spotlight downlight âm trần 4 góc)
  const spotGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
  const spotMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: lightingMode === 'night' ? 0xffeaae : 0xffffff,
    emissiveIntensity: lightingMode === 'night' ? 0.35 : 0.18,
  });
  const spotOffsets = [
    [-w * 0.28, -l * 0.28],
    [w * 0.28, -l * 0.28],
    [-w * 0.28, l * 0.28],
    [w * 0.28, l * 0.28],
  ];
  spotOffsets.forEach(([sx, sz]) => {
    const spotFixture = new THREE.Mesh(spotGeo, spotMat);
    spotFixture.position.set(sx, h - 0.01, sz);
    scene.add(spotFixture);

    const downlight = new THREE.PointLight(
      0xffecd2,
      lightingMode === 'night' ? 0.38 : 0.18,
      3.5,
      2
    );
    downlight.position.set(sx, h - 0.18, sz);
    scene.add(downlight);
  });

  // 1. Panoramic Window on Left Wall with Skyline Cityscape Backdrop
  const winW = l * 0.68;
  const winH = h * 0.82;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.85 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: lightingMode === 'night' ? 0x111e33 : 0xccddff,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.4,
  });

  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), glassMat);
  winGlass.rotation.y = Math.PI / 2;
  winGlass.position.set(-w / 2 + 0.01, h * 0.48, 0);
  scene.add(winGlass);

  // Window mullions (Khung kính nhôm đen)
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH, 0.03), frameMat);
  winFrame.position.set(-w / 2 + 0.02, h * 0.48, 0);
  scene.add(winFrame);

  // Skyline Cityscape Backdrop behind Window
  const skylineTex = getSkylinePanoramaTexture(lightingMode);
  const backdropGeo = new THREE.PlaneGeometry(winW * 1.8, winH * 1.35);
  const backdropMat = new THREE.MeshBasicMaterial({
    map: skylineTex,
    side: THREE.FrontSide,
  });
  const skylineMesh = new THREE.Mesh(backdropGeo, backdropMat);
  skylineMesh.rotation.y = Math.PI / 2;
  skylineMesh.position.set(-w / 2 - 0.28, h * 0.5, 0);
  scene.add(skylineMesh);

  // Luxury Curtains framing the Panoramic Window (Rèm cửa 2 lớp buông rủ)
  const drapeMat = new THREE.MeshStandardMaterial({
    color: 0xded9d2,
    roughness: 0.85,
  });
  const drapeGeo = new THREE.CylinderGeometry(0.2, 0.24, winH, 16);
  const leftDrape = new THREE.Mesh(drapeGeo, drapeMat);
  leftDrape.position.set(-w / 2 + 0.16, h * 0.48, -winW / 2 + 0.12);
  leftDrape.castShadow = true;
  scene.add(leftDrape);

  const rightDrape = new THREE.Mesh(drapeGeo, drapeMat);
  rightDrape.position.set(-w / 2 + 0.16, h * 0.48, winW / 2 - 0.12);
  rightDrape.castShadow = true;
  scene.add(rightDrape);

  // 2. Modern Canvas Art on Back Wall with Accent Wall Moulding
  const artW = Math.min(w * 0.45, 2.2);
  const artH = artW * 0.58;
  const artFrameGeo = new THREE.BoxGeometry(artW + 0.06, artH + 0.06, 0.03);
  const artFrameMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.5 });
  const artFrame = new THREE.Mesh(artFrameGeo, artFrameMat);
  artFrame.position.set(0, h * 0.65, -l / 2 + 0.02);
  scene.add(artFrame);

  const artCanvasGeo = new THREE.PlaneGeometry(artW, artH);
  const artCanvasMat = new THREE.MeshStandardMaterial({ color: 0xbf9b7a, roughness: 0.7 });
  const artCanvas = new THREE.Mesh(artCanvasGeo, artCanvasMat);
  artCanvas.position.set(0, h * 0.65, -l / 2 + 0.038);
  scene.add(artCanvas);

  // Accent Wall Moulding Profile on Back Wall (Phào chỉ tường hiện đại)
  const mouldingMat = new THREE.MeshStandardMaterial({ color: wallCol, roughness: 0.85 });
  const mMesh = new THREE.Mesh(new THREE.BoxGeometry(artW + 0.5, artH + 0.5, 0.015), mouldingMat);
  mMesh.position.set(0, h * 0.65, -l / 2 + 0.01);
  scene.add(mMesh);

  // 3. Decorative Indoor Plant (Monstera in White Pot) in Corner
  const plantGroup = new THREE.Group();
  const potGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.52, 24);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.25 });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.26;
  pot.castShadow = true;
  plantGroup.add(pot);

  // Plant leaves
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x226633, roughness: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const angle = (i * 2 * Math.PI) / 9;
    const leafGeo = new THREE.SphereGeometry(0.22, 8, 8);
    leafGeo.scale(1.2, 0.1, 0.7);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(Math.cos(angle) * 0.22, 0.55 + (i * 0.05), Math.sin(angle) * 0.22);
    leaf.rotation.y = angle;
    leaf.rotation.z = 0.45;
    leaf.castShadow = true;
    plantGroup.add(leaf);
  }
  plantGroup.position.set(-w / 2 + 0.55, 0, -l / 2 + 0.55);
  scene.add(plantGroup);

  // 4. Modern Ceiling Chandelier / Pendant Light
  const chandelierGroup = new THREE.Group();
  const cordGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.6, 8);
  const cordMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const cord = new THREE.Mesh(cordGeo, cordMat);
  cord.position.y = h - 0.3;
  chandelierGroup.add(cord);

  const ringGeo = new THREE.TorusGeometry(0.45, 0.025, 16, 48);
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.2,
    emissive: lightingMode === 'night' ? 0xcc9944 : 0x000000,
    emissiveIntensity: lightingMode === 'night' ? 0.35 : 0.0,
  });
  const ring = new THREE.Mesh(ringGeo, brassMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = h - 0.6;
  chandelierGroup.add(ring);
  scene.add(chandelierGroup);

  // Baseboards around the room
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x241711, roughness: 0.5 });
  const bbH = 0.08;
  const bbD = 0.02;

  const backBB = new THREE.Mesh(new THREE.BoxGeometry(w, bbH, bbD), baseboardMat);
  backBB.position.set(0, bbH / 2, -l / 2 + bbD / 2);
  scene.add(backBB);

  const leftBB = new THREE.Mesh(new THREE.BoxGeometry(bbD, bbH, l), baseboardMat);
  leftBB.position.set(-w / 2 + bbD / 2, bbH / 2, 0);
  scene.add(leftBB);

  const rightBB = new THREE.Mesh(new THREE.BoxGeometry(bbD, bbH, l), baseboardMat);
  rightBB.position.set(w / 2 - bbD / 2, bbH / 2, 0);
  scene.add(rightBB);

  // Multi-zone Luxury Villa Architecture (Active when w >= 10m: 2-Story Grand Estate)
  const floor2Elements = [];

  if (w >= 10.0) {
    // -------------------------------------------------------------
    // TẦNG 1 (GROUND FLOOR): PHÒNG KHÁCH THÔNG TẦNG & KHU BẾP ĂN
    // -------------------------------------------------------------

    // 1. Italian Calacatta Marble Floor Inset for Dining & Bar Zone
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0x1f232b,
      roughness: 0.32,
      metalness: 0.06,
    });
    const marbleFloor = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 3.8), marbleMat);
    marbleFloor.rotation.x = -Math.PI / 2;
    marbleFloor.position.set(-3.5, 0.002, 2.2);
    marbleFloor.receiveShadow = true;
    scene.add(marbleFloor);

    // Brass Inlay Border around Dining Marble Floor
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    const bTop = new THREE.Mesh(new THREE.BoxGeometry(5.84, 0.004, 0.04), borderMat);
    bTop.position.set(-3.5, 0.003, 2.2 + 1.9);
    scene.add(bTop);
    const bBottom = new THREE.Mesh(new THREE.BoxGeometry(5.84, 0.004, 0.04), borderMat);
    bBottom.position.set(-3.5, 0.003, 2.2 - 1.9);
    scene.add(bBottom);
    const bLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.004, 3.8), borderMat);
    bLeft.position.set(-3.5 - 2.9, 0.003, 2.2);
    scene.add(bLeft);
    const bRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.004, 3.8), borderMat);
    bRight.position.set(-3.5 + 2.9, 0.003, 2.2);
    scene.add(bRight);

    // Intimate Dining Ceiling Slab at Y = 3.6m (leaving Living Lounge double-height open to 6.8m)
    const diningCeilingMat = new THREE.MeshStandardMaterial({ color: 0x1e2024, roughness: 0.8 });
    const diningCeiling = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.2), diningCeilingMat);
    diningCeiling.rotation.x = Math.PI / 2;
    diningCeiling.position.set(-3.7, 3.6, 2.2);
    diningCeiling.receiveShadow = true;
    scene.add(diningCeiling);

    // 2. Grand Walnut Architectural Staircase ascending from Y = 0 to Y = 3.6m
    const stairWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.45, metalness: 0.05 });
    const stairGlassMat = new THREE.MeshStandardMaterial({
      color: 0xccddff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.08,
      metalness: 0.2,
    });
    const stairBrassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 });

    const numSteps = 18;
    const stairStartX = 1.3;
    const stairWidth = 1.4;
    const stairStartZ = 3.4;
    const stairEndZ = 0.8;
    const stepDepth = (stairStartZ - stairEndZ) / numSteps;
    const stepRise = 3.6 / numSteps;

    const stairGroup = new THREE.Group();
    for (let i = 0; i < numSteps; i++) {
      const stepY = (i + 0.5) * stepRise;
      const stepZ = stairStartZ - (i + 0.5) * stepDepth;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(stairWidth, stepRise, stepDepth * 1.05), stairWoodMat);
      stepMesh.position.set(stairStartX, stepY, stepZ);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      stairGroup.add(stepMesh);
    }

    // Staircase Tempered Glass Railing & Brass Handrail along X = 0.55
    const stairLength = Math.hypot(3.6, stairStartZ - stairEndZ);
    const stairAngle = Math.atan2(3.6, stairStartZ - stairEndZ);
    const stairRailing = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.95, stairLength), stairGlassMat);
    stairRailing.position.set(0.55, 1.8 + 0.45, (stairStartZ + stairEndZ) / 2);
    stairRailing.rotation.x = stairAngle;
    stairGroup.add(stairRailing);

    const stairHandrail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, stairLength), stairBrassMat);
    stairHandrail.position.set(0.55, 1.8 + 0.95, (stairStartZ + stairEndZ) / 2);
    stairHandrail.rotation.x = stairAngle;
    stairGroup.add(stairHandrail);
    scene.add(stairGroup);

    // -------------------------------------------------------------
    // TẦNG 2 (UPPER FLOOR, Y = 3.6m): MASTER SUITE & PHÒNG LÀM VIỆC RIÊNG BIỆT
    // -------------------------------------------------------------

    // Upper Floor Parquet Slab (Covers East Zone and Mezzanine Corridor)
    const upperFloorMat = new THREE.MeshStandardMaterial({
      map: floorDiff || null,
      bumpMap: floorBump || null,
      bumpScale: 0.015,
      roughness: 0.42,
      metalness: 0.02,
      color: 0x8a5b3a,
    });
    const upperFloor = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 9.0), upperFloorMat);
    upperFloor.rotation.x = -Math.PI / 2;
    upperFloor.position.set(3.7, 3.601, 0);
    upperFloor.receiveShadow = true;
    scene.add(upperFloor);
    floor2Elements.push(upperFloor);

    // Mezzanine Tempered Glass Balustrade looking down onto Living Room void
    const balustradeLength = 5.2;
    const balustradeGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.05, balustradeLength),
      stairGlassMat
    );
    balustradeGlass.position.set(0.42, 3.6 + 0.525, -1.8);
    scene.add(balustradeGlass);
    floor2Elements.push(balustradeGlass);

    const balustradeRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.04, balustradeLength),
      stairBrassMat
    );
    balustradeRail.position.set(0.42, 3.6 + 1.05, -1.8);
    scene.add(balustradeRail);
    floor2Elements.push(balustradeRail);

    // Staircase Opening Barrier at Z = 0.8
    const stairGateGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.05, 0.02), stairGlassMat);
    stairGateGlass.position.set(1.2, 3.6 + 0.525, 0.78);
    scene.add(stairGateGlass);
    floor2Elements.push(stairGateGlass);

    const stairGateRail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.05), stairBrassMat);
    stairGateRail.position.set(1.2, 3.6 + 1.05, 0.78);
    scene.add(stairGateRail);
    floor2Elements.push(stairGateRail);

    // --- PHÒNG NGỦ MASTER SUITE (TẦNG 2, PHÍA ĐÔNG-BẮC: X in [2.4, 7.0], Z in [-4.5, 0.0]) ---
    // 1. Dividing Wall between Master Bedroom and Executive Study at Z = 0.0
    const suiteDivWall = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 0.12), wallMat);
    suiteDivWall.position.set(4.7, 3.6 + 1.6, 0.0);
    suiteDivWall.receiveShadow = true;
    suiteDivWall.castShadow = true;
    scene.add(suiteDivWall);
    floor2Elements.push(suiteDivWall);

    // 2. Master Suite Corridor Partition Wall along X = 2.4 (leaving a 1.1m door opening)
    const masterWallNorth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 2.8), wallMat);
    masterWallNorth.position.set(2.4, 3.6 + 1.6, -3.1);
    masterWallNorth.receiveShadow = true;
    masterWallNorth.castShadow = true;
    scene.add(masterWallNorth);
    floor2Elements.push(masterWallNorth);

    const masterDoorLintel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 1.1), wallMat);
    masterDoorLintel.position.set(2.4, 3.6 + 2.75, -1.15);
    scene.add(masterDoorLintel);
    floor2Elements.push(masterDoorLintel);

    // Master Bedroom Door Leaf (Hé mở sang trọng)
    const masterDoorMat = new THREE.MeshStandardMaterial({ color: 0x241711, roughness: 0.5 });
    const masterDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.25, 0.95), masterDoorMat);
    masterDoorLeaf.position.set(2.55, 3.6 + 1.125, -1.3);
    masterDoorLeaf.rotation.y = 0.45;
    scene.add(masterDoorLeaf);
    floor2Elements.push(masterDoorLeaf);

    // Master Suite Private Panoramic Balcony Window on East Wall (X = 6.98)
    const suiteWinGlass = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), glassMat);
    suiteWinGlass.rotation.y = -Math.PI / 2;
    suiteWinGlass.position.set(6.98, 3.6 + 1.5, -2.2);
    scene.add(suiteWinGlass);
    floor2Elements.push(suiteWinGlass);

    // --- PHÒNG LÀM VIỆC EXECUTIVE (TẦNG 2, PHÍA ĐÔNG-NAM: X in [2.4, 7.0], Z in [0.0, 4.5]) ---
    // 1. Study Corridor Partition Wall along X = 2.4 (leaving a 1.1m door opening)
    const studyWallSouth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 2.8), wallMat);
    studyWallSouth.position.set(2.4, 3.6 + 1.6, 3.1);
    studyWallSouth.receiveShadow = true;
    studyWallSouth.castShadow = true;
    scene.add(studyWallSouth);
    floor2Elements.push(studyWallSouth);

    const studyDoorLintel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 1.1), wallMat);
    studyDoorLintel.position.set(2.4, 3.6 + 2.75, 1.15);
    scene.add(studyDoorLintel);
    floor2Elements.push(studyDoorLintel);

    // Study Door Leaf
    const studyDoorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.25, 0.95), masterDoorMat);
    studyDoorLeaf.position.set(2.55, 3.6 + 1.125, 1.3);
    studyDoorLeaf.rotation.y = -0.45;
    scene.add(studyDoorLeaf);
    floor2Elements.push(studyDoorLeaf);

    // Study Private Window on East Wall (X = 6.98)
    const studyWinGlass = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), glassMat);
    studyWinGlass.rotation.y = -Math.PI / 2;
    studyWinGlass.position.set(6.98, 3.6 + 1.5, 2.2);
    scene.add(studyWinGlass);
    floor2Elements.push(studyWinGlass);

    // Chandelier Placements
    chandelierGroup.position.set(-3.5, 0, -2.0); // Living Lounge

    const diningChandelier = chandelierGroup.clone();
    diningChandelier.position.set(-3.5, 0, 2.2);
    scene.add(diningChandelier);

    const bedChandelier = chandelierGroup.clone();
    bedChandelier.position.set(4.0, 3.6, -2.2);
    scene.add(bedChandelier);
    floor2Elements.push(bedChandelier);

    // Dedicated Ceiling Downlights for all Zones
    const extraDownlights = [
      [-3.5, 2.2, 3.5], // Dining
      [4.0, -2.2, 6.7], // Master Suite
      [4.0, 2.5, 6.7],  // Study
      [1.4, 0.0, 6.7],  // Mezzanine Hallway
    ];
    extraDownlights.forEach(([ex, ez, ey]) => {
      const extraSpot = new THREE.Mesh(spotGeo, spotMat);
      extraSpot.position.set(ex, ey - 0.01, ez);
      scene.add(extraSpot);

      const dl = new THREE.PointLight(
        0xffecd2,
        lightingMode === 'night' ? 0.40 : 0.18,
        4.5,
        2
      );
      dl.position.set(ex, ey - 0.18, ez);
      scene.add(dl);
      if (ey > 4.0) {
        floor2Elements.push(extraSpot);
        floor2Elements.push(dl);
      }
    });
  }

  return {
    walls: [backWall, leftWall, rightWall, frontWallLeft, frontWallRight],
    ceiling,
    coveLight,
    skylineMesh,
    floor2Elements,
  };
}

// -------------------------------------------------------------
// HELPER 2: Dựng Procedural 3D Mesh Cao Cấp Đầy Đủ Từng Danh Mục
// -------------------------------------------------------------
function createProceduralFurniture(group, item, lightingMode) {
  const role = item.roomPlacementRole || 'GENERIC';
  const dims = item.dimensions || { widthM: 1.0, heightM: 0.8, depthM: 0.8 };

  const detailedFabric = getDetailedFabricTextures();
  const detailedLeather = getDetailedLeatherTextures();
  const detailedWood = getDetailedWoodTextures();
  const brushedMetal = getBrushedMetalTextures();
  const microImperfection = getMicroImperfectionTexture();
  const isNight = lightingMode === 'night';

  if (role === 'SOFA') {
    // 🛋️ Sofa Ý Da/Nỉ Thượng Hạng: 2 đệm ngồi tách biệt, đường may chần viền (piping seams), đệm tựa lưng cong, chân côn mạ vàng
    const sofaCol = item.color ? parseInt(item.color.replace('#', '0x'), 16) || 0x272c35 : 0x272c35;
    const isLeather = item.material?.toLowerCase().includes('da') || !item.material;

    const upholsteryMat = new THREE.MeshPhysicalMaterial({
      color: sofaCol,
      roughness: isLeather ? 0.46 : 0.86,
      metalness: 0.04,
      normalMap: isLeather ? detailedLeather.normalMap : detailedFabric.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: isLeather ? detailedLeather.roughnessMap : detailedFabric.roughnessMap,
      sheen: isLeather ? 0.0 : 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xdad7ce),
      clearcoat: isLeather ? 0.18 : 0.0,
      clearcoatRoughness: 0.35,
    });

    const seamMat = new THREE.MeshPhysicalMaterial({
      color: sofaCol,
      roughness: 0.6,
      metalness: 0.05,
    });

    const brassLegMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.16,
      clearcoat: 0.6,
    });

    const darkLegMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.3, metalness: 0.8 });

    const seatW = dims.widthM;
    const seatH = dims.heightM * 0.42;
    const seatD = dims.depthM * 0.85;

    // Sofa Plinth / Bottom Frame
    const baseH = 0.12;
    const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(seatW * 0.98, baseH, seatD * 0.96), upholsteryMat);
    baseFrame.position.set(0, baseH / 2 + 0.14, 0);
    baseFrame.castShadow = true;
    baseFrame.receiveShadow = true;
    group.add(baseFrame);

    // 2 Separate Plush Seat Cushions
    const cushionW = (seatW - 0.32) / 2;
    const cushionH = seatH * 0.8;
    const cushionD = seatD * 0.92;
    [-1, 1].forEach((sign) => {
      const cushion = new THREE.Mesh(
        new THREE.BoxGeometry(cushionW - 0.02, cushionH, cushionD),
        upholsteryMat
      );
      cushion.position.set(sign * (cushionW / 2 + 0.01), baseH + 0.14 + cushionH / 2, 0.02);
      cushion.castShadow = true;
      cushion.receiveShadow = true;
      group.add(cushion);

      // Piping welt seam around cushion top edge
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(cushionW - 0.01, 0.012, cushionD + 0.01),
        seamMat
      );
      seam.position.set(sign * (cushionW / 2 + 0.01), baseH + 0.14 + cushionH + 0.005, 0.02);
      group.add(seam);

      // Tufting button dimple indents
      [-0.15, 0.15].forEach((zOff) => {
        const button = new THREE.Mesh(
          new THREE.SphereGeometry(0.014, 12, 12),
          seamMat
        );
        button.position.set(sign * (cushionW / 2 + 0.01), baseH + 0.14 + cushionH, zOff);
        group.add(button);
      });
    });

    // 2 Ergonomic Backrest Cushions with slight backward tilt
    const backH = dims.heightM * 0.58;
    const backD = dims.depthM * 0.22;
    [-1, 1].forEach((sign) => {
      const backCushion = new THREE.Mesh(
        new THREE.BoxGeometry(cushionW - 0.02, backH, backD),
        upholsteryMat
      );
      backCushion.position.set(
        sign * (cushionW / 2 + 0.01),
        baseH + 0.14 + backH / 2 + 0.05,
        -seatD / 2 + backD / 2 + 0.04
      );
      backCushion.rotation.x = -0.07;
      backCushion.castShadow = true;
      group.add(backCushion);
    });

    // Left & Right Padded Armrests
    const armW = 0.16;
    const armH = dims.heightM * 0.66;
    [-1, 1].forEach((sign) => {
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(armW, armH, seatD),
        upholsteryMat
      );
      arm.position.set(sign * (seatW / 2 - armW / 2), armH / 2 + 0.08, 0);
      arm.castShadow = true;
      group.add(arm);

      // Armrest padded top curve
      const armTop = new THREE.Mesh(
        new THREE.CylinderGeometry(armW / 2, armW / 2, seatD, 16),
        upholsteryMat
      );
      armTop.rotation.x = Math.PI / 2;
      armTop.position.set(sign * (seatW / 2 - armW / 2), armH + 0.08, 0);
      armTop.castShadow = true;
      group.add(armTop);
    });

    // 4 Architectural Tapered Legs with PVD Brass Caps (Ferrules)
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const legX = sx * (seatW / 2 - 0.12);
      const legZ = sz * (seatD / 2 - 0.12);

      // Main tapered leg shaft
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.012, 0.14, 16),
        darkLegMat
      );
      leg.position.set(legX, 0.07, legZ);
      leg.castShadow = true;
      group.add(leg);

      // Gold-plated brass foot ferrule
      const ferrule = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.013, 0.035, 16),
        brassLegMat
      );
      ferrule.position.set(legX, 0.018, legZ);
      ferrule.castShadow = true;
      group.add(ferrule);
    });

  } else if (role === 'BED') {
    // 🛏️ Giường Ngủ Master King Bed: 5 múi đệm đầu giường tufted, đệm đa tầng, ga chăn phủ nếp gấp, 4 gối ngủ cao cấp, 2 tủ đầu giường
    const frameMat = new THREE.MeshPhysicalMaterial({
      color: 0x22242b,
      roughness: 0.65,
      metalness: 0.05,
      normalMap: detailedFabric.normalMap,
      sheen: 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xdad7ce),
    });

    const mattressMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4f1ea,
      roughness: 0.85,
      metalness: 0.0,
      normalMap: detailedFabric.normalMap,
      sheen: 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xdad7ce),
    });

    const duvetMat = new THREE.MeshPhysicalMaterial({
      color: 0xe2dcd2,
      roughness: 0.9,
      metalness: 0.0,
      normalMap: detailedFabric.normalMap,
      sheen: 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xdad7ce),
    });

    const pillowMat = new THREE.MeshPhysicalMaterial({
      color: 0xfafafa,
      roughness: 0.82,
      normalMap: detailedFabric.normalMap,
      sheen: 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xdad7ce),
    });

    const accentPillowMat = new THREE.MeshPhysicalMaterial({
      color: 0x825432,
      roughness: 0.75,
      metalness: 0.04,
      normalMap: detailedLeather.normalMap,
    });

    const brassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.18,
    });

    const nightstandWood = new THREE.MeshPhysicalMaterial({
      color: 0x2d1c13,
      roughness: 0.38,
      metalness: 0.04,
      normalMap: detailedWood.normalMap,
      clearcoat: 0.3,
    });

    // 1. Headboard: 5 vertical channel-tufted panels
    const headH = dims.heightM;
    const headD = 0.16;
    const numPanels = 5;
    const panelW = dims.widthM / numPanels;

    for (let i = 0; i < numPanels; i++) {
      const px = -dims.widthM / 2 + (i + 0.5) * panelW;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW - 0.015, headH, headD),
        frameMat
      );
      panel.position.set(px, headH / 2, -dims.depthM / 2 + headD / 2);
      panel.castShadow = true;
      panel.receiveShadow = true;
      group.add(panel);
    }

    // Brass perimeter accent rim on headboard top
    const headRim = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM + 0.02, 0.02, headD + 0.02),
      brassMat
    );
    headRim.position.set(0, headH + 0.01, -dims.depthM / 2 + headD / 2);
    group.add(headRim);

    // 2. Upholstered Bed Frame / Rails
    const baseH = 0.28;
    const bedBox = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM * 0.98, baseH, dims.depthM - headD),
      frameMat
    );
    bedBox.position.set(0, baseH / 2 + 0.06, headD / 2);
    bedBox.castShadow = true;
    bedBox.receiveShadow = true;
    group.add(bedBox);

    // 3. Thick Layered Pocket Spring Mattress
    const matH = dims.heightM * 0.38;
    const matD = dims.depthM - headD - 0.06;
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM * 0.94, matH, matD),
      mattressMat
    );
    mattress.position.set(0, baseH + 0.06 + matH / 2, headD / 2);
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    group.add(mattress);

    // 4. Folded Duvet Runner Blanket (Organic Quilt drape over foot of bed)
    const duvetH = 0.04;
    const duvetD = matD * 0.52;
    const duvet = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM * 0.96, duvetH, duvetD),
      duvetMat
    );
    duvet.position.set(0, baseH + 0.06 + matH + duvetH / 2, headD / 2 + matD * 0.24);
    duvet.castShadow = true;
    group.add(duvet);

    // 5. 4 Luxury Plush Pillows (2 sleeping + 2 accent pillows)
    [-1, 1].forEach((sign) => {
      const pX = sign * (dims.widthM * 0.24);
      // Sleeping king pillow
      const pMain = new THREE.Mesh(
        new THREE.BoxGeometry(dims.widthM * 0.38, 0.14, 0.38),
        pillowMat
      );
      pMain.position.set(pX, baseH + 0.06 + matH + 0.07, -dims.depthM / 2 + headD + 0.3);
      pMain.rotation.x = 0.22;
      pMain.castShadow = true;
      group.add(pMain);

      // Accent throw pillow
      const pAccent = new THREE.Mesh(
        new THREE.BoxGeometry(dims.widthM * 0.26, 0.12, 0.26),
        accentPillowMat
      );
      pAccent.position.set(pX, baseH + 0.06 + matH + 0.12, -dims.depthM / 2 + headD + 0.52);
      pAccent.rotation.x = 0.35;
      pAccent.rotation.y = sign * 0.1;
      pAccent.castShadow = true;
      group.add(pAccent);
    });

    // 6. Two Modern Nightstands flanking bed
    [-1, 1].forEach((sign) => {
      const nX = sign * (dims.widthM / 2 + 0.32);
      const nZ = -dims.depthM / 2 + headD + 0.25;

      const stand = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.44, 0.42),
        nightstandWood
      );
      stand.position.set(nX, 0.22, nZ);
      stand.castShadow = true;
      group.add(stand);

      // Brass drawer handle
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.015, 0.02),
        brassMat
      );
      handle.position.set(nX, 0.28, nZ + 0.22);
      group.add(handle);
    });

  } else if (role === 'DINING_TABLE') {
    // 🍽️ Bộ Bàn Ăn Gỗ Tự Nhiên Vát Mép, 6 Ghế Uốn Cong Bọc Nệm & Phụ Kiện Bàn Tiệc (Bình hoa & Ly rượu)
    const tableWoodMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d271a,
      roughness: 0.36,
      metalness: 0.04,
      normalMap: detailedWood.normalMap,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughnessMap: detailedWood.roughnessMap,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
    });

    const brassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.16,
    });

    const chairFabric = new THREE.MeshPhysicalMaterial({
      color: 0x242830,
      roughness: 0.85,
      normalMap: detailedFabric.normalMap,
      sheen: 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xdad7ce),
    });

    const ceramicMat = new THREE.MeshPhysicalMaterial({
      color: 0xeeece8,
      roughness: 0.38,
      clearcoat: 0.35,
    });

    const wineGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 1.0,
      transparent: true,
      roughness: 0.03,
      ior: 1.52,
      thickness: 0.04,
    });

    // 1. Chamfered Table Top
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM, 0.05, dims.depthM),
      tableWoodMat
    );
    top.position.set(0, dims.heightM, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Beveled under-frame apron
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM * 0.92, 0.04, dims.depthM * 0.88),
      tableWoodMat
    );
    apron.position.set(0, dims.heightM - 0.03, 0);
    group.add(apron);

    // 4 Heavy-duty Tapered Wooden Legs with Brass Shoes
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const lx = sx * (dims.widthM / 2 - 0.12);
      const lz = sz * (dims.depthM / 2 - 0.12);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.025, dims.heightM - 0.05, 16),
        tableWoodMat
      );
      leg.position.set(lx, (dims.heightM - 0.05) / 2, lz);
      leg.castShadow = true;
      group.add(leg);

      const shoe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.025, 0.06, 16),
        brassMat
      );
      shoe.position.set(lx, 0.03, lz);
      group.add(shoe);
    });

    // 2. 6 Ergonomic Dining Chairs (3 each side)
    [-1, 1].forEach((side) => {
      [-0.6, 0.0, 0.6].forEach((xOff) => {
        const chairZ = side * (dims.depthM / 2 + 0.32);

        // Seat pad with fabric sheen
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.44, 0.06, 0.44),
          chairFabric
        );
        seat.position.set(xOff, 0.45, chairZ);
        seat.castShadow = true;
        group.add(seat);

        // Curved bentwood backrest
        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.44, 0.42, 0.04),
          tableWoodMat
        );
        back.position.set(xOff, 0.72, side * (dims.depthM / 2 + 0.52));
        back.rotation.x = -side * 0.12;
        back.castShadow = true;
        group.add(back);

        // Chair legs
        [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([cx, cz]) => {
          const cLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.01, 0.42, 12),
            tableWoodMat
          );
          cLeg.position.set(xOff + cx, 0.21, chairZ + cz);
          cLeg.castShadow = true;
          group.add(cLeg);
        });
      });
    });

    // 3. Centerpiece Dinner Decor (Ceramic tray, minimalist vase, wine glasses)
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.015, 0.24),
      ceramicMat
    );
    tray.position.set(0, dims.heightM + 0.035, 0);
    group.add(tray);

    const vase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.22, 16),
      ceramicMat
    );
    vase.position.set(0, dims.heightM + 0.14, 0);
    vase.castShadow = true;
    group.add(vase);

    [-0.25, 0.25].forEach((gx) => {
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.02, 0.12, 16),
        wineGlassMat
      );
      glass.position.set(gx, dims.heightM + 0.085, 0);
      group.add(glass);
    });

  } else if (role === 'COFFEE_TABLE') {
    // ☕ Bàn Trà Mặt Đá Calacatta Marble Vát Cạnh, Chân Kiềng Brass Khắc Chìm & Tạp Chí Nghệ Thuật
    const marbleTex = getMarbleTexture();
    const marbleMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4f2ed,
      map: marbleTex?.map || null,
      roughness: 0.26,
      metalness: 0.04,
      clearcoat: 0.38,
      clearcoatRoughness: 0.28,
    });

    const brassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.18,
    });

    // Beveled Calacatta Marble Slab
    const radius = dims.widthM / 2;
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 0.98, 0.032, 48),
      marbleMat
    );
    top.position.set(0, dims.heightM, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Architectural Tripod Legs with Lower Ring
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3;
      const legR = radius * 0.72;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.012, dims.heightM, 16),
        brassMat
      );
      leg.position.set(Math.cos(angle) * legR, dims.heightM / 2, Math.sin(angle) * legR);
      leg.castShadow = true;
      group.add(leg);
    }

    // Lower stabilizer brass ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.55, 0.01, 12, 32),
      brassMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, dims.heightM * 0.28, 0);
    group.add(ring);

    // Decor: Architecture monograph & ceramic espresso cup
    const magMat = new THREE.MeshPhysicalMaterial({ color: 0x1f242d, roughness: 0.45 });
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.016, 0.32), magMat);
    book.position.set(-radius * 0.32, dims.heightM + 0.024, 0.06);
    book.rotation.y = 0.25;
    book.castShadow = true;
    group.add(book);

    const cupMat = new THREE.MeshPhysicalMaterial({ color: 0xeeece8, roughness: 0.38, clearcoat: 0.35 });
    const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.01, 16), cupMat);
    saucer.position.set(radius * 0.35, dims.heightM + 0.02, -0.05);
    group.add(saucer);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.065, 16), cupMat);
    cup.position.set(radius * 0.35, dims.heightM + 0.055, -0.05);
    cup.castShadow = true;
    group.add(cup);

  } else if (role === 'DESK') {
    // 💼 Bàn Làm Việc SmartDesk: Mặt gỗ Óc Chó vát mép, thảm lót da Desk Pad, lỗ luồn cáp, chân nâng hạ chữ T
    const walnutMat = new THREE.MeshPhysicalMaterial({
      color: 0x4a2e1c,
      roughness: 0.38,
      metalness: 0.04,
      normalMap: detailedWood.normalMap,
      clearcoat: 0.35,
    });

    const blotterMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1d22,
      roughness: 0.55,
      normalMap: detailedLeather.normalMap,
    });

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x18181a, metalness: 0.9, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.95, roughness: 0.1 });

    // Tabletop
    const top = new THREE.Mesh(new THREE.BoxGeometry(dims.widthM, 0.04, dims.depthM), walnutMat);
    top.position.set(0, dims.heightM, 0);
    top.castShadow = true;
    group.add(top);

    // Leather Desk Pad Blotter
    const blotter = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM * 0.55, 0.005, dims.depthM * 0.65),
      blotterMat
    );
    blotter.position.set(0, dims.heightM + 0.023, 0.02);
    group.add(blotter);

    // Slim Aluminum Laptop
    const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.01, 0.22), chromeMat);
    laptop.position.set(0, dims.heightM + 0.03, 0.02);
    group.add(laptop);

    // 2 Cable Grommets
    [-dims.widthM * 0.35, dims.widthM * 0.35].forEach((gx) => {
      const grommet = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.045, 16), steelMat);
      grommet.position.set(gx, dims.heightM + 0.005, -dims.depthM * 0.35);
      group.add(grommet);
    });

    // Dual-motor T-shaped Legs
    [-1, 1].forEach((sign) => {
      const lx = sign * (dims.widthM / 2 - 0.2);
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.08, dims.heightM - 0.04, 0.09), steelMat);
      col.position.set(lx, dims.heightM / 2, 0);
      col.castShadow = true;
      group.add(col);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, dims.depthM * 0.85), steelMat);
      foot.position.set(lx, 0.015, 0);
      foot.castShadow = true;
      group.add(foot);
    });

  } else if (role === 'OFFICE_CHAIR') {
    // 💺 Ghế Công Thái Học Master Chair: Lưới công thái học thoáng khí, đệm tựa thắt lưng cong, piston thủy lực & chân sao 5 bánh xe
    const meshMat = new THREE.MeshPhysicalMaterial({
      color: 0x22242a,
      roughness: 0.5,
      normalMap: detailedFabric.normalMap,
      sheen: 0.35,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(0xdad7ce),
    });

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d4, metalness: 0.95, roughness: 0.12 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x161719, roughness: 0.35 });

    // Contoured Seat Cushion
    const seat = new THREE.Mesh(new THREE.BoxGeometry(dims.widthM * 0.72, 0.08, dims.depthM * 0.72), meshMat);
    seat.position.set(0, 0.48, 0);
    seat.castShadow = true;
    group.add(seat);

    // Ergonomic Breathable Backrest with Spine Curve
    const back = new THREE.Mesh(new THREE.BoxGeometry(dims.widthM * 0.65, dims.heightM * 0.52, 0.05), meshMat);
    back.position.set(0, 0.78, -dims.depthM * 0.32);
    back.rotation.x = -0.12;
    back.castShadow = true;
    group.add(back);

    // Adjustable Headrest
    const head = new THREE.Mesh(new THREE.BoxGeometry(dims.widthM * 0.42, 0.15, 0.06), meshMat);
    head.position.set(0, dims.heightM * 0.94, -dims.depthM * 0.28);
    group.add(head);

    // 3D Armrests
    [-1, 1].forEach((sign) => {
      const armPole = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.04), blackMat);
      armPole.position.set(sign * (dims.widthM * 0.36), 0.58, 0);
      group.add(armPole);

      const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.22), blackMat);
      armPad.position.set(sign * (dims.widthM * 0.36), 0.7, 0);
      group.add(armPad);
    });

    // Chrome Gas Lift Cylinder
    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.38, 16), chromeMat);
    cylinder.position.set(0, 0.24, 0);
    group.add(cylinder);

    // 5-Star Base
    const starBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 5), chromeMat);
    starBase.position.set(0, 0.05, 0);
    group.add(starBase);

  } else if (role === 'WARDROBE') {
    // 🚪 Tủ Quần Áo Cánh Kính Lumina: Khung nhôm đen mờ, kính cường lực khói phản quang, đèn LED thanh bên trong
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f1f22, roughness: 0.4, metalness: 0.6 });
    const smokedGlass = new THREE.MeshPhysicalMaterial({
      color: 0x334455,
      transmission: 0.92,
      opacity: 1.0,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.05,
    });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 });

    // Main Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(dims.widthM, dims.heightM, dims.depthM), frameMat);
    body.position.set(0, dims.heightM / 2, 0);
    body.castShadow = true;
    group.add(body);

    // Smoked Glass Doors with Vertical Pulls
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(dims.widthM * 0.94, dims.heightM * 0.92), smokedGlass);
    glass.position.set(0, dims.heightM / 2, dims.depthM / 2 + 0.01);
    group.add(glass);

    // Slim Vertical Brass Handles
    [-0.03, 0.03].forEach((hx) => {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.015, dims.heightM * 0.45, 0.02), brassMat);
      handle.position.set(hx, dims.heightM / 2, dims.depthM / 2 + 0.02);
      group.add(handle);
    });

    // Interior Warm LED Strip Light
    const ledLight = new THREE.PointLight(0xffe8bd, isNight ? 0.85 : 0.32, 3.5);
    ledLight.position.set(0, dims.heightM * 0.85, 0);
    group.add(ledLight);

  } else if (role === 'TV_STAND') {
    // 📺 Kệ Tivi Gỗ Óc Chó Nan Fluted & Smart OLED TV Siêu Mỏng
    const woodMat = new THREE.MeshPhysicalMaterial({
      color: 0x482c1a,
      roughness: 0.42,
      metalness: 0.04,
      normalMap: detailedWood.normalMap,
      clearcoat: 0.35,
    });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.15 });

    const standBody = new THREE.Mesh(new THREE.BoxGeometry(dims.widthM, dims.heightM - 0.1, dims.depthM), woodMat);
    standBody.position.set(0, (dims.heightM - 0.1) / 2 + 0.1, 0);
    standBody.castShadow = true;
    group.add(standBody);

    // Ultra-thin OLED TV Screen
    const tvW = Math.min(dims.widthM * 0.86, 1.55);
    const tvH = tvW * 0.58;
    const tv = new THREE.Mesh(new THREE.BoxGeometry(tvW, tvH, 0.016), steelMat);
    tv.position.set(0, dims.heightM + tvH / 2 + 0.06, 0);
    tv.castShadow = true;
    group.add(tv);

    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(tvW * 0.97, tvH * 0.95),
      new THREE.MeshStandardMaterial({
        color: 0x162232,
        emissive: isNight ? 0x0e1824 : 0x162232,
        emissiveIntensity: 0.3,
        roughness: 0.15,
      })
    );
    tvScreen.position.set(0, dims.heightM + tvH / 2 + 0.06, 0.01);
    group.add(tvScreen);

  } else if (role === 'FLOOR_LAMP') {
    // 💡 Đèn Cây Arco Vòm Cong Cần Inox Đế Đá Marble Tự Nhiên & Chao Mạ Vàng
    const marbleTex = getMarbleTexture();
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4f2ed,
      map: marbleTex?.map || null,
      roughness: 0.28,
      clearcoat: 0.38,
    });
    const brassMat = new THREE.MeshPhysicalMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.16 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.95, roughness: 0.1 });

    // Heavy Marble Base Slab
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 32), baseMat);
    base.position.y = 0.035;
    base.castShadow = true;
    group.add(base);

    // Arched Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, dims.heightM * 0.92, 16), chromeMat);
    pole.position.set(0, dims.heightM * 0.46, 0);
    group.add(pole);

    // Spun Aluminum Dome Shade with Golden Interior
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.24, 32, 1, true), brassMat);
    shade.position.set(0, dims.heightM * 0.9, 0);
    group.add(shade);

    const lampLight = new THREE.PointLight(0xffdf9c, isNight ? 1.05 : 0.45, 4.5);
    lampLight.position.set(0, dims.heightM * 0.88, 0);
    group.add(lampLight);

  } else {
    // Generic Elegant Chamfered PBR Box
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(dims.widthM, dims.heightM, dims.depthM),
      new THREE.MeshPhysicalMaterial({
        color: 0x8a5b3a,
        roughness: 0.45,
        metalness: 0.05,
        normalMap: detailedWood.normalMap,
        clearcoat: 0.3,
      })
    );
    box.position.set(0, dims.heightM / 2, 0);
    box.castShadow = true;
    group.add(box);
  }
}

function scaleModelToDimensions(model, targetDims) {
  if (!targetDims) return;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());

  if (size.x > 0 && size.y > 0 && size.z > 0) {
    const scaleX = targetDims.widthM / size.x;
    const scaleY = targetDims.heightM / size.y;
    const scaleZ = targetDims.depthM / size.z;
    const uniformScale = Math.min(scaleX, scaleY, scaleZ);
    model.scale.set(uniformScale, uniformScale, uniformScale);

    const newBox = new THREE.Box3().setFromObject(model);
    const center = newBox.getCenter(new THREE.Vector3());
    model.position.x = -center.x;
    model.position.y = -newBox.min.y;
    model.position.z = -center.z;
  }
}