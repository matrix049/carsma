/**
 * Fallbacks for CSS that older iPhones / Android browsers don't understand,
 * so layouts don't collapse for customers on old phones:
 *
 *  - svh / dvh / lvh units (iOS < 15.4): the same declaration in plain vh.
 *  - aspect-ratio (iOS < 15): the classic padding-top box via ::before.
 *
 * Both are wrapped in `@supports not (…)`, so modern browsers ignore them and
 * the minifier can't fold them into the original rule.
 */
const SMALL_VIEWPORT_UNIT = /(-?\d*\.?\d+)(svh|dvh|lvh)\b/g;

const plugin = () => ({
  postcssPlugin: 'legacy-fallbacks',
  OnceExit(root, { AtRule, Rule, Declaration }) {
    root.walkRules((rule) => {
      const parent = rule.parent;
      if (parent && parent.type === 'atrule' && parent.name === 'supports') return;
      if (rule.parent && rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return;

      const viewportDecls = [];
      let ratio = null;
      rule.each((node) => {
        if (node.type !== 'decl') return;
        if (/\d(svh|dvh|lvh)\b/.test(node.value)) viewportDecls.push(node);
        if (node.prop === 'aspect-ratio') ratio = node.value;
      });

      const blocks = [];

      if (viewportDecls.length) {
        const fallback = new Rule({ selector: rule.selector });
        viewportDecls.forEach((d) =>
          fallback.append(new Declaration({ prop: d.prop, value: d.value.replace(SMALL_VIEWPORT_UNIT, '$1vh') })),
        );
        blocks.push(['not (height: 1svh)', [fallback]]);
      }

      const match = ratio && ratio.match(/^\s*([\d.]+)\s*(?:\/\s*([\d.]+))?\s*$/);
      const selectors = rule.selectors.filter((s) => !s.includes('::'));
      if (match && selectors.length) {
        const w = parseFloat(match[1]);
        const h = match[2] ? parseFloat(match[2]) : 1;
        if (w > 0 && h > 0) {
          const before = new Rule({ selector: selectors.map((s) => `${s}::before`).join(',') });
          before.append(
            new Declaration({ prop: 'content', value: '""' }),
            new Declaration({ prop: 'float', value: 'left' }),
            new Declaration({ prop: 'padding-top', value: `${+((h / w) * 100).toFixed(4)}%` }),
          );
          const after = new Rule({ selector: selectors.map((s) => `${s}::after`).join(',') });
          after.append(
            new Declaration({ prop: 'content', value: '""' }),
            new Declaration({ prop: 'display', value: 'block' }),
            new Declaration({ prop: 'clear', value: 'both' }),
          );
          blocks.push(['not (aspect-ratio: 1 / 1)', [before, after]]);
        }
      }

      let anchor = rule;
      for (const [condition, rules] of blocks) {
        const supports = new AtRule({ name: 'supports', params: condition });
        rules.forEach((r) => supports.append(r));
        anchor.after(supports);
        anchor = supports;
      }
    });
  },
});
plugin.postcss = true;

module.exports = plugin;
