export const TUTORIAL_STORAGE_KEY = 'backend-city:tutorial:v1';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): unknown;
}

export function hasCompletedTutorial(storage: StorageLike): boolean {
  try {
    return storage.getItem(TUTORIAL_STORAGE_KEY) === 'complete';
  } catch {
    return false;
  }
}

export function completeTutorial(storage: StorageLike): void {
  try {
    storage.setItem(TUTORIAL_STORAGE_KEY, 'complete');
  } catch {
    // Storage may be disabled; the tutorial still works for the current session.
  }
}
