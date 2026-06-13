const DEFAULT_AUDIO_MIME = 'audio/mp3';

export function resolveAudioMime(audioMime?: string): string {
  return audioMime && audioMime.trim() ? audioMime : DEFAULT_AUDIO_MIME;
}

export function createAudioBlobFromBase64(base64Audio: string, audioMime?: string): Blob {
  const mime = resolveAudioMime(audioMime);
  const bytes = Uint8Array.from(atob(base64Audio), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

export function createObjectUrlFromBase64Audio(base64Audio: string, audioMime?: string): string {
  const blob = createAudioBlobFromBase64(base64Audio, audioMime);
  return URL.createObjectURL(blob);
}

export function createAudioDataUrl(base64Audio: string, audioMime?: string): string {
  const mime = resolveAudioMime(audioMime);
  return `data:${mime};base64,${base64Audio}`;
}
