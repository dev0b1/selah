// Lightweight IndexedDB helper for storing audio nudge blobs for offline playback
export async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('daily-offline', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('audio_nudges')) {
        db.createObjectStore('audio_nudges', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSongAudio(songId: string, blob: Blob) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('audio_nudges', 'readwrite');
    const store = tx.objectStore('audio_nudges');
    const item = {
      id: songId,
      audio: blob,
      createdAt: Date.now()
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSongAudio(songId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_nudges', 'readonly');
    const store = tx.objectStore('audio_nudges');
    const req = store.get(songId);
    req.onsuccess = () => {
      const result = req.result;
      if (!result) return resolve(null);
      resolve(result.audio as Blob);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getSongObjectURL(songId: string): Promise<string | null> {
  const blob = await getSongAudio(songId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteSongAudio(songId: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('audio_nudges', 'readwrite');
    const store = tx.objectStore('audio_nudges');
    const req = store.delete(songId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
