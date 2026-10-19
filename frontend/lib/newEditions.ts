/**
 * The two pieces the home page is built around.
 *
 * They don't exist in the catalogue yet. Each edition is matched by name
 * against the live products: once an admin creates a product whose name
 * matches `pattern` (e.g. "G-Class 3D", "911 3D"), the home spotlight and
 * the shop pick up its real photo, price and link automatically. Until then
 * the spotlight shows a "coming soon" panel with a WhatsApp reservation link.
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
  },
  {
    key: '911-3d',
    pattern: /\b911\b.*\b3\s*d\b/i,
    number: '02',
    title: '911 3D',
    mark: '911',
    tagline: 'The most famous silhouette on earth, in three dimensions.',
    taglineAr: 'البورش 911 بـ 3D — بعمق حقيقي فالحيط ديالك.',
  },
];

export function getEditionIndex(name: string): number {
  return NEW_EDITIONS.findIndex((e) => e.pattern.test(name));
}

export function isNewEdition(name: string): boolean {
  return getEditionIndex(name) >= 0;
}

/** Pick the live product (if any) for each edition, in edition order. */
export function matchEditions<T extends { name: string }>(items: T[]): (T | undefined)[] {
  return NEW_EDITIONS.map((e) => items.find((p) => e.pattern.test(p.name)));
}
