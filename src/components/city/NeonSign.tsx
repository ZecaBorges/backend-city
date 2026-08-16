import { Line, Text } from '@react-three/drei';
import plexMonoUrl from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff';
import { useMemo } from 'react';

const unlit = { toneMapped: false } as const;

interface NeonSignProps {
  text: string;
  sub?: string;
  color: string;
  position?: [number, number, number];
  rotationY?: number;
  fontSize?: number;
  panelWidth?: number;
  panel?: boolean;
  selected?: boolean;
  connectorLength?: number;
  compact?: boolean;
}

export default function NeonSign({
  text,
  sub,
  color,
  position = [0, 0, 0],
  rotationY = 0,
  fontSize = 0.55,
  panelWidth = 5,
  panel = true,
  selected = false,
  connectorLength = 0,
  compact = false,
}: NeonSignProps) {
  const displayFontSize = fontSize * (panel ? (compact ? 0.72 : 1) : 0.58);
  const width = compact ? Math.max(2.4, panelWidth * 0.62) : panelWidth;
  const height = sub ? displayFontSize * 1.85 : displayFontSize * 1.35;
  const borderPoints = useMemo<[number, number, number][]>(() => [
    [-width / 2, height / 2, 0.012],
    [width / 2, height / 2, 0.012],
    [width / 2, -height / 2, 0.012],
    [-width / 2, -height / 2, 0.012],
    [-width / 2, height / 2, 0.012],
  ], [height, width]);
  const connectorPoints = useMemo<[number, number, number][]>(() => [
    [0, -height / 2, 0],
    [0, -height / 2 - connectorLength, 0],
  ], [connectorLength, height]);
  return (
    <group position={position} rotation-y={rotationY}>
      {panel && (
        <>
          <mesh>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial color={selected ? '#050b16' : '#08111d'} depthTest depthWrite toneMapped={false} />
          </mesh>
          <Line points={borderPoints} color={color} lineWidth={selected ? 1.4 : 0.8} transparent opacity={selected ? 0.95 : 0.56} />
        </>
      )}
      {panel && selected && connectorLength > 0 && (
        <Line
          points={connectorPoints}
          color={color}
          lineWidth={1.25}
          transparent
          opacity={0.78}
        />
      )}
      <Text
        font={plexMonoUrl}
        position={[0, sub ? displayFontSize * 0.16 : 0, 0.03]}
        fontSize={displayFontSize}
        maxWidth={width - 0.4}
        color={color}
        {...unlit}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        outlineWidth={panel ? 0.025 : 0.018}
        outlineBlur={panel ? 0.07 : 0.04}
        outlineColor={color}
        outlineOpacity={panel ? 0.48 : 0.3}
      >{text}</Text>
      {sub && (
        <Text
          font={plexMonoUrl}
          position={[0, -displayFontSize * 0.52, 0.035]}
          fontSize={displayFontSize * 0.43}
          maxWidth={width - 0.5}
          color="#dff8ff"
          {...unlit}
          fillOpacity={0.92}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.11}
          outlineWidth={0.012}
          outlineBlur={0.03}
          outlineColor={color}
          outlineOpacity={0.22}
        >{sub}</Text>
      )}
    </group>
  );
}
