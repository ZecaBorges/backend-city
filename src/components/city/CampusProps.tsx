import { Edges } from '@react-three/drei';
import { campusProps } from '../../game/world';

export default function CampusProps() {
  return (
    <group>
      {campusProps.map((prop) => {
        if (prop.kind === 'tree') return <CampusTree key={prop.id} position={prop.position} />;
        if (prop.kind === 'bench') return <CampusBench key={prop.id} position={prop.position} rotationY={prop.rotationY} />;
        return <CampusFountain key={prop.id} position={prop.position} />;
      })}
    </group>
  );
}

function CampusTree({ position }: { position: readonly [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={-0.45}>
        <cylinderGeometry args={[0.28, 0.38, 2, 6]} />
        <meshStandardMaterial color="#59452f" roughness={0.92} />
        <Edges color="#b38a55" />
      </mesh>
      <mesh position-y={0.75}>
        <coneGeometry args={[1.25, 2.5, 7]} />
        <meshStandardMaterial color="#0b513f" roughness={0.82} flatShading />
        <Edges color="#00b982" />
      </mesh>
      <mesh position-y={1.75}>
        <coneGeometry args={[0.92, 1.9, 7]} />
        <meshStandardMaterial color="#11705a" roughness={0.78} flatShading />
        <Edges color="#38d9a9" />
      </mesh>
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
