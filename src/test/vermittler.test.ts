import { describe, expect, it } from "vitest";

import { findMatch, parseDkzRules, parseRules } from "@/lib/vermittler";

describe("parseRules", () => {
  it("parses SharePoint rows that inherit a team number from the section", () => {
    const dump = `E-Mail-Bearbeitung im Kundenportal SGB IIII
Zuordnungskriterien Akademiker und gehobene Kaufleute
M (Mitarbeiter) und S (Schutzbefohlene) Kennung:
A-K: Conrad, Jörg
L-Z: Angelova, Biljana
Team: 172
Anfangsbuchstabe Nachname   Name, Vorname
A-Bim   Hoffmann, Hans-Peter
Bin-Cham         Angelova, Biljana
Chan-Fek         Smajic, Sabina
Fel-Gol Günzinger, Petra
Gom-Hoff         Conrad, Jörg
Hofg-Kl Timm, Julia
Km-Lud Masche, Stephanie
Lue-Mon Salmen, Elisabeth
Moo-Per Siemonsen, Daniela
Pes-Rur Gellner, Stefan
Rus-Sok Gärtner, Christine
Sol-Veq Wolf, Josef
Ver-Z Bader,Fabienne`;

    const rules = parseRules(dump);

    expect(rules).toHaveLength(13);
    expect(rules[0]).toMatchObject({
      from: "A",
      to: "Bim",
      name: "Hoffmann, Hans-Peter",
      orgz: "172",
    });
    expect(rules[3]).toMatchObject({
      from: "Fel",
      to: "Gol",
      name: "Günzinger, Petra",
      orgz: "172",
    });
    expect(rules.at(-1)).toMatchObject({
      from: "Ver",
      to: "Z",
      name: "Bader,Fabienne",
      orgz: "172",
    });
    expect(findMatch("Peschke", rules)?.name).toBe("Gellner, Stefan");
  });

  it("prefers a row-specific OrgZ and supports spaced Unicode dashes", () => {
    const rules = parseRules(`Team: 172
A – C  Example, One  123
D — F  Example, Two  456`);

    expect(rules).toHaveLength(2);
    expect(rules.map(({ orgz }) => orgz)).toEqual(["123", "456"]);
  });
});

describe("parseDkzRules", () => {
  it("parses three-digit DKZ rows and matches only within the selected DKZ", () => {
    const dump = `DKZ Anfangsbuchstabe Nachname Name, Vorname OrgZ
011 A-Beta Example, Alpha 123
011 Betb-Derr Example Beta 123
012 A-Z Different Person 124
232 A-M Example, Gamma 122
232 N Example, Delta 121`;

    const rules = parseDkzRules(dump);
    const rulesFor011 = rules.filter((rule) => rule.dkz === "011");
    const rulesFor232 = rules.filter((rule) => rule.dkz === "232");

    expect(rules).toHaveLength(5);
    expect(rules[0]).toMatchObject({
      dkz: "011",
      from: "A",
      to: "Beta",
      name: "Example, Alpha",
      orgz: "123",
    });
    expect(findMatch("Betcman", rulesFor011)?.name).toBe("Example Beta");
    expect(findMatch("Bender", rules.filter((rule) => rule.dkz === "012"))?.name).toBe("Different Person");
    expect(findMatch("Nachmann", rulesFor232)?.name).toBe("Example, Delta");
  });
});
