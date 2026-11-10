export type Rule = {
  id: number;
  from: string;
  to: string;
  name: string;
  orgz: string;
  line: string;
};

export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

const RANGE_LINE = /^([\p{L}]+)\s*[-–—−]\s*([\p{L}]+)\s+(.+?)$/u;
const TEAM_LINE = /^(?:Team|OrgZ)\s*:?\s*(\d{2,4})$/i;
const ROW_ORGZ = /^(.*?)\s+(\d{2,4})$/u;

export function parseRules(text: string): Rule[] {
  const rules: Rule[] = [];
  let sectionOrgz = "";
  const lines = text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u00A0\u202F]/g, " ")
    .split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;

    const teamMatch = line.match(TEAM_LINE);
    if (teamMatch) {
      sectionOrgz = teamMatch[1]!;
      continue;
    }

    const rangeMatch = line.match(RANGE_LINE);
    if (!rangeMatch) continue;

    const [, from = "", to = "", remainder = ""] = rangeMatch;
    const rowOrgzMatch = remainder.match(ROW_ORGZ);
    const name = (rowOrgzMatch?.[1] ?? remainder).trim();
    if (!/\p{L}/u.test(name)) continue;

    rules.push({
      id: rules.length,
      from,
      to,
      name,
      orgz: rowOrgzMatch?.[2] ?? sectionOrgz,
      line: raw.trim(),
    });
  }

  return rules;
}

/** Name falls into range if name >= from and name's prefix (length of "to") <= to. */
export function inRange(lastName: string, r: Rule) {
  const n = norm(lastName);
  if (!n) return false;
  const f = norm(r.from),
    t = norm(r.to);
  return n >= f && n.slice(0, t.length) <= t;
}

export function findMatch(lastName: string, rules: Rule[]) {
  return rules.find((r) => inRange(lastName, r)) ?? null;
}
