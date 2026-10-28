/**
 * The two 3D editions the shop pushes first.
 *
 * Each edition is matched by name against the live products: a product whose
 * name matches `pattern` (e.g. "G-Class 3D", "911 GT3 RS 3D") is that
 * edition, and the home spotlight, shop and product page pick up its photo,
 * price, stock and link automatically. Until it exists the spotlight shows a
 * "coming soon" panel with a WhatsApp reservation link.
 *
 * Each edition is made in one size only (`size`), and has a 2D version of
 * the same car in the catalogue (`twoD`) that the product page suggests to
 * customers who find the 3D over budget.
 */
export interface NewEdition {
  key: string;
  pattern: RegExp;
  number: string;
  title: string;
  /** Large outlined word drawn on the placeholder panel. */
  mark: string;
  tagline: string;
  taglineAr: string;
  /** The only size this edition is made in. */
  size: string;
  /** Matches the 2D version of the same car (never the 3D edition itself). */
  twoD: RegExp;
}

export const NEW_EDITIONS: NewEdition[] = [
  {
    key: 'g-class-3d',
    pattern: /\bg[\s-]*(class|63)\b.*\b3\s*d\b/i,
    number: '01',
    title: 'G-Class 3D',
    mark: 'G-Class',
    tagline: 'The brick, now with depth. Layered 3D that comes off the wall at you.',
    taglineAr: 'الجي كلاس بـ 3D — كتخرج ليك من الحيط.',
    size: '120cm x 75cm',
    twoD: /\bg[\s-]*(class|63)\b/i,
  },
  {
    key: '911-3d',
    pattern: /\b911\b.*\b3\s*d\b/i,
    number: '02',
    title: '911 3D',
    mark: '911',
    tagline: 'The most famous silhouette on earth, in three dimensions.',
    taglineAr: 'البورش 911 بـ 3D — بعمق حقيقي فالحيط ديالك.',
    size: '120cm x 50cm',
    twoD: /\b911\s*gt3\s*rs\b/i,
  },
];

export function getEditionIndex(name: string): number {
  return NEW_EDITIONS.findIndex((e) => e.pattern.test(name));
}

export function isNewEdition(name: string): boolean {
  return getEditionIndex(name) >= 0;
}

export function editionOf(name: string | undefined | null): NewEdition | undefined {
  return name ? NEW_EDITIONS[getEditionIndex(name)] : undefined;
}

/** Pick the live product (if any) for each edition, in edition order. */
export function matchEditions<T extends { name: string }>(items: T[]): (T | undefined)[] {
  return NEW_EDITIONS.map((e) => items.find((p) => e.pattern.test(p.name)));
}

/** The 2D version of a 3D edition, if it's in the catalogue and in stock. */
export function twoDVersionOf<T extends { name: string; inStock?: boolean }>(items: T[], editionName: string): T | undefined {
  const edition = editionOf(editionName);
  if (!edition) return undefined;
  return items.find((p) => edition.twoD.test(p.name) && !isNewEdition(p.name) && p.inStock !== false);
}
