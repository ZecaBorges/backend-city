import { Edges, Grid, Line, Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import * as THREE from 'three';
import type { FastTravelRequest } from './CityExperience';
import CampusProps from './CampusProps';
import { getCameraTarget, getCameraZoom } from '../../game/camera';
import { calculateMovement, isEditableTarget, isPositionWalkable, type MovementKeys, type Position2D } from '../../game/movement';
import {
  avatarCollisionRadius,
  avatarSpawn,
  campusPaths,
  dossierDismissDistance,
  findNearestLandmark,
  getLandmark,
  worldBounds,
  worldColliders,
  worldLandmarks,
  resolveFastTravelDestination,
  type LandmarkId,
  type WorldLandmark,
} from '../../game/world';

interface CitySceneProps {
  selectedId: LandmarkId;
  mode: 'menu' | 'tour' | 'explore';
  fastTravelRequest: FastTravelRequest | null;
  onSelect: (id: LandmarkId) => void;
  onInspect: (id: LandmarkId) => void;
  onDismissDossier: () => void;
  controlElementRef: RefObject<HTMLDivElement | null>;
  joystickVectorRef: RefObject<Position2D>;
  inspectSequenceRef: RefObject<number>;
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

export default function CityScene({ selectedId, mode, fastTravelRequest, onSelect, onInspect, onDismissDossier, controlElementRef, joystickVectorRef, inspectSequenceRef }: CitySceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const avatarPositionRef = useRef<Position2D>({ ...avatarSpawn });
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return (
    <>
      <color attach="background" args={['#030611']} />
      <fog attach="fog" args={['#030611', 30, 70]} />
      <ambientLight intensity={1.15} />
      <hemisphereLight args={['#6fd9ff', '#0b1020', 1.2]} />
      <directionalLight position={[10, 24, 12]} intensity={2.3} color="#d9f4ff" />
      <pointLight position={[-14, 8, -10]} intensity={52} distance={28} color="#00e89d" />
      <pointLight position={[14, 8, -12]} intensity={48} distance={28} color="#00a8ff" />
      <pointLight position={[0, 6, -2]} intensity={32} distance={20} color="#d946ef" />

      <Environment reducedMotion={reducedMotion} />
      <Infrastructure selectedId={selectedId} reducedMotion={reducedMotion} />
      <CampusProps />
      {worldLandmarks.map((landmark) => (
        <Landmark key={landmark.id} landmark={landmark} selected={landmark.id === selectedId} interactive={mode === 'explore'} onSelect={onSelect} reducedMotion={reducedMotion} />
      ))}
      {mode === 'explore' && (
        <AvatarController
          selectedId={selectedId}
          avatarPositionRef={avatarPositionRef}
          fastTravelRequest={fastTravelRequest}
          onInspect={onInspect}
          onDismissDossier={onDismissDossier}
          controlElementRef={controlElementRef}
          joystickVectorRef={joystickVectorRef}
          inspectSequenceRef={inspectSequenceRef}
        />
      )}
      <CameraDirector selectedId={selectedId} mode={mode} avatarPositionRef={avatarPositionRef} reducedMotion={reducedMotion} />
    </>
  );
}

function makeFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);
  context.fillStyle = '#10233a';
  context.fillRect(0, 0, 512, 512);
  context.strokeStyle = '#0b1826';
  context.lineWidth = 3;
  const panel = 64;
  for (let x = 0; x <= 512; x += panel) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, 512);
    context.stroke();
  }
  for (let y = 0; y <= 512; y += panel) {
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(512, y + 0.5);
    context.stroke();
  }
  for (let index = 0; index < 96; index += 1) {
    context.fillStyle = `rgba(${8 + Math.random() * 40}, ${18 + Math.random() * 42}, ${28 + Math.random() * 56}, 0.35)`;
    context.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 5, 2 + Math.random() * 5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(17, 14.5);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

let cachedFloorTexture: THREE.CanvasTexture | null = null;

function getFloorTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (!cachedFloorTexture) cachedFloorTexture = makeFloorTexture();
  return cachedFloorTexture;
}

function Environment({ reducedMotion }: { reducedMotion: boolean }) {
  const floorTexture = getFloorTexture();
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.12, 1]}>
        <planeGeometry args={[68, 58]} />
        <meshStandardMaterial color={floorTexture ? '#ffffff' : '#0d1d31'} map={floorTexture ?? undefined} roughness={0.96} />
      </mesh>
      <Grid position={[0, 0, 1]} args={[68, 58]} cellSize={1} cellThickness={0.35} cellColor="#1d4f6e" sectionSize={5} sectionThickness={0.85} sectionColor="#1f7394" fadeDistance={68} infiniteGrid={false} />
      <Line points={[[-34, 0.02, -28], [34, 0.02, -28], [34, 0.02, 30], [-34, 0.02, 30], [-34, 0.02, -28]]} color="#2b7a96" lineWidth={1.4} transparent opacity={0.7} />
      {!reducedMotion && <Sparkles count={48} scale={[60, 10, 50]} position={[0, 5, 1]} size={1.2} speed={0.1} opacity={0.2} color="#73eaff" />}
    </>
  );
}

function Infrastructure({ selectedId, reducedMotion }: { selectedId: LandmarkId; reducedMotion: boolean }) {
  const active = getLandmark(selectedId);
  const core = getLandmark('engineering-core');
  const routeIds: LandmarkId[] = ['cassems', 'pluxxe', 'visavale', 'squad-app', 'educarmais', 'ai-rd'];
  return (
    <group>
      {campusPaths.map((path) => <Road key={path.id} position={[...path.position]} size={[...path.size]} color="#1d4052" />)}
      {routeIds.map((id) => {
        const landmark = getLandmark(id);
        const routeX = id === 'cassems' || id === 'ai-rd' ? -8 : id === 'pluxxe' ? 8 : landmark.entryPoint.x;
        const points: [number, number, number][] = [
          [core.entryPoint.x, 0.13, core.entryPoint.z],
          [0, 0.13, 8],
          [routeX, 0.13, 8],
          [routeX, 0.13, landmark.entryPoint.z],
          [landmark.entryPoint.x, 0.13, landmark.entryPoint.z],
        ];
        return <Line key={id} points={points} color={landmark.color} lineWidth={active.id === id ? 3 : 1.2} dashed={id === 'pluxxe'} dashSize={0.6} gapSize={0.35} transparent opacity={0.75} />;
      })}
      {!reducedMotion && <DataPackets />}
    </group>
  );
}

function Road({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  const halfX = size[0] / 2;
  const halfZ = size[2] / 2;
  const longAlongX = size[0] >= size[2];
  const y = 0.077;
  const gap = 0.012;
  const first: [number, number, number][] = longAlongX
    ? [[-halfX - gap, y, -halfZ - gap], [halfX + gap, y, -halfZ - gap]]
    : [[-halfX - gap, y, -halfZ - gap], [-halfX - gap, y, halfZ + gap]];
  const second: [number, number, number][] = longAlongX
    ? [[-halfX - gap, y, halfZ + gap], [halfX + gap, y, halfZ + gap]]
    : [[halfX + gap, y, -halfZ - gap], [halfX + gap, y, halfZ + gap]];
  return (
    <group position={position}>
      <mesh><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.82} metalness={0.12} /></mesh>
      <Line points={first} color="#256a8a" lineWidth={1} transparent opacity={0.5} />
      <Line points={second} color="#256a8a" lineWidth={1} transparent opacity={0.5} />
    </group>
  );
}

function DataPackets() {
  const packetsRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!packetsRef.current) return;
    packetsRef.current.children.forEach((packet, index) => {
      const phase = (clock.elapsedTime * (0.12 + index * 0.012) + index * 0.17) % 1;
      const angle = (index / packetsRef.current!.children.length) * Math.PI * 2;
      packet.position.set(Math.cos(angle) * phase * 20, 0.22, -2 + Math.sin(angle) * phase * 17);
    });
  });
  return (
    <group ref={packetsRef}>
      {Array.from({ length: 16 }, (_, index) => <mesh key={index}><boxGeometry args={[0.12, 0.12, 0.12]} /><meshBasicMaterial color={index % 2 ? '#22d3ee' : '#d946ef'} toneMapped={false} /></mesh>)}
    </group>
  );
}

function Landmark({ landmark, selected, interactive, onSelect, reducedMotion }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void; reducedMotion: boolean }) {
  if (landmark.id === 'cassems') return <CassemsDistrict landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  if (landmark.id === 'engineering-core') return <EngineeringCore landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} reducedMotion={reducedMotion} />;
  if (landmark.id === 'ai-rd') return <AiResearchZone landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  if (landmark.id === 'pluxxe') return <FiscalHub landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  if (landmark.id === 'visavale') return <TrustGateway landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  return <CareerTower landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
}

function InteractiveGroup({ landmark, interactive, children, onSelect }: { landmark: WorldLandmark; interactive: boolean; children: ReactNode; onSelect: (id: LandmarkId) => void }) {
  return (
    <group
      position={landmark.position}
      onClick={(event) => { event.stopPropagation(); if (interactive) onSelect(landmark.id); }}
      onPointerEnter={() => { if (interactive) document.body.style.cursor = 'pointer'; }}
      onPointerLeave={() => { document.body.style.cursor = 'default'; }}
    >{children}</group>
  );
}

function CareerTower({ landmark, selected, interactive, onSelect }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void }) {
  const [width, height, depth] = landmark.size;
  return (
    <InteractiveGroup landmark={landmark} interactive={interactive} onSelect={onSelect}>
      <mesh geometry={boxGeometry} scale={[width, height, depth]}><meshStandardMaterial color={selected ? landmark.color : '#101a2d'} roughness={0.5} metalness={0.45} /><Edges color={landmark.color} scale={selected ? 1.025 : 1.005} /></mesh>
      <WindowBands width={width} height={height} depth={depth} color={landmark.color} />
      <SelectionBeacon selected={selected} color={landmark.color} radius={Math.max(width, depth) * 0.72} y={-height / 2 + 0.08} />
    </InteractiveGroup>
  );
}

function CassemsDistrict({ landmark, selected, interactive, onSelect }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void }) {
  return (
    <InteractiveGroup landmark={landmark} interactive={interactive} onSelect={onSelect}>
      <mesh geometry={boxGeometry} scale={[7, 2.2, 6]}><meshStandardMaterial color="#0b2925" roughness={0.58} metalness={0.32} /><Edges color={landmark.color} scale={1.01} /></mesh>
      <group position={[0, 1.8, 0]}>
        {[-2.2, 0, 2.2].map((x, index) => <mesh key={x} position={[x, index === 1 ? 1.1 : 0, 0]}><cylinderGeometry args={[0.72, 0.92, index === 1 ? 4.6 : 2.6, 8]} /><meshStandardMaterial color={selected ? '#00e89d' : '#11382f'} metalness={0.5} roughness={0.4} /><Edges color="#00e89d" /></mesh>)}
        <Line points={[[-3, -0.8, 2.5], [-1, -0.8, 2.5], [0, -0.8, 1], [1, -0.8, 2.5], [3, -0.8, 2.5]]} color="#a2ffe1" lineWidth={2} />
      </group>
      <SelectionBeacon selected={selected} color={landmark.color} radius={5.1} y={-3.22} />
    </InteractiveGroup>
  );
}

function FiscalHub({ landmark, selected, interactive, onSelect }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void }) {
  return (
    <InteractiveGroup landmark={landmark} interactive={interactive} onSelect={onSelect}>
      <mesh geometry={boxGeometry} scale={landmark.size}><meshStandardMaterial color={selected ? '#006ca8' : '#10243a'} metalness={0.48} roughness={0.48} /><Edges color="#00a8ff" /></mesh>
      <group position={[0, 4.8, 0]}>{[-1.6, -0.53, 0.53, 1.6].map((x) => <mesh key={x} position={[x, 0, 0]}><boxGeometry args={[0.58, 0.58, 0.58]} /><meshBasicMaterial color="#76d4ff" toneMapped={false} /></mesh>)}</group>
      <Line points={[[-2, 4.1, 0], [2, 4.1, 0]]} color="#00a8ff" dashed dashSize={0.25} gapSize={0.18} lineWidth={2} />
      <SelectionBeacon selected={selected} color={landmark.color} radius={3.8} y={-3.72} />
    </InteractiveGroup>
  );
}

function TrustGateway({ landmark, selected, interactive, onSelect }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void }) {
  return (
    <InteractiveGroup landmark={landmark} interactive={interactive} onSelect={onSelect}>
      <mesh geometry={boxGeometry} scale={landmark.size}><meshStandardMaterial color={selected ? '#4b3eb3' : '#171a35'} roughness={0.48} metalness={0.42} /><Edges color={landmark.color} /></mesh>
      <mesh rotation-x={-Math.PI / 2}><torusGeometry args={[3.5, 0.09, 8, 48]} /><meshBasicMaterial color="#7c6cff" toneMapped={false} /></mesh>
      <mesh position={[0, 3.3, 0]}><octahedronGeometry args={[0.7, 0]} /><meshBasicMaterial color="#c9c2ff" wireframe toneMapped={false} /></mesh>
      <SelectionBeacon selected={selected} color={landmark.color} radius={3.8} y={-2.42} />
    </InteractiveGroup>
  );
}

function EngineeringCore({ landmark, selected, interactive, onSelect, reducedMotion }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void; reducedMotion: boolean }) {
  const coreRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (coreRef.current && !reducedMotion) coreRef.current.rotation.y += delta * 0.16; });
  return (
    <InteractiveGroup landmark={landmark} interactive={interactive} onSelect={onSelect}>
      <group ref={coreRef}>
        <mesh><cylinderGeometry args={[2.1, 2.5, 1.2, 8]} /><meshStandardMaterial color="#1d1734" metalness={0.65} roughness={0.3} /><Edges color="#d946ef" /></mesh>
        <mesh position-y={1.8}><icosahedronGeometry args={[1.05, 1]} /><meshBasicMaterial color="#d946ef" wireframe toneMapped={false} /></mesh>
        {[0, 1, 2, 3].map((index) => <mesh key={index} rotation-y={(Math.PI / 2) * index} position={[Math.cos((Math.PI / 2) * index) * 2.8, 0.4, Math.sin((Math.PI / 2) * index) * 2.8]}><boxGeometry args={[0.45, 1.5, 0.45]} /><meshBasicMaterial color={index % 2 ? '#22d3ee' : '#d946ef'} toneMapped={false} /></mesh>)}
      </group>
      <SelectionBeacon selected={selected} color={landmark.color} radius={3.6} y={-1.42} />
    </InteractiveGroup>
  );
}

function AiResearchZone({ landmark, selected, interactive, onSelect }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void }) {
  return (
    <InteractiveGroup landmark={landmark} interactive={interactive} onSelect={onSelect}>
      <mesh geometry={boxGeometry} scale={landmark.size}><meshStandardMaterial color="#140b1c" transparent opacity={0.72} roughness={0.65} /><Edges color="#ff3d9a" /></mesh>
      {[-2.2, 0, 2.2].map((x, index) => <mesh key={x} position={[x, 2.2 + index * 0.4, 0]}><boxGeometry args={[1.25, 2.5 + index, 1.25]} /><meshBasicMaterial color="#ff3d9a" wireframe transparent opacity={selected ? 0.9 : 0.42} toneMapped={false} /></mesh>)}
      <mesh position={[0, 4.7, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[2.5, 0.05, 6, 48]} /><meshBasicMaterial color="#ff3d9a" toneMapped={false} /></mesh>
      <SelectionBeacon selected={selected} color={landmark.color} radius={4.8} y={-1.02} />
    </InteractiveGroup>
  );
}

function WindowBands({ width, height, depth, color }: { width: number; height: number; depth: number; color: string }) {
  const rows = Array.from({ length: Math.max(2, Math.floor(height / 1.1)) }, (_, index) => index);
  return <group>{rows.map((row) => <mesh key={row} position={[0, -height / 2 + 0.7 + row * 1.05, depth / 2 + 0.01]}><boxGeometry args={[width * 0.66, 0.16, 0.025]} /><meshBasicMaterial color={color} transparent opacity={0.55} toneMapped={false} /></mesh>)}</group>;
}

function SelectionBeacon({ selected, color, radius, y }: { selected: boolean; color: string; radius: number; y: number }) {
  if (!selected) return null;
  return <mesh position={[0, y, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[radius, radius + 0.12, 48]} /><meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} /></mesh>;
}

function AvatarController({
  selectedId,
  avatarPositionRef,
  fastTravelRequest,
  onInspect,
  onDismissDossier,
  controlElementRef,
  joystickVectorRef,
  inspectSequenceRef,
}: {
  selectedId: LandmarkId;
  avatarPositionRef: RefObject<Position2D>;
  fastTravelRequest: FastTravelRequest | null;
  onInspect: (id: LandmarkId) => void;
  onDismissDossier: () => void;
  controlElementRef: RefObject<HTMLDivElement | null>;
  joystickVectorRef: RefObject<Position2D>;
  inspectSequenceRef: RefObject<number>;
}) {
  const avatarRef = useRef<THREE.Group>(null);
  const keys = useRef<MovementKeys>({ forward: false, backward: false, left: false, right: false });
  const handledTravelSequenceRef = useRef(0);
  const handledInspectSequenceRef = useRef(0);
  const dismissedLandmarkRef = useRef<LandmarkId | null>(null);

  useEffect(() => {
    dismissedLandmarkRef.current = null;
  }, [selectedId]);

  useEffect(() => {
    const keyMap: Record<string, keyof MovementKeys | undefined> = { w: 'forward', arrowup: 'forward', s: 'backward', arrowdown: 'backward', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' };
    const cityVisibleRef = { current: true };
    let observer: IntersectionObserver | undefined;
    const element = controlElementRef.current;
    if (typeof IntersectionObserver !== 'undefined' && element) {
      observer = new IntersectionObserver(([entry]) => { cityVisibleRef.current = entry.isIntersecting; }, { threshold: 0.25 });
      observer.observe(element);
    }
    function updateKey(event: KeyboardEvent, pressed: boolean) {
      if (!cityVisibleRef.current) return;
      if (isEditableTarget(event.target)) return;
      const mapped = keyMap[event.key.toLowerCase()];
      if (mapped) { keys.current[mapped] = pressed; event.preventDefault(); }
      if (pressed && event.key.toLowerCase() === 'e') inspectNearest();
    }
    const onKeyDown = (event: KeyboardEvent) => updateKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => updateKey(event, false);
    const reset = () => { keys.current = { forward: false, backward: false, left: false, right: false }; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', reset);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', reset);
      observer?.disconnect();
    };
  }, [avatarPositionRef, controlElementRef, onInspect]);

  useEffect(() => {
    if (!fastTravelRequest || fastTravelRequest.sequence <= handledTravelSequenceRef.current) return;
    const destination = resolveFastTravelDestination(fastTravelRequest, handledTravelSequenceRef.current);
    if (!destination) return;
    if (!isPositionWalkable(destination, worldBounds, { radius: avatarCollisionRadius, obstacles: worldColliders })) return;
    handledTravelSequenceRef.current = fastTravelRequest.sequence;
    keys.current = { forward: false, backward: false, left: false, right: false };
    joystickVectorRef.current.x = 0;
    joystickVectorRef.current.z = 0;
    avatarPositionRef.current.x = destination.x;
    avatarPositionRef.current.z = destination.z;
    avatarRef.current?.position.set(destination.x, 0.78, destination.z);
  }, [avatarPositionRef, fastTravelRequest, joystickVectorRef]);

  useEffect(() => {
    if (!inspectSequenceRef.current || inspectSequenceRef.current <= handledInspectSequenceRef.current) return;
    handledInspectSequenceRef.current = inspectSequenceRef.current;
    inspectNearest();
  });

  function inspectNearest() {
    const nearest = findNearestLandmark(avatarPositionRef.current, 7.5);
    if (!nearest) return;
    const landmark = getLandmark(nearest);
    const distance = Math.hypot(avatarPositionRef.current.x - landmark.position[0], avatarPositionRef.current.z - landmark.position[2]);
    if (distance > dossierDismissDistance) dismissedLandmarkRef.current = nearest;
    onInspect(nearest);
  }

  useFrame((_, delta) => {
    const next = calculateMovement(avatarPositionRef.current, keys.current, delta, 8, worldBounds, { radius: avatarCollisionRadius, obstacles: worldColliders }, joystickVectorRef.current);
    const dx = next.x - avatarPositionRef.current.x;
    const dz = next.z - avatarPositionRef.current.z;
    avatarPositionRef.current.x = next.x;
    avatarPositionRef.current.z = next.z;
    if (avatarRef.current) {
      avatarRef.current.position.set(next.x, 0.78, next.z);
      if (Math.hypot(dx, dz) > 0.001) avatarRef.current.rotation.y = Math.atan2(dx, dz);
    }
    const shell = controlElementRef.current;
    if (shell) {
      const label = `${next.x.toFixed(1)},${next.z.toFixed(1)}`;
      if (shell.dataset.hero !== label) shell.dataset.hero = label;
    }
    const landmark = getLandmark(selectedId);
    const distance = Math.hypot(avatarPositionRef.current.x - landmark.position[0], avatarPositionRef.current.z - landmark.position[2]);
    if (distance > dossierDismissDistance && dismissedLandmarkRef.current !== selectedId) {
      dismissedLandmarkRef.current = selectedId;
      onDismissDossier();
    }
  }, -2);

  return <group ref={avatarRef} position={[avatarPositionRef.current.x, 0.78, avatarPositionRef.current.z]}><mesh position-y={0.12}><boxGeometry args={[0.65, 0.9, 0.65]} /><meshStandardMaterial color="#d8f7ff" /><Edges color="#22d3ee" /></mesh><mesh position-y={0.86}><boxGeometry args={[0.52, 0.52, 0.52]} /><meshStandardMaterial color="#111a2d" /><Edges color="#d946ef" /></mesh><pointLight position={[0, 1.1, 0]} color="#22d3ee" intensity={6} distance={3} /></group>;
}

function CameraDirector({ selectedId, mode, avatarPositionRef, reducedMotion }: { selectedId: LandmarkId; mode: 'menu' | 'tour' | 'explore'; avatarPositionRef: RefObject<Position2D>; reducedMotion: boolean }) {
  const { camera, size } = useThree();
  const currentTarget = useRef(new THREE.Vector3(0, 0.6, 1));
  const desiredTarget = useRef(new THREE.Vector3(0, 0.6, 1));
  const desired = useRef(new THREE.Vector3());
  const overview = useRef(new THREE.Vector3(39, 40, 39));
  const focusOffset = useRef(new THREE.Vector3(19, 20, 19));
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) { camera.zoom = getCameraZoom(mode, size.width, size.height); camera.updateProjectionMatrix(); }
  }, [camera, mode, size.height, size.width]);

  useFrame((_, delta) => {
    const target = getCameraTarget(mode, selectedId, avatarPositionRef.current);
    desiredTarget.current.set(target.x, target.y, target.z);
    if (mode === 'menu') {
      desired.current.copy(overview.current);
    } else {
      desired.current.copy(desiredTarget.current).add(focusOffset.current);
    }
    const damping = mode === 'explore' ? 7 : 3.4;
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-delta * damping);
    currentTarget.current.lerp(desiredTarget.current, alpha);
    camera.position.lerp(desired.current, alpha);
    camera.lookAt(currentTarget.current);
  }, -1);
  return null;
}
