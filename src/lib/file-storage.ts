// Minimal file-storage stub used during build. Replace with real S3/Cloud storage code.
export async function uploadPreviewAudio(buffer: Uint8Array | ArrayBuffer | null, filename?: string) {
  // Return a placeholder public path so callers can continue.
  const name = filename || 'placeholder.mp3';
  return `/demo-nudges/${name}`;
}

export async function uploadTemplateAudio(buffer: Uint8Array | ArrayBuffer | null, filename?: string) {
  const name = filename || 'template-placeholder.mp3';
  return `/demo-nudges/${name}`;
}

export default {
  uploadPreviewAudio,
};
