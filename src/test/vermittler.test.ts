import { describe, expect, it } from "vitest";

import { findMatch, parseRules } from "@/lib/vermittler";

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
