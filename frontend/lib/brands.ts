/**
 * Car brand marks for filters, cards and product pages.
 *
 * Paths come from Simple Icons (24×24 viewBox, single path). Mercedes-Benz
 * isn't in Simple Icons, so its three-pointed star is drawn here; the F1 mark
 * and the Mustang pony are traced from the official artwork. Brands are
 * matched from the product category first, then guessed from the product name
 * ("911 GT3 RS" → Porsche) for products filed under a generic category.
 */
import {
  siAmg,
  siAstonmartin,
  siAudi,
  siBmw,
  siBugatti,
  siCadillac,
  siChevrolet,
  siDacia,
  siFerrari,
  siFord,
  siHonda,
  siHyundai,
  siJeep,
  siKia,
  siKoenigsegg,
  siLamborghini,
  siMaserati,
  siMazda,
  siMclaren,
  siMini,
  siMitsubishi,
  siNissan,
  siPorsche,
  siRenault,
  siRollsroyce,
  siSeat,
  siSkoda,
  siSubaru,
  siTesla,
  siToyota,
  siVolkswagen,
  siVolvo,
} from 'simple-icons';

export interface Brand {
  key: string;
  name: string;
  path: string;
  evenOdd?: boolean;
}

/** Ring + three-pointed star, built for the 24×24 grid (even-odd fill). */
const MERCEDES_STAR =
  'M12 0a12 12 0 1 0 0 24a12 12 0 1 0 0-24zm0 1.4a10.6 10.6 0 1 1 0 21.2a10.6 10.6 0 1 1 0-21.2z' +
  'M12 1.4L13.73 11L21.18 17.3L12 14L2.82 17.3L10.27 11z';

/** Formula 1 wordmark, traced from the official logo (TM mark dropped). */
const F1_MARK =
  'M17.12 11.63L17.07 11.61L17.04 11.62L8.85 11.62L8.84 11.63L8.53 11.63L8.31 11.67L8.06 11.68L7.95 11.' +
  '72L7.80 11.73L7.71 11.77L7.61 11.78L7.54 11.82L7.46 11.83L7.41 11.87L7.37 11.87L7.14 11.98L6.92 12.1' +
  '3L6.67 12.33L4.02 14.95L4.01 15L4.02 15.01L7.11 15.01L7.16 14.99L8.01 14.14L8.26 13.94L8.46 13.84L8.' +
  '53 13.82L8.56 13.80L8.86 13.74L9.46 13.72L9.47 13.71L14.98 13.71L15.01 13.72L15.08 13.70L17.11 11.68' +
  'zM24 9L23.99 8.99L20.43 8.99L14.44 14.95L14.43 15L14.44 15.01L17.98 15.01L18.05 14.99L24 9.04zM19.75' +
  ' 9L9.01 8.99L7.96 9.02L7.44 9.07L6.65 9.22L6.08 9.42L5.59 9.68L5.16 9.96L4.61 10.41L0 14.96L0 15L3.3' +
  '3 15.01L6.45 12.03L6.77 11.78L7.09 11.58L7.63 11.38L8.27 11.28L9.21 11.24L17.52 11.24L19.73 9.06z';

/** Running-pony silhouette, traced from the Mustang emblem. */
const MUSTANG_PONY =
  'M0 12.32L0.19 12.61L0.21 12.84L0.44 13.09L0.93 13.21L1.26 13.18L1.60 12.95L1.82 12.49L2.40 11.84L3.3' +
  '5 11.30L4.09 10.67L4.33 10.68L5.33 11.30L5.79 11.75L6 12.19L5.67 13.98L5.68 14.46L5.89 14.98L6.04 15' +
  '.09L7.23 14.91L8.12 14.93L8.49 15.11L8.79 15.49L9.16 15.63L8.93 15.89L8.37 16.02L8 16.49L8.09 16.77L' +
  '9.35 16.79L9.53 16.67L10.02 16.67L10.33 16.46L10.70 16.40L11.44 16.75L11.84 16.79L12.54 16L12.40 15.' +
  '81L11.81 15.70L11.86 15.54L12.42 15.35L13.30 15.58L13.95 15.58L14.67 14.44L15.12 14.04L15.89 13.72L1' +
  '6.51 13.28L17.18 12.51L17.68 11.68L17.98 11.42L19.77 11.39L20.11 11.19L20.46 10.65L20.81 10.37L21.88' +
  ' 10.67L23.23 10.75L24 10.56L24 8.74L23.47 8.86L22.72 8.86L20.44 8.37L19.46 8.46L18.84 8.98L18.63 9.4' +
  '2L18.54 9.98L18.39 10.07L17.79 9.91L15.95 8.75L15.11 8.47L13.74 8.37L11.28 8.65L9.75 8.63L9.42 8.46L' +
  '9.56 8.21L9.44 8.02L8.65 8.05L8.95 7.61L8.96 7.42L8.79 7.26L8.53 7.21L7.77 7.28L6.56 7.67L6.19 7.39L' +
  '5.53 7.49L5.09 7.70L4.88 7.49L4.67 7.44L3.95 7.72L3.42 8.09L3.04 7.67L2.79 7.60L2.53 7.79L2.33 8.12L' +
  '2.30 8.81L1.37 9.53L1.16 10.28L0.11 11.84z';

const BRANDS: Brand[] = [
  { key: 'mercedes', name: 'Mercedes-Benz', path: MERCEDES_STAR, evenOdd: true },
  { key: 'amg', name: 'AMG', path: siAmg.path },
  { key: 'f1', name: 'Formula 1', path: F1_MARK },
  { key: 'mustang', name: 'Mustang', path: MUSTANG_PONY },
  { key: 'porsche', name: 'Porsche', path: siPorsche.path },
  { key: 'audi', name: 'Audi', path: siAudi.path },
  { key: 'bmw', name: 'BMW', path: siBmw.path },
  { key: 'volkswagen', name: 'Volkswagen', path: siVolkswagen.path },
  { key: 'ferrari', name: 'Ferrari', path: siFerrari.path },
  { key: 'lamborghini', name: 'Lamborghini', path: siLamborghini.path },
  { key: 'mclaren', name: 'McLaren', path: siMclaren.path },
  { key: 'bugatti', name: 'Bugatti', path: siBugatti.path },
  { key: 'koenigsegg', name: 'Koenigsegg', path: siKoenigsegg.path },
  { key: 'astonmartin', name: 'Aston Martin', path: siAstonmartin.path },
  { key: 'rollsroyce', name: 'Rolls-Royce', path: siRollsroyce.path },
  { key: 'maserati', name: 'Maserati', path: siMaserati.path },
  { key: 'nissan', name: 'Nissan', path: siNissan.path },
  { key: 'toyota', name: 'Toyota', path: siToyota.path },
  { key: 'honda', name: 'Honda', path: siHonda.path },
  { key: 'mitsubishi', name: 'Mitsubishi', path: siMitsubishi.path },
  { key: 'subaru', name: 'Subaru', path: siSubaru.path },
  { key: 'mazda', name: 'Mazda', path: siMazda.path },
  { key: 'ford', name: 'Ford', path: siFord.path },
  { key: 'chevrolet', name: 'Chevrolet', path: siChevrolet.path },
  { key: 'cadillac', name: 'Cadillac', path: siCadillac.path },
  { key: 'jeep', name: 'Jeep', path: siJeep.path },
  { key: 'tesla', name: 'Tesla', path: siTesla.path },
  { key: 'mini', name: 'MINI', path: siMini.path },
  { key: 'seat', name: 'SEAT', path: siSeat.path },
  { key: 'skoda', name: 'Škoda', path: siSkoda.path },
  { key: 'renault', name: 'Renault', path: siRenault.path },
  { key: 'dacia', name: 'Dacia', path: siDacia.path },
  { key: 'hyundai', name: 'Hyundai', path: siHyundai.path },
  { key: 'kia', name: 'Kia', path: siKia.path },
  { key: 'volvo', name: 'Volvo', path: siVolvo.path },
];

const BY_KEY = new Map(BRANDS.map((b) => [b.key, b]));

/** Spellings admins might use for a category, normalised (lowercase, letters/digits only). */
const ALIASES: Record<string, string> = {
  mercedesbenz: 'mercedes',
  benz: 'mercedes',
  mercedesamg: 'mercedes',
  merc: 'mercedes',
  gclass: 'mercedes',
  vw: 'volkswagen',
  lambo: 'lamborghini',
  chevy: 'chevrolet',
  rolls: 'rollsroyce',
  aston: 'astonmartin',
  bmwm: 'bmw',
  audisport: 'audi',
  porsche911: 'porsche',
  formula1: 'f1',
  formulaone: 'f1',
  formule1: 'f1',
  fordmustang: 'mustang',
  shelby: 'mustang',
};

/** Model names → brand, for products whose category isn't a brand. Order matters. */
const MODEL_HINTS: [RegExp, string][] = [
  [/\b(f1|formula\s?(1|one))\b/i, 'f1'],
  [/\b(g[\s-]?class|g[\s-]?63|amg|sls|[cesg]\s?63|maybach|mercedes|benz)\b/i, 'mercedes'],
  [/\b(porsche|911|gt[234]\s?rs|gt3|carrera|cayenne|taycan|panamera|macan|cayman|boxster|918)\b/i, 'porsche'],
  [/\b(audi|r8|rs\s?[3-7]|quattro)\b/i, 'audi'],
  [/\b(bmw|m[2-8]|e[239]\d|f[89]\d)\b/i, 'bmw'],
  [/\b(golf|gti|volkswagen|vw)\b/i, 'volkswagen'],
  [/\b(lamborghini|lambo|huracan|huracán|aventador|urus|countach|revuelto)\b/i, 'lamborghini'],
  [/\b(ferrari|f40|f50|laferrari|sf90|enzo|488|458|812)\b/i, 'ferrari'],
  [/\b(mclaren|720s|765lt|senna)\b/i, 'mclaren'],
  [/\b(bugatti|chiron|veyron)\b/i, 'bugatti'],
  [/\b(nissan|gt-?r|skyline|silvia|[34]70z|350z)\b/i, 'nissan'],
  [/\b(toyota|supra|ae86|gr\s?yaris)\b/i, 'toyota'],
  [/\b(mustang|gt500|shelby)\b/i, 'mustang'],
  [/\b(ford|raptor)\b/i, 'ford'],
  [/\b(range\s?rover|defender)\b/i, ''],
];

const normalise = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** Brand for a category / brand string ("Mercedes-Benz", "VW", "Porsche"). */
export function findBrand(label: string | undefined | null): Brand | null {
  if (!label) return null;
  const n = normalise(label);
  if (!n) return null;
  const direct = BY_KEY.get(ALIASES[n] ?? n);
  if (direct) return direct;
  // "Mercedes G63", "Porsche Classics" — category that starts with a brand.
  for (const b of BRANDS) if (n.startsWith(b.key)) return b;
  return null;
}

/** Best guess for a product: its category, else a model name in its title. */
export function brandOf(product: { category?: string; name?: string } | null | undefined): Brand | null {
  if (!product) return null;
  const fromCategory = findBrand(product.category);
  if (fromCategory) return fromCategory;
  const name = product.name || '';
  for (const [re, key] of MODEL_HINTS) {
    if (re.test(name)) return key ? BY_KEY.get(key) ?? null : null;
  }
  return null;
}
