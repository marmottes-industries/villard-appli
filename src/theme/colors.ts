export const colors = {
  paper: '#F3F0E7',
  paper2: '#EBE6D8',
  card: '#FFFFFF',
  card2: '#FAF8F1',
  card3: '#F6F2E8',

  ink: '#1B271F',
  ink2: '#495248',
  ink3: '#7C837B',
  ink4: '#A7ABA1',

  line: '#E4DECE',
  line2: '#D7CFBA',
  line3: '#C7BEA4',

  forest: '#2E4A39',
  forest2: '#3A5A45',
  forestDeep: '#1E362A',
  forestInk: '#16291F',

  sage: '#748E76',
  sage2: '#8BA48C',
  sageBg: '#E7EDE0',
  sageBg2: '#DDE6D4',

  wood: '#B07A4C',
  wood2: '#C2935F',
  woodDeep: '#8A5A30',
  woodBg: '#EFE3D2',

  ok: '#5C7E5F',
  okBg: '#E5EDE0',
  worn: '#B07A4C',
  wornBg: '#F0E5D5',
  replace: '#B0584A',
  replaceBg: '#F2E0DC',

  white: '#FFFFFF',
  black: '#000000',
  scrim: 'rgba(22,34,26,0.42)',
} as const;

export const occupantPalette = [
  { color: '#3A5A45', bg: '#E4EBDF' },
  { color: '#B07A4C', bg: '#F0E5D5' },
  { color: '#5C7488', bg: '#E2E8ED' },
  { color: '#8A5B6E', bg: '#EEE2E7' },
  { color: '#7A7F4B', bg: '#ECEBD9' },
] as const;

export const accent = {
  base: colors.forest,
  deep: colors.forestDeep,
  bg: colors.sageBg,
  onAccent: colors.white,
} as const;

export type Colors = typeof colors;
