// Resize an image File to a max-dimension JPEG data-URL. Used for user review
// photos so they fit in localStorage (~5 MB cap per origin) without blowing it
// up with original 5000×5000 phone uploads. Returns the data-URL or rejects
// if the file can't be decoded.
export async function readAndResizeImage(
  file: File,
  maxDim = 1280,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('not_an_image')

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error || new Error('read_failed'))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('decode_failed'))
    el.src = dataUrl
  })

  const ratio = Math.min(1, maxDim / Math.max(img.width, img.height))
  if (ratio === 1 && file.size < 600_000) return dataUrl // already small

  const w = Math.round(img.width * ratio)
  const h = Math.round(img.height * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}

// Read a video File to a data-URL with a hard size cap. We don't transcode
// (browsers can't compress video cheaply) — just enforce a sensible upper
// bound so localStorage doesn't explode. Backend will replace with real
// upload + transcoding when ready.
const VIDEO_MAX_BYTES = 8 * 1024 * 1024 // 8 MB
export async function readVideoFile(file: File): Promise<string> {
  if (!file.type.startsWith('video/')) throw new Error('not_a_video')
  if (file.size > VIDEO_MAX_BYTES) throw new Error('video_too_large')
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error || new Error('read_failed'))
    reader.readAsDataURL(file)
  })
}

// Returns true when a data-URL (or any URL) points to a video. Used by the
// review card to decide between <img> and <video> for the thumbnail.
export function isVideoUrl(url: string): boolean {
  return url.startsWith('data:video') || /\.(mp4|webm|ogv|mov)(\?|$)/i.test(url)
}

export const REVIEW_VIDEO_MAX_MB = Math.round(VIDEO_MAX_BYTES / (1024 * 1024))
