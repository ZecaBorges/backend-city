import { Edges, Grid, Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import * as THREE from 'three';
import type { FastTravelRequest } from './CityExperience';
import CampusProps from './CampusProps';
import NeonSign from './NeonSign';
import { experiences } from '../../data/resume';
import { getCameraFrameOffset, getCameraTarget, getCameraZoom, type CameraMode } from '../../game/camera';
import { calculateMovement, isEditableTarget, isPositionWalkable, type MovementKeys, type Position2D } from '../../game/movement';
import { createDeterministicPositions, createSeededRandom } from '../../game/random';
import { getSignPresentation } from '../../game/signage';
import {
  avatarCollisionRadius,
  avatarSpawn,
  campusPaths,
  dossierDismissDistance,
  findNearestLandmark,
  getDossierDismissalState,
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
  dossierVisible: boolean;
  isMobile: boolean;
  controlElementRef: RefObject<HTMLDivElement | null>;
  joystickVectorRef: RefObject<Position2D>;
  inspectSequenceRef: RefObject<number>;
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const ambientParticleGeometry = makeAmbientParticleGeometry();
const cassemsPulsePoints: [number, number, number][] = [[-3, -0.8, 2.5], [-1, -0.8, 2.5], [0, -0.8, 1], [1, -0.8, 2.5], [3, -0.8, 2.5]];
const fiscalHubSignalPoints: [number, number, number][] = [[-2, 4.1, 0], [2, 4.1, 0]];
const routeLandmarkIds: LandmarkId[] = ['cassems', 'pluxxe', 'visavale', 'squad-app', 'educarmais', 'ai-rd'];
const coreEntryPoint = getLandmark('engineering-core').entryPoint;
const campusRoutes = routeLandmarkIds.map((id) => {
  const landmark = getLandmark(id);
  const routeX = id === 'cassems' || id === 'ai-rd' ? -8 : id === 'pluxxe' ? 8 : landmark.entryPoint.x;
  const points: [number, number, number][] = [
    [coreEntryPoint.x, 0.13, coreEntryPoint.z],
    [0, 0.13, 8],
    [routeX, 0.13, 8],
    [routeX, 0.13, landmark.entryPoint.z],
    [landmark.entryPoint.x, 0.13, landmark.entryPoint.z],
  ];
  return { id, landmark, points };
});

function makeAmbientParticleGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(createDeterministicPositions(16, 0xa81e17, [[-30, 30], [1, 9], [-24, 26]]), 3));
  return geometry;
}

function periodOf(landmark: WorldLandmark): string | undefined {
  if (!landmark.experienceId) return undefined;
  return experiences.find((experience) => experience.id === landmark.experienceId)?.period;
}

export default function CityScene({ selectedId, mode, fastTravelRequest, onSelect, onInspect, onDismissDossier, dossierVisible, isMobile, controlElementRef, joystickVectorRef, inspectSequenceRef }: CitySceneProps) {
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
        <Landmark key={landmark.id} landmark={landmark} selected={landmark.id === selectedId} mode={mode} mobile={isMobile} interactive={mode === 'explore'} onSelect={onSelect} reducedMotion={reducedMotion} />
      ))}
      {mode === 'explore' && (
        <AvatarController
          selectedId={selectedId}
          avatarPositionRef={avatarPositionRef}
          fastTravelRequest={fastTravelRequest}
          onInspect={onInspect}
          onDismissDossier={onDismissDossier}
          dossierVisible={dossierVisible}
          controlElementRef={controlElementRef}
          joystickVectorRef={joystickVectorRef}
          inspectSequenceRef={inspectSequenceRef}
        />
      )}
      <CameraDirector selectedId={selectedId} mode={mode} dossierVisible={dossierVisible} avatarPositionRef={avatarPositionRef} reducedMotion={reducedMotion} />
    </>
  );
}

function makeFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);
  const random = createSeededRandom(0x51a7c17);
  context.fillStyle = '#0a1726';
  context.fillRect(0, 0, 512, 512);
  for (let index = 0; index < 28; index += 1) {
    const lightness = 28 + Math.floor(random() * 20);
    context.fillStyle = `rgba(${lightness - 12}, ${lightness}, ${lightness + 14}, 0.09)`;
    context.fillRect(random() * 512, random() * 512, 3 + random() * 8, 3 + random() * 8);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3.5);
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
        <planeGeometry args={[110, 92]} />
        <meshStandardMaterial color={floorTexture ? '#ffffff' : '#0a1726'} map={floorTexture ?? undefined} roughness={0.98} />
      </mesh>
      <Grid position={[0, 0, 1]} args={[86, 72]} cellSize={5} cellThickness={0.22} cellColor="#17405a" sectionSize={10} sectionThickness={0.48} sectionColor="#1b617d" fadeDistance={62} infiniteGrid={false} />
      {!reducedMotion && <AmbientParticles />}
    </>
  );
}

function AmbientParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (particlesRef.current) particlesRef.current.rotation.y += delta * 0.004;
  });
  return (
    <points ref={particlesRef} geometry={ambientParticleGeometry}>
      <pointsMaterial color="#73eaff" size={0.1} transparent opacity={0.18} sizeAttenuation toneMapped={false} />
    </points>
  );
}

function Infrastructure({ selectedId, reducedMotion }: { selectedId: LandmarkId; reducedMotion: boolean }) {
  const active = getLandmark(selectedId);
  const activeRoute = campusRoutes.find((route) => route.id === active.id);
  return (
    <group>
      {campusPaths.map((path) => <Road key={path.id} position={[...path.position]} size={[...path.size]} color="#1d4052" />)}
      {campusRoutes.map(({ id, landmark, points }) => (
        <Line key={id} points={points} color={landmark.color} lineWidth={active.id === id ? 3 : 1} dashed={id === 'pluxxe'} dashSize={0.6} gapSize={0.35} transparent opacity={active.id === id ? 0.88 : 0.15} />
      ))}
      {!reducedMotion && activeRoute && <DataPackets key={activeRoute.id} points={activeRoute.points} color={active.color} />}
    </group>
  );
}

function Road({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return <mesh position={position}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.82} metalness={0.12} /></mesh>;
}

function DataPackets({ points, color }: { points: [number, number, number][]; color: string }) {
  const packetsRef = useRef<THREE.Group>(null);
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  if (!curveRef.current) curveRef.current = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), false, 'centripetal');
  useFrame(({ clock }) => {
    if (!packetsRef.current) return;
    packetsRef.current.children.forEach((packet, index) => {
      const phase = (clock.elapsedTime * 0.075 + index / packetsRef.current!.children.length) % 1;
      packet.position.copy(curveRef.current!.getPointAt(phase));
      packet.position.y = 0.22;
    });
  });
  return (
    <group ref={packetsRef}>
      {Array.from({ length: 6 }, (_, index) => <mesh key={index}><boxGeometry args={[0.11, 0.11, 0.11]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>)}
    </group>
  );
}

function Landmark({ landmark, selected, mode, mobile, interactive, onSelect, reducedMotion }: { landmark: WorldLandmark; selected: boolean; mode: CameraMode; mobile: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void; reducedMotion: boolean }) {
  let structure: ReactNode;
  if (landmark.id === 'cassems') structure = <CassemsDistrict landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  else if (landmark.id === 'engineering-core') structure = <EngineeringCore landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} reducedMotion={reducedMotion} />;
  else if (landmark.id === 'ai-rd') structure = <AiResearchZone landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  else if (landmark.id === 'pluxxe') structure = <FiscalHub landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  else if (landmark.id === 'visavale') structure = <TrustGateway landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  else structure = <CareerTower landmark={landmark} selected={selected} interactive={interactive} onSelect={onSelect} />;
  return <>{structure}<LandmarkSign landmark={landmark} selected={selected} mode={mode} mobile={mobile} /></>;
}

function LandmarkSign({ landmark, selected, mode, mobile }: { landmark: WorldLandmark; selected: boolean; mode: CameraMode; mobile: boolean }) {
  const presentation = getSignPresentation(mode, selected, mobile);
  if (!presentation.visible) return null;
  return (
    <group position={landmark.position}>
      <NeonSign
        text={presentation.shortLabel ? landmark.shortLabel : landmark.label}
        sub={presentation.period ? periodOf(landmark) : undefined}
        color={landmark.color}
        position={[...landmark.signage.position]}
        rotationY={landmark.signage.rotationY}
        fontSize={landmark.signage.fontSize}
        panelWidth={landmark.signage.panelWidth}
        panel={presentation.panel}
        selected={selected}
        connectorLength={presentation.connector ? landmark.signage.connectorLength : 0}
        compact={presentation.shortLabel}
      />
    </group>
  );
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
      <group position={[0, 1.1, 0]}>
        {[-2.2, 0, 2.2].map((x, index) => <mesh key={x} position={[x, index === 1 ? 1.1 : 0, 0]}><cylinderGeometry args={[0.72, 0.92, index === 1 ? 4.6 : 2.6, 8]} /><meshStandardMaterial color={selected ? '#00e89d' : '#11382f'} metalness={0.5} roughness={0.4} /><Edges color="#00e89d" /></mesh>)}
        <Line points={cassemsPulsePoints} color="#a2ffe1" lineWidth={2} />
      </group>
      <SelectionBeacon selected={selected} color={landmark.color} radius={5.1} y={-1.02} />
    </InteractiveGroup>
  );
}

function FiscalHub({ landmark, selected, interactive, onSelect }: { landmark: WorldLandmark; selected: boolean; interactive: boolean; onSelect: (id: LandmarkId) => void }) {
  return (
    <InteractiveGroup landmark={landmark} interactive={interactive} onSelect={onSelect}>
      <mesh geometry={boxGeometry} scale={landmark.size}><meshStandardMaterial color={selected ? '#006ca8' : '#10243a'} metalness={0.48} roughness={0.48} /><Edges color="#00a8ff" /></mesh>
      <group position={[0, 4.8, 0]}>{[-1.6, -0.53, 0.53, 1.6].map((x) => <mesh key={x} position={[x, 0, 0]}><boxGeometry args={[0.58, 0.58, 0.58]} /><meshBasicMaterial color="#76d4ff" toneMapped={false} /></mesh>)}</group>
      <Line points={fiscalHubSignalPoints} color="#00a8ff" dashed dashSize={0.25} gapSize={0.18} lineWidth={2} />
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
        <mesh position-y={-0.9}><cylinderGeometry args={[2.1, 2.5, 1.2, 8]} /><meshStandardMaterial color="#1d1734" metalness={0.65} roughness={0.3} /><Edges color="#d946ef" /></mesh>
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
  dossierVisible,
  controlElementRef,
  joystickVectorRef,
  inspectSequenceRef,
}: {
  selectedId: LandmarkId;
  avatarPositionRef: RefObject<Position2D>;
  fastTravelRequest: FastTravelRequest | null;
  onInspect: (id: LandmarkId) => void;
  onDismissDossier: () => void;
  dossierVisible: boolean;
  controlElementRef: RefObject<HTMLDivElement | null>;
  joystickVectorRef: RefObject<Position2D>;
  inspectSequenceRef: RefObject<number>;
}) {
  const avatarRef = useRef<THREE.Group>(null);
  const keys = useRef<MovementKeys>({ forward: false, backward: false, left: false, right: false });
  const handledTravelSequenceRef = useRef(0);
  const handledInspectSequenceRef = useRef(0);
  const dismissedLandmarkRef = useRef<LandmarkId | null>(null);
  const canDismissSelectionRef = useRef(false);

  useEffect(() => {
    if (!dossierVisible) return;
    dismissedLandmarkRef.current = null;
    canDismissSelectionRef.current = false;
  }, [dossierVisible, selectedId]);

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
    if (fastTravelRequest && fastTravelRequest.sequence > handledTravelSequenceRef.current) {
      const destination = resolveFastTravelDestination(fastTravelRequest, handledTravelSequenceRef.current);
      if (destination && isPositionWalkable(destination, worldBounds, { radius: avatarCollisionRadius, obstacles: worldColliders })) {
        handledTravelSequenceRef.current = fastTravelRequest.sequence;
        keys.current = { forward: false, backward: false, left: false, right: false };
        joystickVectorRef.current.x = 0;
        joystickVectorRef.current.z = 0;
        avatarPositionRef.current.x = destination.x;
        avatarPositionRef.current.z = destination.z;
        avatarRef.current?.position.set(destination.x, 0.78, destination.z);
      }
    }
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
    const dismissal = getDossierDismissalState(distance, canDismissSelectionRef.current);
    canDismissSelectionRef.current = dismissal.armed;
    if (dismissal.shouldDismiss && dismissedLandmarkRef.current !== selectedId) {
      dismissedLandmarkRef.current = selectedId;
      onDismissDossier();
    }
  }, -2);

  return <group ref={avatarRef} position={[avatarPositionRef.current.x, 0.78, avatarPositionRef.current.z]}><mesh position-y={0.12}><boxGeometry args={[0.65, 0.9, 0.65]} /><meshStandardMaterial color="#d8f7ff" /><Edges color="#22d3ee" /></mesh><mesh position-y={0.86}><boxGeometry args={[0.52, 0.52, 0.52]} /><meshStandardMaterial color="#111a2d" /><Edges color="#d946ef" /></mesh><pointLight position={[0, 1.1, 0]} color="#22d3ee" intensity={6} distance={3} /></group>;
}

function CameraDirector({ selectedId, mode, dossierVisible, avatarPositionRef, reducedMotion }: { selectedId: LandmarkId; mode: CameraMode; dossierVisible: boolean; avatarPositionRef: RefObject<Position2D>; reducedMotion: boolean }) {
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
    const frameOffset = getCameraFrameOffset(mode, dossierVisible, size.width);
    desiredTarget.current.set(target.x + frameOffset.x, target.y, target.z + frameOffset.z);
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
