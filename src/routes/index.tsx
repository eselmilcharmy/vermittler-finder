import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Database, Search, Sparkles, UserRound, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { parseRules, findMatch, inRange, norm, type Rule } from "@/lib/vermittler";
import { SAMPLE_DUMP } from "@/lib/sample";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vermittler-Zuordnung & Analyse" },
      { name: "description", content: "Ordnet Nachnamen anhand von Intranet-Zuordnungstabellen automatisch dem zuständigen Vermittler zu." },
      { property: "og:title", content: "Vermittler-Zuordnung & Analyse" },
      { property: "og:description", content: "Alphabetische Bereichszuordnung mit visueller Erklärung." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Wheel({ rules, idx, nachname }: { rules: Rule[]; idx: number; nachname: string }) {
  const n = rules.length;
  const at = (o: number) => rules[(idx + o + n) % n]!;
  const prev = at(-1), cur = at(0), next = at(1);
  const card = (r: Rule, label: string, text: string, active = false) => (
    <div className={`flex-1 rounded-xl border p-4 ${active ? "range-active" : "border-border bg-background"}`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-foreground">{r.name}</p>
      <p className="font-mono text-xs text-muted-foreground">Team {r.orgz} · {r.from} – {r.to}</p>
      <p className="mt-2 text-sm text-foreground">{text}</p>
    </div>
  );
  return (
    <div className="mt-6">
      <h3 className="mb-3 font-display text-base font-semibold text-foreground">Übergabe-Rad: wer vorher und wer danach dran ist</h3>
      <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {card(prev, "Davor", `Nimmt alle Namen bis „${prev.to}“`)}
        <ArrowRight className="mx-auto h-5 w-5 shrink-0 rotate-90 text-success md:rotate-0" />
        {card(cur, "Zuständig", `Übernimmt ab „${cur.from}“ bis „${cur.to}“, also auch „${nachname}“`, true)}
        <ArrowRight className="mx-auto h-5 w-5 shrink-0 rotate-90 text-success md:rotate-0" />
        {card(next, "Danach", `Übernimmt ab „${next.from}“`)}
      </div>
      <SpinWheel rules={rules} idx={idx} nachname={nachname} />
    </div>
  );
}

const ABC = "abcdefghijklmnopqrstuvwxyz".split("");
const ruleHue = (i: number, n: number) => (i * 360) / n;

function owners(key: string, rules: Rule[]) {
  const k = key.length;
  return rules.filter((r) => norm(r.from).slice(0, k) <= key && key <= norm(r.to).slice(0, k));
}

function SpinWheel({ rules, idx, nachname }: { rules: Rule[]; idx: number; nachname: string }) {
  const name = norm(nachname);
  const levels = Math.max(1, Math.min(name.length, 4));
  const [spun, setSpun] = useState(false);
  useEffect(() => {
    setSpun(false);
    const t = setTimeout(() => setSpun(true), 50);
    return () => clearTimeout(t);
  }, [name, idx]);
  const C = 260, r0 = 45, w = 52, seg = 360 / 26;
  const pt = (a: number, r: number) => {
    const rad = ((a - 90) * Math.PI) / 180;
    return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
  };
  const arc = (a0: number, a1: number, ri: number, ro: number) => {
    const [x0, y0] = pt(a0, ro), [x1, y1] = pt(a1, ro), [x2, y2] = pt(a1, ri), [x3, y3] = pt(a0, ri);
    return `M${x0},${y0} A${ro},${ro} 0 0 1 ${x1},${y1} L${x2},${y2} A${ri},${ri} 0 0 0 ${x3},${y3} Z`;
  };
  const used = new Set<number>();
  const rings = Array.from({ length: levels }, (_, l) => {
    const prefix = name.slice(0, l);
    const target = ABC.indexOf(name[l] ?? "a");
    const ri = r0 + l * w, ro = ri + w - 2;
    const rot = spun ? 720 + 360 * l - (target + 0.5) * seg : 0;
    return (
      <g key={l} style={{ transform: `rotate(${rot}deg)`, transformOrigin: `${C}px ${C}px`, transition: `transform ${2.5 + l * 0.6}s cubic-bezier(.17,.67,.2,1)` }}>
        {ABC.map((c, i) => {
          const key = prefix + c;
          const own = owners(key, rules);
          const a0 = i * seg, a1 = (i + 1) * seg, hit = i === target;
          const [tx, ty] = pt(a0 + seg / 2, ri + w / 2 - 1);
          return (
            <g key={c}>
              {own.map((r, j) => {
                used.add(r.id);
                const s0 = a0 + (j * seg) / own.length, s1 = a0 + ((j + 1) * seg) / own.length;
                return <path key={r.id} d={arc(s0, s1, ri, ro)} style={{ fill: r.id === idx && hit ? "var(--success)" : `oklch(0.82 0.1 ${ruleHue(r.id, rules.length)})`, stroke: "var(--card)", strokeWidth: 1 }}><title>{`${key.toUpperCase()}…: ${r.name} (${r.from}–${r.to})`}</title></path>;
              })}
              {hit && <path d={arc(a0, a1, ri, ro)} style={{ fill: "none", stroke: "var(--foreground)", strokeWidth: 2 }} />}
              <text x={tx} y={ty} transform={`rotate(${a0 + seg / 2} ${tx} ${ty})`} textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: l === 0 ? 13 : 10, fontFamily: "var(--font-mono)", fontWeight: hit ? 700 : 400, fill: "var(--foreground)", pointerEvents: "none" }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </text>
            </g>
          );
        })}
      </g>
    );
  });
  const legend = rules.filter((r) => used.has(r.id));
  return (
    <div className="mt-8 grid items-center gap-6 md:grid-cols-[1fr_220px]">
      <div className="relative mx-auto w-full max-w-[520px]">
        <div className="wheel-pointer" />
        <svg viewBox="0 0 520 520" className="w-full">
          {rings}
          <circle cx={C} cy={C} r={r0 - 2} style={{ fill: "var(--card)", stroke: "var(--border)" }} />
          <text x={C} y={C} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", fill: "var(--foreground)" }}>
            {name.slice(0, levels).toUpperCase()}
          </text>
        </svg>
      </div>
      <ul className="space-y-1.5 text-sm">
        <li className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Farben = Vermittler</li>
        {legend.map((r) => (
          <li key={r.id} className={`flex items-center gap-2 ${r.id === idx ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: r.id === idx ? "var(--success)" : `oklch(0.82 0.1 ${ruleHue(r.id, rules.length)})` }} />
            <span className="font-mono text-xs">{r.from}–{r.to}</span> {r.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Index() {
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [dump, setDump] = useState("");
  const [filter, setFilter] = useState("");

  const rules = useMemo(() => parseRules(dump), [dump]);
  const match = useMemo(() => (nachname.trim() ? findMatch(nachname, rules) : null), [nachname, rules]);
  const shown = rules.filter((r) =>
    `${r.from} ${r.to} ${r.name} ${r.orgz}`.toLowerCase().includes(filter.toLowerCase()),
  );

  const loadSample = () => {
    setVorname("Test");
    setNachname("Nutzer");
    setDump(SAMPLE_DUMP);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Vermittler-Zuordnungs-Tool</p>
            <h1 className="font-display text-3xl font-bold text-foreground">Vermittler-Zuordnung & Analyse</h1>
          </div>
          <button onClick={loadSample} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90">
            <Sparkles className="h-4 w-4" /> Beispieldaten laden
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_1.4fr]">
        <section className="panel">
          <h2 className="panel-title"><UserRound className="h-4 w-4" /> Person</h2>
          <label className="field-label">Vorname</label>
          <input className="field" value={vorname} onChange={(e) => setVorname(e.target.value)} placeholder="z. B. Test" />
          <label className="field-label mt-4">Nachname</label>
          <input className="field" value={nachname} onChange={(e) => setNachname(e.target.value)} placeholder="z. B. Nutzer" />
        </section>
        <section className="panel">
          <h2 className="panel-title"><Database className="h-4 w-4" /> Text-Dump <span className="ml-auto font-mono text-xs text-muted-foreground">{rules.length} Regeln erkannt</span></h2>
          <textarea className="field h-48 resize-y font-mono text-xs" value={dump} onChange={(e) => setDump(e.target.value)} placeholder="Intranet-/SharePoint-Text hier einfügen…" />
        </section>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-6 pb-16">
        {nachname.trim() && rules.length > 0 && (
          match ? (
            <section className="panel border-success match-glow">
              <p className="flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 className="h-4 w-4" /> Zuordnung gefunden für {vorname} {nachname}</p>
              <div className="mt-3 inline-flex flex-wrap items-baseline gap-3 rounded-xl bg-success-soft px-5 py-4">
                <span className="font-display text-3xl font-bold text-foreground">{match.name}</span>
                <span className="font-mono text-lg text-success">— Team {match.orgz}</span>
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm text-muted-foreground">
                Bereich: <code className="chip">{match.from}</code> bis <code className="chip">{match.to}</code>
              </p>
              <Wheel rules={rules} idx={rules.indexOf(match)} nachname={nachname} />
            </section>
          ) : (
            <section className="panel flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Kein passender Bereich für „{nachname}“ gefunden.</section>
          )
        )}

        {rules.length > 0 && (
          <section className="panel">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="panel-title mb-0">Alphabetische Übersicht</h2>
              <div className="relative ml-auto">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input className="field w-64 pl-9" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Bereich, Name, OrgZ…" />
              </div>
            </div>
            <ol className="space-y-2">
              {shown.map((r) => {
                const active = nachname.trim() !== "" && inRange(nachname, r);
                return (
                  <li key={r.id} className={`range-row ${active ? "range-active" : ""}`}>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <code className="chip">{r.from}</code>
                      {active ? (
                        <>
                          <ArrowRight className="h-3 w-3 text-success" />
                          <span className="rounded-md bg-success px-2 py-0.5 font-bold text-success-foreground">{nachname}</span>
                          <ArrowRight className="h-3 w-3 text-success" />
                        </>
                      ) : <span className="text-muted-foreground">–</span>}
                      <code className="chip">{r.to}</code>
                    </div>
                    <span className="flex-1 font-medium text-foreground">{r.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">OrgZ {r.orgz}</span>
                  </li>
                );
              })}
              {shown.length === 0 && <li className="text-sm text-muted-foreground">Keine Treffer.</li>}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
