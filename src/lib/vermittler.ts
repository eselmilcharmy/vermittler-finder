export type Rule = { id: number; from: string; to: string; name: string; orgz: string; line: string };

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

const LINE =
  /^\s*([A-Za-zÄÖÜäöüß]+)\s*[-–—]\s*([A-Za-zÄÖÜäöüß]+)\s+(.+?)\s+(\d{2,4})\s*$/;

export function parseRules(text: string): Rule[] {
  const rules: Rule[] = [];
  text
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, " ")
    .split(/\r?\n/)
    .forEach((raw) => {
      const m = raw.match(LINE);
      if (m) rules.push({ id: rules.length, from: m[1], to: m[2], name: m[3].replace(/\s+/g, " ").trim(), orgz: m[4], line: raw.trim() });
    });
  return rules;
}

/** Name falls into range if name >= from and name's prefix (length of "to") <= to. */
export function inRange(lastName: string, r: Rule) {
  const n = norm(lastName);
  if (!n) return false;
  const f = norm(r.from), t = norm(r.to);
  return n >= f && n.slice(0, t.length) <= t;
}

export function findMatch(lastName: string, rules: Rule[]) {
  return rules.find((r) => inRange(lastName, r)) ?? null;
}
