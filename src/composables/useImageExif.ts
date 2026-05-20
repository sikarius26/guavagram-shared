/**
 * Minimal JPEG EXIF reader — extracts GPS coordinates and DateTimeOriginal.
 * Works on JPEG files from phones (iOS/Android). HEIC not supported (would need heic2any).
 *
 * This is a client-side sanity check only. Real validation MUST happen server-side
 * because EXIF can be trivially stripped or forged.
 */

export interface ExifData {
  gps?: { lat: number; lng: number }
  dateTime?: Date
  hasExif: boolean
}

export interface VerificationCheckResult {
  gpsMatch: 'ok' | 'off' | 'missing'
  dateMatch: 'ok' | 'off' | 'missing'
  distanceMeters?: number
  daysDiff?: number
  warnings: string[]
}

/** Read first N bytes as ArrayBuffer. */
const readSlice = (file: File, bytes = 256 * 1024): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file.slice(0, bytes))
  })

/** Parse EXIF from JPEG ArrayBuffer. Returns null if no EXIF found. */
const parseJpegExif = (buffer: ArrayBuffer): ExifData => {
  const view = new DataView(buffer)
  // JPEG starts with 0xFFD8
  if (view.getUint16(0) !== 0xffd8) return { hasExif: false }

  let offset = 2
  // Walk APP markers looking for APP1 (0xFFE1) with "Exif\0\0"
  while (offset < view.byteLength - 4) {
    const marker = view.getUint16(offset)
    if (marker === 0xffe1) {
      const segLen = view.getUint16(offset + 2)
      // Check "Exif" header
      if (
        view.getUint32(offset + 4) === 0x45786966 && // "Exif"
        view.getUint16(offset + 8) === 0x0000
      ) {
        return parseTiff(buffer, offset + 10, segLen - 8)
      }
    }
    // Move to next segment
    if ((marker & 0xff00) !== 0xff00) break
    const segLen = view.getUint16(offset + 2)
    offset += 2 + segLen
  }
  return { hasExif: false }
}

const parseTiff = (buffer: ArrayBuffer, tiffStart: number, _tiffLen: number): ExifData => {
  const view = new DataView(buffer)
  const byteOrder = view.getUint16(tiffStart)
  const little = byteOrder === 0x4949 // II
  const get16 = (o: number) => view.getUint16(o, little)
  const get32 = (o: number) => view.getUint32(o, little)

  // Magic 42
  if (get16(tiffStart + 2) !== 0x002a) return { hasExif: false }
  const ifd0Offset = get32(tiffStart + 4)
  const ifd0 = tiffStart + ifd0Offset

  let exifIfdOffset = 0
  let gpsIfdOffset = 0

  const numEntries = get16(ifd0)
  for (let i = 0; i < numEntries; i++) {
    const entry = ifd0 + 2 + i * 12
    const tag = get16(entry)
    const valueOffset = get32(entry + 8)
    if (tag === 0x8769) exifIfdOffset = tiffStart + valueOffset // ExifIFDPointer
    if (tag === 0x8825) gpsIfdOffset = tiffStart + valueOffset // GPSInfo
  }

  let dateTime: Date | undefined
  if (exifIfdOffset) {
    const n = get16(exifIfdOffset)
    for (let i = 0; i < n; i++) {
      const entry = exifIfdOffset + 2 + i * 12
      const tag = get16(entry)
      if (tag === 0x9003) {
        // DateTimeOriginal ASCII
        const count = get32(entry + 4)
        const valOff = count <= 4 ? entry + 8 : tiffStart + get32(entry + 8)
        const bytes = new Uint8Array(buffer, valOff, count)
        const str = new TextDecoder().decode(bytes).replace(/\0+$/, '')
        // Format: "YYYY:MM:DD HH:MM:SS"
        const m = str.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
        if (m) {
          dateTime = new Date(
            parseInt(m[1]!), parseInt(m[2]!) - 1, parseInt(m[3]!),
            parseInt(m[4]!), parseInt(m[5]!), parseInt(m[6]!)
          )
        }
      }
    }
  }

  let gps: { lat: number; lng: number } | undefined
  if (gpsIfdOffset) {
    const n = get16(gpsIfdOffset)
    let latRef = 'N', lngRef = 'E'
    let latDeg: number[] = [], lngDeg: number[] = []
    const readRational = (valOff: number, count: number) => {
      const arr: number[] = []
      for (let j = 0; j < count; j++) {
        const num = get32(valOff + j * 8)
        const den = get32(valOff + j * 8 + 4)
        arr.push(den === 0 ? 0 : num / den)
      }
      return arr
    }
    for (let i = 0; i < n; i++) {
      const entry = gpsIfdOffset + 2 + i * 12
      const tag = get16(entry)
      const count = get32(entry + 4)
      const valOff = count <= 1 ? entry + 8 : tiffStart + get32(entry + 8)
      if (tag === 0x0001) latRef = String.fromCharCode(view.getUint8(entry + 8))
      if (tag === 0x0002 && count === 3) latDeg = readRational(valOff, 3)
      if (tag === 0x0003) lngRef = String.fromCharCode(view.getUint8(entry + 8))
      if (tag === 0x0004 && count === 3) lngDeg = readRational(valOff, 3)
    }
    if (latDeg.length === 3 && lngDeg.length === 3) {
      let lat = latDeg[0]! + latDeg[1]! / 60 + latDeg[2]! / 3600
      let lng = lngDeg[0]! + lngDeg[1]! / 60 + lngDeg[2]! / 3600
      if (latRef === 'S') lat = -lat
      if (lngRef === 'W') lng = -lng
      gps = { lat, lng }
    }
  }

  return { hasExif: true, dateTime, gps }
}

/** Haversine distance in meters between two lat/lng pairs. */
const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }): number => {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Read EXIF from a File (JPEG only). Resolves to { hasExif: false } on any failure. */
export const readExif = async (file: File): Promise<ExifData> => {
  try {
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      return { hasExif: false }
    }
    const buf = await readSlice(file)
    return parseJpegExif(buf)
  } catch {
    return { hasExif: false }
  }
}

/**
 * Compare EXIF of a place photo against expected restaurant coords and review date.
 * Returns a soft check result with warnings — never blocks upload on its own.
 */
export const checkPlacePhoto = (
  exif: ExifData,
  expectedCoords?: { lat: number; lng: number },
  expectedDate?: Date,
  opts: { maxDistanceMeters?: number; maxDaysDiff?: number } = {}
): VerificationCheckResult => {
  const warnings: string[] = []
  const maxDist = opts.maxDistanceMeters ?? 150
  const maxDays = opts.maxDaysDiff ?? 14

  if (!exif.hasExif) {
    warnings.push('La foto no tiene metadatos (EXIF). Pueden haber sido eliminados al copiarla.')
  }

  let gpsMatch: VerificationCheckResult['gpsMatch'] = 'missing'
  let distanceMeters: number | undefined
  if (exif.gps && expectedCoords) {
    distanceMeters = haversine(exif.gps, expectedCoords)
    gpsMatch = distanceMeters <= maxDist ? 'ok' : 'off'
    if (gpsMatch === 'off') {
      warnings.push(`La foto se tomó a ${Math.round(distanceMeters)}m del restaurante (máx ${maxDist}m).`)
    }
  } else if (!exif.gps) {
    warnings.push('La foto no tiene coordenadas GPS. Activa la geolocalización en la cámara.')
  }

  let dateMatch: VerificationCheckResult['dateMatch'] = 'missing'
  let daysDiff: number | undefined
  if (exif.dateTime && expectedDate) {
    daysDiff = Math.abs(exif.dateTime.getTime() - expectedDate.getTime()) / (24 * 3600 * 1000)
    dateMatch = daysDiff <= maxDays ? 'ok' : 'off'
    if (dateMatch === 'off') {
      warnings.push(`La foto es de hace ${Math.round(daysDiff)} días (máx ${maxDays}).`)
    }
  }

  return { gpsMatch, dateMatch, distanceMeters, daysDiff, warnings }
}
