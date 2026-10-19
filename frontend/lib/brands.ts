/**
 * Car brand marks for filters, cards and product pages.
 *
 * Paths come from Simple Icons (24×24 viewBox, single path). Mercedes-Benz
 * isn't in Simple Icons, so its three-pointed star is drawn here. Brands are
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

const BRANDS: Brand[] = [
  { key: 'mercedes', name: 'Mercedes-Benz', path: MERCEDES_STAR, evenOdd: true },
  { key: 'amg', name: 'AMG', path: siAmg.path },
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
};

/** Model names → brand, for products whose category isn't a brand. Order matters. */
const MODEL_HINTS: [RegExp, string][] = [
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
  [/\b(mustang|ford|gt500|raptor)\b/i, 'ford'],
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
