/**
 * 8-Bit-Grafik ohne Bilddateien: Jedes Sprite ist ein Raster aus Zeichen,
 * die über eine Palette in Farben übersetzt werden. '.' bleibt durchsichtig.
 */

export type Palette = Record<string, string>

export const HAUTTOENE = ['#F0C7A0', '#D9A272', '#A8703F', '#7A4A25', '#F5DCC0', '#C98B5C', '#8B5A34', '#E8B58A']
export const KLEIDUNG = ['#4F7FD4', '#C7563F', '#3F9A70', '#8A5BD1', '#D89A2B', '#4A5568', '#C7538F', '#2F8FA8']
export const HAARE = ['#2B2118', '#6B3E1E', '#C9A227', '#8C8C8C', '#1F2933', '#A34D2A', '#4B2E5A', '#D9D2C5']

/** 12x14 Figur, von vorn. */
const FIGUR_STAND = [
  '....HHHH....',
  '...HHHHHH...',
  '...HSSSSH...',
  '...SSSSSS...',
  '...SAASAA...',
  '...SSSSSS...',
  '....SSSS....',
  '..KKKKKKKK..',
  '.SKKKKKKKKS.',
  '.SKKKKKKKKS.',
  '..KKKKKKKK..',
  '..KKK..KKK..',
  '..HHH..HHH..',
  '..BBB..BBB..',
]

/** Zweite Phase: Beine versetzt, Kopf einen Pixel tiefer – ergibt den Watschelgang. */
const FIGUR_GEHT = [
  '............',
  '....HHHH....',
  '...HHHHHH...',
  '...HSSSSH...',
  '...SSSSSS...',
  '...SAASAA...',
  '....SSSS....',
  '..KKKKKKKK..',
  '.SKKKKKKKKS.',
  '.SKKKKKKKKS.',
  '..KKKKKKKK..',
  '..KKKK.KKK..',
  '...HHH.HHH..',
  '..BBB...BBB.',
]

/** Sitzend am Schreibtisch, von hinten schräg. */
const FIGUR_SITZT = [
  '............',
  '....HHHH....',
  '...HHHHHH...',
  '...HHHHHH...',
  '...SSSSSS...',
  '..KKKKKKKK..',
  '.SKKKKKKKKS.',
  '.SKKKKKKKKS.',
  '..KKKKKKKK..',
  '..KKKKKKKK..',
  '..DDDDDDDD..',
  '..DDDDDDDD..',
  '............',
  '............',
]

export const FIGUREN = { stand: FIGUR_STAND, geht: FIGUR_GEHT, sitzt: FIGUR_SITZT }

export function figurPalette(aussehen: number): Palette {
  const i = Math.abs(aussehen) % 8
  return {
    H: HAARE[i % HAARE.length],
    S: HAUTTOENE[i % HAUTTOENE.length],
    K: KLEIDUNG[i % KLEIDUNG.length],
    A: '#1B1F2A', // Augen
    B: '#2B2118', // Schuhe
    D: '#3A4358', // Stuhllehne
  }
}

const SCHREIBTISCH = [
  'TTTTTTTTTTTTTTTT',
  'TTTTTTTTTTTTTTTT',
  'TMMMMMMTTTTPPPTT',
  'TMSSSSMTTTPPPPPT',
  'TMSSSSMTTTTPPPTT',
  'TMMMMMMTTTTTTTTT',
  'TTMMMMTTTTTTTTTT',
  'BBBBBBBBBBBBBBBB',
  'B..............B',
  'B..............B',
]

const SCHREIBTISCH_PALETTE: Palette = {
  T: '#B08652',
  B: '#8A6540',
  M: '#3B4152',
  S: '#7FD4C1',
  P: '#E8E4D8',
}

const PFLANZE = [
  '..GG..GG..',
  '.GGGGGGGG.',
  'GGGGGGGGGG',
  '.GGGGGGGG.',
  '..GGGGGG..',
  '....GG....',
  '...TTTT...',
  '..TTTTTT..',
  '..TTTTTT..',
  '...TTTT...',
]
const PFLANZE_PALETTE: Palette = { G: '#3F9A70', T: '#B4623F' }

const KAFFEE = [
  'MMMMMMMM',
  'M......M',
  'M.DDDD.M',
  'M.DDDD.M',
  'MMMMMMMM',
  'M.WW...M',
  'M.WW..LM',
  'MMMMMMMM',
]
const KAFFEE_PALETTE: Palette = { M: '#4A5568', D: '#2B2118', W: '#E8E4D8', L: '#D89A2B' }

const REGAL = [
  'BBBBBBBBBB',
  'BRRGGYYRRB',
  'BRRGGYYRRB',
  'BBBBBBBBBB',
  'BGGRRRYYGB',
  'BGGRRRYYGB',
  'BBBBBBBBBB',
  'BYYRRGGRRB',
  'BYYRRGGRRB',
  'BBBBBBBBBB',
]
const REGAL_PALETTE: Palette = { B: '#8A6540', R: '#C7563F', G: '#3F9A70', Y: '#D89A2B' }

const SOFA = [
  'SSSSSSSSSSSS',
  'SPPPPPPPPPPS',
  'SPPPPPPPPPPS',
  'SSSSSSSSSSSS',
  'SPPPPPPPPPPS',
  'SSSSSSSSSSSS',
]
const SOFA_PALETTE: Palette = { S: '#8A5BD1', P: '#B79BE0' }

const WHITEBOARD = [
  'FFFFFFFFFFFF',
  'FWWWWWWWWWWF',
  'FWLLLLWWWWWF',
  'FWWWWWWLLLWF',
  'FWLLWWWWWWWF',
  'FWWWWWWWWWWF',
  'FFFFFFFFFFFF',
]
const WHITEBOARD_PALETTE: Palette = { F: '#4A5568', W: '#F2F3EF', L: '#4F7FD4' }

const TEPPICH = [
  'RRRRRRRRRRRR',
  'RCCCCCCCCCCR',
  'RCRRRRRRRRCR',
  'RCRCCCCCCRCR',
  'RCRRRRRRRRCR',
  'RCCCCCCCCCCR',
  'RRRRRRRRRRRR',
]
const TEPPICH_PALETTE: Palette = { R: '#C7563F', C: '#D89A2B' }

export const MOEBEL: Record<string, { raster: string[]; palette: Palette }> = {
  'm-pflanze': { raster: PFLANZE, palette: PFLANZE_PALETTE },
  'm-kaffee': { raster: KAFFEE, palette: KAFFEE_PALETTE },
  'm-regal': { raster: REGAL, palette: REGAL_PALETTE },
  'm-sofa': { raster: SOFA, palette: SOFA_PALETTE },
  'm-whiteboard': { raster: WHITEBOARD, palette: WHITEBOARD_PALETTE },
  'm-teppich': { raster: TEPPICH, palette: TEPPICH_PALETTE },
}

export const TISCH = { raster: SCHREIBTISCH, palette: SCHREIBTISCH_PALETTE }

/** Malt ein Zeichenraster pixelgenau auf den Canvas. */
export function malRaster(
  ctx: CanvasRenderingContext2D,
  raster: string[],
  palette: Palette,
  x: number,
  y: number,
  pixel: number,
) {
  for (let zeile = 0; zeile < raster.length; zeile++) {
    const text = raster[zeile]
    for (let spalte = 0; spalte < text.length; spalte++) {
      const farbe = palette[text[spalte]]
      if (!farbe) continue
      ctx.fillStyle = farbe
      ctx.fillRect(x + spalte * pixel, y + zeile * pixel, pixel, pixel)
    }
  }
}
