import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import {
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Camera,
  Smartphone,
  QrCode,
  X,
  Layers,
  Ruler,
  Sun,
  Moon,
  Palette,
  Check,
  ArrowRight,
  Compass,
  Eye,
  RotateCcw,
  Grid,
  Box,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getParquetFloorTextures,
  getFabricBumpMap,
  getMarbleTexture,
  getContactShadowTexture
} from '../utils/roomTextures';

// DRACOLoader and GLTFLoader Singleton setup
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/gltf/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Model Cache Map
const modelCacheMap = new Map();
const envCacheMap = new Map();
const rgbeLoader = new RGBELoader();

// Model Mapping by Product Attributes
export const getModelUrlForProduct = (product) => {
  if (product?.model3dUrl && (product.model3dUrl.endsWith('.glb') || product.model3dUrl.endsWith('.gltf'))) {
    if (product.model3dUrl.startsWith('/models/furniture/')) {
      return product.model3dUrl;
    }
  }

  const name = (product?.name || '').toLowerCase();
  const cat = (product?.category?.slug || product?.category?.name || '').toLowerCase();
  const role = product?.roomPlacementRole;

  if (role === 'SOFA' || name.includes('sofa')) {
    if (name.includes('đơn') || name.includes('armchair') || name.includes('barcelona') || name.includes('thư giãn')) {
      return '/models/furniture/armchair_barcelona.glb';
    }
    return '/models/furniture/sofa_luxury.glb';
  }
  if (role === 'ARMCHAIR' || name.includes('armchair') || name.includes('ghế thư giãn') || name.includes('ghế đơn')) {
    return '/models/furniture/armchair_barcelona.glb';
  }
  if (role === 'COFFEE_TABLE' || name.includes('bàn trà') || name.includes('bàn sofa') || name.includes('venus')) {
    return '/models/furniture/coffee_table/scene.gltf';
  }
  if (role === 'DINING_TABLE' || name.includes('bàn ăn') || name.includes('royal')) {
    return '/models/furniture/dining_table/scene.gltf';
  }
  if (role === 'BED' || name.includes('giường') || cat.includes('giuong')) {
    return '/models/furniture/bed/scene.gltf';
  }
  if (role === 'DESK' || name.includes('bàn làm việc') || name.includes('smartdesk') || name.includes('nâng hạ')) {
    return '/models/furniture/desk/scene.gltf';
  }
  if (role === 'OFFICE_CHAIR' || name.includes('công thái học') || name.includes('ghế xoay') || name.includes('văn phòng')) {
    return '/models/furniture/office_chair/scene.gltf';
  }
  if (role === 'BOOKSHELF' || name.includes('kệ sách') || name.includes('giá sách') || name.includes('tủ sách') || name.includes('loft')) {
    return '/models/furniture/bookshelf/scene.gltf';
  }
  if (role === 'TV_STAND' || role === 'WARDROBE' || name.includes('kệ tivi') || name.includes('tủ quần áo') || name.includes('tủ') || name.includes('kệ')) {
    return '/models/furniture/cabinet/scene.gltf';
  }
  if (role === 'FLOOR_LAMP' || name.includes('đèn')) {
    return '/models/furniture/lamp/scene.gltf';
  }
  if (role === 'PLANT' || name.includes('cây')) {
    return '/models/furniture/plant/scene.gltf';
  }

  // Fallbacks
  if (cat.includes('ban') || name.includes('bàn')) return '/models/furniture/dining_table/scene.gltf';
  if (cat.includes('ghe') || name.includes('ghế')) return '/models/furniture/armchair_barcelona.glb';
  return '/models/furniture/sofa_luxury.glb';
};

// Rich PBR Material Presets
export const MATERIAL_PRESETS = [
  // 1. Nhóm Da Thật (Italian & Nappa Leather)
  {
    id: 'cognac',
    name: 'Da Bò Ý Cognac Mastrotto',
    color: 0xa85a28,
    roughness: 0.42,
    metalness: 0.08,
    previewColor: '#a85a28',
    category: 'da',
    badge: 'Bán chạy',
  },
  {
    id: 'black-nappa',
    name: 'Da Đen Nappa Đức',
    color: 0x18181a,
    roughness: 0.35,
    metalness: 0.12,
    previewColor: '#18181a',
    category: 'da',
    badge: 'Sang trọng',
  },
  {
    id: 'cream-leather',
    name: 'Da Trắng Kem Nappa',
    color: 0xeee6d8,
    roughness: 0.45,
    metalness: 0.05,
    previewColor: '#eee6d8',
    category: 'da',
    badge: 'Tinh tế',
  },
  {
    id: 'emerald-leather',
    name: 'Da Xanh Rêu Emerald',
    color: 0x1f382b,
    roughness: 0.4,
    metalness: 0.08,
    previewColor: '#1f382b',
    category: 'da',
    badge: 'Độc bản',
  },
  // 2. Nhóm Vải & Nỉ Cao Cấp
  {
    id: 'scandi-grey',
    name: 'Vải Nỉ Xám Bắc Âu',
    color: 0x757c85,
    roughness: 0.88,
    metalness: 0.0,
    previewColor: '#757c85',
    category: 'vai',
    badge: 'Bắc Âu',
  },
  {
    id: 'boucle-white',
    name: 'Vải Bouclé Lông Cừu Kem',
    color: 0xf5f3ed,
    roughness: 0.95,
    metalness: 0.0,
    previewColor: '#f5f3ed',
    category: 'vai',
    badge: 'Mềm mại',
  },
  {
    id: 'navy-velvet',
    name: 'Nhung Xanh Navy Hoàng Gia',
    color: 0x1b2845,
    roughness: 0.65,
    metalness: 0.1,
    previewColor: '#1b2845',
    category: 'vai',
    badge: 'Quý phái',
  },
  // 3. Nhóm Gỗ Tự Nhiên
  {
    id: 'walnut',
    name: 'Gỗ Óc Chó Bắc Mỹ (Walnut)',
    color: 0x42291a,
    roughness: 0.45,
    metalness: 0.05,
    previewColor: '#42291a',
    category: 'go',
    badge: 'Thượng lưu',
  },
  {
    id: 'white-oak',
    name: 'Gỗ Sồi Nga (White Oak)',
    color: 0xc49a62,
    roughness: 0.52,
    metalness: 0.02,
    previewColor: '#c49a62',
    category: 'go',
    badge: 'Tự nhiên',
  },
  // 4. Nhóm Đá & Mặt Bàn
  {
    id: 'ceramic-white',
    name: 'Đá Ceramic Trắng Ý Vân Mây',
    color: 0xf8f8fa,
    roughness: 0.15,
    metalness: 0.12,
    previewColor: '#f8f8fa',
    category: 'da-stone',
    badge: 'Chống xước',
  },
  {
    id: 'black-marquina',
    name: 'Đá Đen Tia Chớp Marquina',
    color: 0x121214,
    roughness: 0.12,
    metalness: 0.18,
    previewColor: '#121214',
    category: 'da-stone',
    badge: 'Thời thượng',
  },
];

const STUDIO_LIGHTING_MODES = [
  {
    id: 'daylight',
    name: 'Studio Ánh Sáng Tự Nhiên',
    icon: Sun,
    bgClass: 'from-[#f5f2eb] via-[#faf8f4] to-[#eae5dc]',
    pedestalColor: 0xf0ece4,
    hdr: '/hdri/day_environment.hdr',
    envIntensity: 0.95,
  },
  {
    id: 'showroom',
    name: 'Showroom Ban Đêm Luxury',
    icon: Moon,
    bgClass: 'from-[#121318] via-[#1a1b22] to-[#0d0e12]',
    pedestalColor: 0x1c1e26,
    hdr: '/hdri/night_environment.hdr',
    envIntensity: 0.45,
  },
];

export default function Furniture3DViewer({ product, className = '', onAddToCart }) {
  const mountRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(MATERIAL_PRESETS[0]);
  const [lightingStyle, setLightingStyle] = useState('daylight'); // 'daylight' | 'showroom'
  const [showDimensions, setShowDimensions] = useState(false);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [arModalOpen, setArModalOpen] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('da');
  const [modelLoading, setModelLoading] = useState(true);

  // References
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const dimensionGroupRef = useRef(null);
  const pedestalRef = useRef(null);
  const lightsRef = useRef({});
  const primaryMeshesRef = useRef([]);

  // Calculate product bounding dimensions
  const productDims = {
    widthM: product?.dimensions?.widthM || 2.2,
    heightM: product?.dimensions?.heightM || 0.85,
    depthM: product?.dimensions?.depthM || 1.1,
  };

  // 1. Initialize Scene, HDRI, Camera, and Canvas
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 650;
    const height = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (45° field of view for natural showroom lens)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80);
    camera.position.set(2.8, 1.8, 3.6);
    cameraRef.current = camera;

    // WebGL Renderer with ACES Tone Mapping & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Prevent going below floor
    controls.minDistance = 1.6;
    controls.maxDistance = 7.5;
    controls.target.set(0, 0.55, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // Studio Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.52);
    scene.add(ambientLight);

    // Key Light with Soft PCF Shadows
    const keyLight = new THREE.DirectionalLight(0xfffaee, 1.25);
    keyLight.position.set(3.5, 5.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xdce7ff, 0.55);
    fillLight.position.set(-4.0, 3.5, -2.5);
    scene.add(fillLight);

    // Rim Light behind model
    const rimLight = new THREE.PointLight(0xffeedd, 0.75, 8);
    rimLight.position.set(0, 3.5, -3.5);
    scene.add(rimLight);

    lightsRef.current = { ambientLight, keyLight, fillLight, rimLight };

    // Soft Ambient Occlusion Contact Shadow on Ground
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.002;
    scene.add(shadowPlane);

    // Circular Showcase Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.06, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf0ece4,
      roughness: 0.85,
      metalness: 0.05,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.03;
    pedestal.receiveShadow = true;
    scene.add(pedestal);
    pedestalRef.current = pedestal;

    // Brass Bevel Ring around Pedestal
    const bevelGeo = new THREE.TorusGeometry(2.45, 0.018, 16, 64);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    const bevelRing = new THREE.Mesh(bevelGeo, brassMat);
    bevelRing.rotation.x = Math.PI / 2;
    bevelRing.position.y = 0.001;
    scene.add(bevelRing);

    // Dimensions Helper Group
    const dimensionGroup = new THREE.Group();
    dimensionGroup.visible = false;
    scene.add(dimensionGroup);
    dimensionGroupRef.current = dimensionGroup;

    // Load HDRI Environment
    loadHDRI(renderer, scene, lightingStyle);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
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
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [product?.id]);

  // 2. Load Real 3D GLTF/GLB Model
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous model
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
        }
      });
      modelGroupRef.current = null;
    }
    primaryMeshesRef.current = [];

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    const modelUrl = getModelUrlForProduct(product);
    setModelLoading(true);

    const applyModel = (sourceGltfScene) => {
      const model = sourceGltfScene.clone(true);
      const meshes = [];

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Clone material so color modifications don't mutate cache
          if (child.material) {
            child.material = child.material.clone();
            meshes.push(child);
          }
        }
      });

      primaryMeshesRef.current = meshes;

      // Fit and center model proportionally
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      if (size.x > 0 && size.y > 0 && size.z > 0) {
        // Target showroom bounds: around 2.2m max width
        const maxExtent = Math.max(size.x, size.y, size.z);
        const scaleFactor = 2.1 / maxExtent;
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        const newBox = new THREE.Box3().setFromObject(model);
        const center = newBox.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -newBox.min.y; // Grounded on floor
        model.position.z = -center.z;

        // Build 3D Dimension Calipers
        buildDimensionCalipers(newBox);
      }

      modelGroup.add(model);
      setModelLoading(false);

      // Apply initial material preset
      applyMaterialPreset(selectedPreset);
    };

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
        (err) => {
          console.warn('Failed to load GLTF, using procedural fallback:', err);
          buildProceduralFallback(modelGroup, product);
          setModelLoading(false);
        }
      );
    }
  }, [product?.id, product?.name]);

  // 3. HDRI Environment Manager
  const loadHDRI = (renderer, scene, mode) => {
    const isShowroom = mode === 'showroom';
    const hdrUrl = isShowroom ? '/hdri/night_environment.hdr' : '/hdri/day_environment.hdr';

    const setEnv = (texture) => {
      scene.environment = texture;
      if ('environmentIntensity' in scene) {
        scene.environmentIntensity = isShowroom ? 0.38 : 0.68;
      }
    };

    if (envCacheMap.has(hdrUrl)) {
      setEnv(envCacheMap.get(hdrUrl));
    } else {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      rgbeLoader.load(hdrUrl, (texture) => {
        const envMap = pmrem.fromEquirectangular(texture).texture;
        envCacheMap.set(hdrUrl, envMap);
        setEnv(envMap);
        texture.dispose();
        pmrem.dispose();
      });
    }
  };

  // 4. Update Studio Lighting Style
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const lights = lightsRef.current;
    const pedestal = pedestalRef.current;
    if (!scene || !renderer || !lights.ambientLight) return;

    const isShowroom = lightingStyle === 'showroom';

    loadHDRI(renderer, scene, lightingStyle);

    if (isShowroom) {
      lights.ambientLight.intensity = 0.30;
      lights.ambientLight.color.setHex(0x1d2238);
      lights.keyLight.intensity = 1.35;
      lights.keyLight.color.setHex(0xffecc6);
      lights.fillLight.intensity = 0.45;
      lights.fillLight.color.setHex(0x405580);
      lights.rimLight.intensity = 1.15;
      renderer.toneMappingExposure = 0.88;
      if (pedestal && pedestal.material) {
        pedestal.material.color.setHex(0x181a22);
        pedestal.material.roughness = 0.3;
        pedestal.material.metalness = 0.2;
      }
    } else {
      lights.ambientLight.intensity = 0.52;
      lights.ambientLight.color.setHex(0xfff5ea);
      lights.keyLight.intensity = 1.25;
      lights.keyLight.color.setHex(0xfffaed);
      lights.fillLight.intensity = 0.55;
      lights.fillLight.color.setHex(0xdce7ff);
      lights.rimLight.intensity = 0.75;
      renderer.toneMappingExposure = 0.98;
      if (pedestal && pedestal.material) {
        pedestal.material.color.setHex(0xf0ece4);
        pedestal.material.roughness = 0.85;
        pedestal.material.metalness = 0.05;
      }
    }
  }, [lightingStyle]);

  // 5. Apply Material Preset & Wireframe
  const applyMaterialPreset = useCallback((preset) => {
    setSelectedPreset(preset);
    if (!primaryMeshesRef.current || primaryMeshesRef.current.length === 0) return;

    primaryMeshesRef.current.forEach((mesh) => {
      if (mesh && mesh.material) {
        mesh.material.color.setHex(preset.color);
        mesh.material.roughness = preset.roughness;
        mesh.material.metalness = preset.metalness;
        mesh.material.wireframe = wireframeMode;
        mesh.material.needsUpdate = true;
      }
    });
  }, [wireframeMode]);

  // Update Wireframe Mode
  useEffect(() => {
    if (!primaryMeshesRef.current) return;
    primaryMeshesRef.current.forEach((mesh) => {
      if (mesh && mesh.material) {
        mesh.material.wireframe = wireframeMode;
        mesh.material.needsUpdate = true;
      }
    });
  }, [wireframeMode]);

  // 6. Build Interactive 3D Dimension Calipers
  const buildDimensionCalipers = (box) => {
    const group = dimensionGroupRef.current;
    if (!group) return;

    group.clear();

    const min = box.min;
    const max = box.max;
    const offset = 0.2;

    const lineMat = new THREE.LineDashedMaterial({
      color: 0xd97706,
      dashSize: 0.08,
      gapSize: 0.04,
      linewidth: 2,
    });
    const tickMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 2 });

    const createCaliperLine = (p1, p2) => {
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(geo, lineMat);
      line.computeLineDistances();
      group.add(line);

      // Tick markers at ends
      const tick1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p1.x, p1.y - 0.05, p1.z),
          new THREE.Vector3(p1.x, p1.y + 0.05, p1.z),
        ]),
        tickMat
      );
      const tick2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p2.x, p2.y - 0.05, p2.z),
          new THREE.Vector3(p2.x, p2.y + 0.05, p2.z),
        ]),
        tickMat
      );
      group.add(tick1, tick2);
    };

    // Width (Dài) Line in Front of Model
    createCaliperLine(
      new THREE.Vector3(min.x, 0.02, max.z + offset),
      new THREE.Vector3(max.x, 0.02, max.z + offset)
    );

    // Depth (Rộng) Line on the Right Side
    createCaliperLine(
      new THREE.Vector3(max.x + offset, 0.02, min.z),
      new THREE.Vector3(max.x + offset, 0.02, max.z)
    );

    // Height (Cao) Vertical Line
    createCaliperLine(
      new THREE.Vector3(max.x + offset, 0.0, min.z - offset),
      new THREE.Vector3(max.x + offset, max.y, min.z - offset)
    );
  };

  // Toggle Dimensions Visibility
  const toggleDimensions = () => {
    const next = !showDimensions;
    setShowDimensions(next);
    if (dimensionGroupRef.current) {
      dimensionGroupRef.current.visible = next;
    }
  };

  // Camera Angle Presets
  const setCameraView = (view) => {
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    if (!controls || !camera) return;

    if (view === 'perspective') {
      camera.position.set(2.8, 1.8, 3.6);
      controls.target.set(0, 0.55, 0);
    } else if (view === 'front') {
      camera.position.set(0, 0.7, 4.2);
      controls.target.set(0, 0.55, 0);
    } else if (view === 'side') {
      camera.position.set(4.2, 0.7, 0);
      controls.target.set(0, 0.55, 0);
    } else if (view === 'top') {
      camera.position.set(0, 4.5, 0.01);
      controls.target.set(0, 0, 0);
    }
    controls.update();
  };

  // Auto Rotate Toggle
  const toggleAutoRotate = () => {
    const next = !autoRotate;
    setAutoRotate(next);
    if (controlsRef.current) {
      controlsRef.current.autoRotate = next;
    }
  };

  // Snapshot Capture
  const handleTakeSnapshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    setSnapshotLoading(true);
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${product?.slug || 'phuquy-furniture'}-3d-render.png`;
    link.href = dataUrl;
    link.click();
    setTimeout(() => setSnapshotLoading(false), 800);
  };

  // Procedural Fallback Builder if GLTF not available
  const buildProceduralFallback = (group, prod) => {
    const mat = new THREE.MeshStandardMaterial({
      color: selectedPreset.color,
      roughness: selectedPreset.roughness,
      metalness: selectedPreset.metalness,
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.85, 1.0), mat);
    box.position.y = 0.425;
    box.castShadow = true;
    group.add(box);
    primaryMeshesRef.current = [box];
  };

  const currentLighting = STUDIO_LIGHTING_MODES.find((m) => m.id === lightingStyle) || STUDIO_LIGHTING_MODES[0];
  const filteredPresets = MATERIAL_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-stone-200/80 shadow-2xl transition-all duration-300 select-none bg-gradient-to-b ${
        currentLighting.bgClass
      } ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full aspect-[4/3] min-h-[420px]'}`}
    >
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {modelLoading && (
        <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs flex items-center justify-center pointer-events-none z-20">
          <div className="bg-stone-900/90 text-amber-400 text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-500/30 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Đang tải mô hình 3D PBR chi tiết...</span>
          </div>
        </div>
      )}

      {/* TOP OVERLAY BAR: Brand Badge & Mode Switchers */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 flex-wrap gap-2">
        {/* Left: 3D High-Fidelity Tag */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/85 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-stone-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Phú Quý 3D Studio</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-black">
              PBR 360°
            </span>
          </div>

          {/* Quick Studio Lighting Switcher */}
          <div className="hidden sm:flex items-center bg-stone-900/85 backdrop-blur-md p-1 rounded-full border border-stone-700/60 shadow-lg">
            {STUDIO_LIGHTING_MODES.map((mode) => {
              const Icon = mode.icon;
              const active = lightingStyle === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setLightingStyle(mode.id)}
                  className={`p-1.5 rounded-full text-xs font-semibold transition ${
                    active
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                  title={mode.name}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Dimension Ruler Toggle */}
          <button
            onClick={toggleDimensions}
            className={`p-2 rounded-xl border backdrop-blur-md transition shadow flex items-center gap-1 text-xs font-bold ${
              showDimensions
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-900/80 text-stone-200 hover:bg-stone-800 border-stone-700'
            }`}
            title="Bật / Tắt thước đo kích thước thực tế"
          >
            <Ruler className="w-4 h-4" />
            <span className="hidden md:inline">Thước Đo</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`p-2 rounded-xl border backdrop-blur-md transition shadow ${
              wireframeMode
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-900/80 text-stone-200 hover:bg-stone-800 border-stone-700'
            }`}
            title="Chế độ lưới kỹ thuật (Wireframe)"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={toggleAutoRotate}
            className={`p-2 rounded-xl border backdrop-blur-md transition shadow ${
              autoRotate
                ? 'bg-amber-500 text-stone-950 border-amber-400'
                : 'bg-stone-900/80 text-stone-200 hover:bg-stone-800 border-stone-700'
            }`}
            title="Tự động xoay 360°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Snapshot Button */}
          <button
            onClick={handleTakeSnapshot}
            disabled={snapshotLoading}
            className="p-2 bg-stone-900/80 hover:bg-stone-800 text-stone-200 rounded-xl border border-stone-700 backdrop-blur-md transition shadow flex items-center gap-1.5 text-xs font-bold"
            title="Chụp ảnh 3D Studio"
          >
            {snapshotLoading ? <Check className="w-4 h-4 text-emerald-400" /> : <Camera className="w-4 h-4 text-amber-400" />}
            <span className="hidden lg:inline">{snapshotLoading ? 'Đã lưu!' : 'Chụp 3D'}</span>
          </button>

          {/* AR QuickLook Modal Trigger */}
          <button
            onClick={() => setArModalOpen(true)}
            className="p-2 bg-stone-900/80 hover:bg-stone-800 text-amber-300 rounded-xl border border-stone-700 backdrop-blur-md transition shadow flex items-center gap-1.5 text-xs font-bold"
            title="Xem trong phòng thật bằng AR"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Xem AR</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-stone-900/80 hover:bg-stone-800 text-stone-200 rounded-xl border border-stone-700 backdrop-blur-md transition shadow"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* BOTTOM LEFT: Camera Angle Presets Bar */}
      <div className="absolute bottom-20 sm:bottom-4 left-4 z-10 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-stone-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700/60 shadow-xl">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Eye className="w-3 h-3 text-amber-400" />
            <span>Góc Nhìn:</span>
          </span>
          <button
            onClick={() => setCameraView('perspective')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            45° Phối Cảnh
          </button>
          <button
            onClick={() => setCameraView('front')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Mặt Trước
          </button>
          <button
            onClick={() => setCameraView('side')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Mặt Bên
          </button>
          <button
            onClick={() => setCameraView('top')}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition"
          >
            Từ Trên
          </button>
          <button
            onClick={() => setCameraView('perspective')}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            title="Đưa về mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D FLOATING DIMENSION TAGS (When Ruler Enabled) */}
      {showDimensions && (
        <div className="absolute top-16 left-4 z-10 pointer-events-none animate-in fade-in">
          <div className="bg-stone-900/90 backdrop-blur-md border border-amber-500/40 p-3 rounded-2xl shadow-xl space-y-1.5 text-xs text-stone-200 pointer-events-auto">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 pb-1 border-b border-stone-800">
              <Ruler className="w-3.5 h-3.5" />
              <span>Thông Số Kích Thước Thực:</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Chiều dài (D):</span>
              <span className="font-mono font-bold text-white">{productDims.widthM} m</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Chiều sâu (R):</span>
              <span className="font-mono font-bold text-white">{productDims.depthM} m</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-stone-400">Chiều cao (C):</span>
              <span className="font-mono font-bold text-white">{productDims.heightM} m</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM RIGHT: INTERACTIVE MATERIAL & TEXTURE CUSTOMIZER */}
      <div className="absolute bottom-4 right-4 z-10 max-w-sm w-full sm:w-auto pointer-events-none">
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-700/80 p-3.5 rounded-3xl shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-white">Chất Liệu & Màu Sắc</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-300 truncate max-w-[140px]">
              {selectedPreset.name}
            </span>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 bg-stone-950/60 p-1 rounded-xl">
            {[
              { id: 'da', label: 'Da Thật' },
              { id: 'vai', label: 'Vải & Nỉ' },
              { id: 'go', label: 'Gỗ Tự Nhiên' },
              { id: 'da-stone', label: 'Mặt Đá' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition ${
                  activeCategory === c.id ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Swatches Grid */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyMaterialPreset(preset)}
                  className={`group relative flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all transform ${
                    isSelected
                      ? 'scale-115 border-amber-400 ring-2 ring-amber-500/40 shadow-lg'
                      : 'border-stone-700 hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.previewColor }}
                  title={`${preset.name} (${preset.badge})`}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className={`w-3.5 h-3.5 ${preset.category === 'vai' && preset.id === 'boucle-white' ? 'text-stone-900' : 'text-white'}`} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick link to Room Concept Studio */}
          <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
            <Link
              to="/room-concept"
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
            >
              <span>🏛️ Thử Đặt Vào Studio 3D AI</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* AR QUICKLOOK & QR CODE MODAL */}
      {arModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-sm w-full p-6 text-stone-100 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Xem AR Trong Phòng Thật</h3>
              </div>
              <button
                onClick={() => setArModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-inner">
                {/* Clean Dynamic SVG QR Code Representation */}
                <div className="w-44 h-44 bg-white flex flex-col items-center justify-center border-2 border-stone-900 p-2 relative rounded-xl">
                  <QrCode className="w-36 h-36 text-stone-900" />
                  <span className="absolute bottom-1 text-[9px] font-black tracking-widest text-brand-700 uppercase">
                    PHU QUY AR 3D
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-300">
                  Quét mã bằng Camera iPhone / Android
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Công nghệ WebXR / Apple QuickLook tự động mô phỏng tỷ lệ thật 1:1 trong phòng khách của bạn.
                </p>
              </div>
            </div>

            <button
              onClick={() => setArModalOpen(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl transition shadow"
            >
              Đã Hiểu, Quay Lại Trình Xem 3D
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
