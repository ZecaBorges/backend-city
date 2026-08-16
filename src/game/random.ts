export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function deterministicIndex(value: string, length: number, seed: number = 0): number {
  if (length <= 0) throw new Error('Length must be greater than zero');
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16_777_619);
  }
  return (hash >>> 0) % length;
}

export function deterministicUnit(value: string, seed: number = 0): number {
  const random = createSeededRandom(deterministicIndex(value, 2_147_483_647, seed));
  return random();
}

export function createDeterministicPositions(
  count: number,
  seed: number,
  ranges: readonly [readonly [number, number], readonly [number, number], readonly [number, number]],
): Float32Array {
  const random = createSeededRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      const [minimum, maximum] = ranges[axis];
      positions[index * 3 + axis] = minimum + random() * (maximum - minimum);
    }
  }
  return positions;
}
