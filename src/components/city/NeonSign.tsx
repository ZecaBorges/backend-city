import { Text } from '@react-three/drei';
import plexMonoUrl from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff';

const unlit = { toneMapped: false } as const;

interface NeonSignProps {
  text: string;
  sub?: string;
  color: string;
  position?: [number, number, number];
  rotationY?: number;
  fontSize?: number;
}

export default function NeonSign({ text, sub, color, position = [0, 0, 0], rotationY = 0, fontSize = 0.55 }: NeonSignProps) {
  return (
    <group position={position} rotation-y={rotationY}>
      <Text
        font={plexMonoUrl}
        fontSize={fontSize}
        color={color}
        {...unlit}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        outlineWidth={0.035}
        outlineBlur={0.09}
        outlineColor={color}
        outlineOpacity={0.45}
      >{text}</Text>
      {sub && (
        <Text
          font={plexMonoUrl}
          position={[0, -fontSize * 0.68, 0.02]}
          fontSize={fontSize * 0.46}
          color={color}
          {...unlit}
          fillOpacity={0.72}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.11}
          outlineWidth={0.02}
          outlineBlur={0.05}
          outlineColor={color}
          outlineOpacity={0.3}
        >{sub}</Text>
      )}
    </group>
  );
}