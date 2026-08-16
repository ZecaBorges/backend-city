import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { deterministicUnit } from '../../game/random';
import { campusProps, type VegetationVariant } from '../../game/world';

const treeTrunkGeometry = new THREE.CylinderGeometry(0.72, 1, 1, 6);
const treeCanopyGeometry = new THREE.ConeGeometry(1, 1, 7);

const treeVariants: Record<VegetationVariant, {
  trunk: { y: number; radius: number; height: number };
  canopies: { y: number; radius: number; height: number; color: string }[];
}> = {
  'small-wide': {
    trunk: { y: 0.48, radius: 0.22, height: 0.96 },
    canopies: [{ y: 1.28, radius: 1.2, height: 1.45, color: '#123f37' }],
  },
  medium: {
    trunk: { y: 0.62, radius: 0.24, height: 1.24 },
    canopies: [
      { y: 1.48, radius: 0.98, height: 1.55, color: '#103d34' },
      { y: 2.12, radius: 0.68, height: 1.22, color: '#155346' },
    ],
  },
  'tall-narrow': {
    trunk: { y: 0.7, radius: 0.2, height: 1.4 },
    canopies: [
      { y: 1.7, radius: 0.76, height: 1.75, color: '#0d392f' },
      { y: 2.5, radius: 0.54, height: 1.35, color: '#134b3e' },
    ],
  },
};

export default function CampusProps() {
  return (
    <group>
      {campusProps.map((prop) => {
        if (prop.kind === 'tree') return <CampusTree key={prop.id} id={prop.id} position={prop.position} rotationY={prop.rotationY} variant={prop.variant ?? 'medium'} />;
        if (prop.kind === 'bench') return <CampusBench key={prop.id} position={prop.position} rotationY={prop.rotationY} />;
        return <CampusFountain key={prop.id} position={prop.position} />;
      })}
    </group>
  );
}

function CampusTree({ id, position, rotationY, variant }: { id: string; position: readonly [number, number, number]; rotationY?: number; variant: VegetationVariant }) {
  const tree = treeVariants[variant];
  return (
    <group position={position} rotation-y={rotationY ?? deterministicUnit(id, 0x7ee) * Math.PI * 2}>
      <mesh geometry={treeTrunkGeometry} position-y={tree.trunk.y} scale={[tree.trunk.radius, tree.trunk.height, tree.trunk.radius]}>
        <meshStandardMaterial color="#40362b" roughness={0.94} />
      </mesh>
      {tree.canopies.map((canopy, index) => (
        <mesh key={canopy.y} geometry={treeCanopyGeometry} position-y={canopy.y} scale={[canopy.radius, canopy.height, canopy.radius]}>
          <meshStandardMaterial color={canopy.color} roughness={0.88} flatShading />
          {index === tree.canopies.length - 1 && <Edges color="#267b68" scale={1.008} />}
        </mesh>
      ))}
    </group>
  );
}

function CampusBench({ position, rotationY = 0 }: { position: readonly [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh>
        <boxGeometry args={[2.8, 0.24, 0.8]} />
        <meshStandardMaterial color="#15283a" metalness={0.36} roughness={0.72} />
        <Edges color="#4e8ca4" />
      </mesh>
      <mesh position={[0, 0.55, 0.32]} rotation-x={-0.12}>
        <boxGeometry args={[2.8, 0.72, 0.16]} />
        <meshStandardMaterial color="#102233" metalness={0.4} roughness={0.68} />
        <Edges color="#22d3ee" />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, -0.38, 0]}>
          <boxGeometry args={[0.18, 0.65, 0.58]} />
          <meshStandardMaterial color="#080f1d" metalness={0.55} roughness={0.54} />
        </mesh>
      ))}
    </group>
  );
}

function CampusFountain({ position }: { position: readonly [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[2.25, 2.45, 0.65, 8]} />
        <meshStandardMaterial color="#101d31" metalness={0.52} roughness={0.38} />
        <Edges color="#22d3ee" />
      </mesh>
      <mesh position-y={0.36}>
        <cylinderGeometry args={[1.86, 1.86, 0.08, 8]} />
        <meshBasicMaterial color="#168fb1" transparent opacity={0.72} toneMapped={false} />
      </mesh>
      <mesh position-y={1.08}>
        <cylinderGeometry args={[0.32, 0.48, 1.45, 8]} />
        <meshStandardMaterial color="#15263e" metalness={0.65} roughness={0.3} />
        <Edges color="#7eeaff" />
      </mesh>
      <mesh position-y={1.82}>
        <octahedronGeometry args={[0.46, 0]} />
        <meshBasicMaterial color="#80efff" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color="#22d3ee" intensity={10} distance={7} />
    </group>
  );
}
