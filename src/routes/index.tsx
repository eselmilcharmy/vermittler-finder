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
  const prev = rules[idx - 1];
  const cur = rules[idx]!;
  const next = rules[idx + 1];
  const card = (r: Rule, label: string, text: string, role: RangeRole) => (
    <div
      className={`flex-1 rounded-xl border p-4 ${role === "current" ? "range-active" : ""}`}
      style={role === "current" ? undefined : {
        borderColor: roleColors[role],
        backgroundColor: role === "previous" ? "oklch(0.97 0.04 92)" : "oklch(0.97 0.03 25)",
      }}
    >
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
        {prev && card(prev, "Davor · gelb", `Bis einschließlich „${prev.to}“`, "previous")}
        {prev && <ArrowRight className="mx-auto h-5 w-5 shrink-0 rotate-90 md:rotate-0" style={{ color: roleColors.previous }} />}
        {card(cur, "Zuständig · grün", `Ab einschließlich „${cur.from}“ bis einschließlich „${cur.to}“; „${nachname}“ liegt hier`, "current")}
        {next && <ArrowRight className="mx-auto h-5 w-5 shrink-0 rotate-90 md:rotate-0" style={{ color: roleColors.next }} />}
        {next && card(next, "Danach · rot", `Ab einschließlich „${next.from}“`, "next")}
      </div>
      <SpinWheel rules={rules} idx={idx} nachname={nachname} />
    </div>
  );
}

const ABC = "abcdefghijklmnopqrstuvwxyz".split("");
const roleColors = {
  previous: "oklch(0.88 0.16 92)",
  current: "var(--success)",
  next: "var(--destructive)",
} as const;
type RangeRole = keyof typeof roleColors;

function owners(key: string, rules: Rule[]) {
  const k = key.length;
  return rules.filter((r) => norm(r.from).slice(0, k) <= key && key <= norm(r.to).slice(0, k));
}

function SpinWheel({ rules, idx, nachname }: { rules: Rule[]; idx: number; nachname: string }) {
  const name = norm(nachname);
  const levels = Math.max(1, Math.min(name.length, 6));
  const previous = rules[idx - 1];
  const next = rules[idx + 1];
  const current = rules[idx]!;
  const roles = new Map<number, RangeRole>();
  if (previous) roles.set(previous.id, "previous");
  roles.set(current.id, "current");
  if (next) roles.set(next.id, "next");
  const [visibleLevels, setVisibleLevels] = useState(0);
  useEffect(() => {
    setVisibleLevels(1);
    let timer: number | undefined;
    const revealNext = (level: number) => {
      timer = window.setTimeout(() => {
        const nextLevel = level + 1;
        setVisibleLevels(nextLevel);
        if (nextLevel < levels) revealNext(nextLevel);
      }, 900);
    };
    if (levels > 1) revealNext(1);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [name, idx, levels]);

  const rows = Array.from({ length: visibleLevels }, (_, level) => {
    const prefix = name.slice(0, level);
    const selectedLetter = name[level]!;
    const selectedIndex = ABC.indexOf(selectedLetter);
    const letters = [ABC[selectedIndex - 1], selectedLetter, ABC[selectedIndex + 1]].filter(
      (letter): letter is string => letter !== undefined,
    );
    const rangeLabel = prefix
      ? `${prefix.toUpperCase()}a–${prefix.toUpperCase()}z`
      : "A–Z";

    return {
      level,
      prefix,
      rangeLabel,
      selectedLetter,
      cells: letters.map((letter) => {
        const key = prefix + letter;
        const isSelected = letter === selectedLetter;
        const isBefore = ABC.indexOf(letter) < selectedIndex;
        const candidates = owners(key, rules);
        const owner = isSelected
          ? current
          : candidates.find((rule) => rule.id !== current.id) ?? candidates[0];
        const role = isSelected ? "current" : owner && owner.id !== current.id ? roles.get(owner.id) : undefined;
        const boundaryLabel = isSelected
          ? key.toUpperCase()
          : `${key}${(isBefore ? "z" : "a").repeat(Math.max(1, 3 - key.length))}`.toUpperCase();

        return { key, letter, owner, role, isSelected, boundaryLabel };
      }),
    };
  });
  const legend = [...(previous ? [previous] : []), current, ...(next ? [next] : [])];
  const visiblePrefix = name.slice(0, visibleLevels);
  const displayedRows = [...rows].reverse();
  return (
    <div className="mt-8 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="space-y-3">
        {visibleLevels >= levels && (
          <div className="flex flex-wrap items-baseline justify-between gap-3 rounded-xl border-2 border-success bg-success-soft px-4 py-3" role="status">
            <span className="text-xs font-semibold uppercase text-success">Endgültige Zuordnung · {visiblePrefix.toUpperCase()}</span>
            <span className="font-display text-lg font-bold text-foreground">{current.name}</span>
            <span className="font-mono text-sm text-success">Team {current.orgz}</span>
          </div>
        )}
        {displayedRows.map((row) => (
          <section
            key={row.level}
            className="rounded-xl border border-border bg-background p-4"
            style={{ animation: row.level === visibleLevels - 1 ? "drill-focus 500ms ease-out both" : undefined }}
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="font-display text-sm font-semibold text-foreground">
                Ebene {row.level + 1}: {row.rangeLabel}
              </h4>
              <span className="font-mono text-xs text-muted-foreground">
                Gesucht: {row.prefix.toUpperCase()}{row.selectedLetter.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {row.cells.map((cell) => (
                <div
                  key={cell.key}
                  className={`min-w-0 rounded-lg border p-3 ${cell.isSelected ? "range-active" : "border-border bg-card"}`}
                  style={!cell.isSelected && cell.role ? {
                    borderColor: roleColors[cell.role],
                    backgroundColor: cell.role === "previous" ? "oklch(0.97 0.04 92)" : "oklch(0.97 0.03 25)",
                  } : undefined}
                >
                  <p className="font-mono text-lg font-bold text-foreground">
                    {cell.boundaryLabel}
                    {cell.isSelected && <span className="ml-2 text-xs font-medium text-success">Treffer</span>}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">
                    {cell.owner?.name ?? "Kein Bereich erkannt"}
                  </p>
                  {cell.owner && (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Team {cell.owner.orgz} · {cell.owner.from}–{cell.owner.to}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
        {visibleLevels > 0 && (
          <p className="text-center font-mono text-xs text-muted-foreground">
            {visiblePrefix.length < name.length
              ? `Nächste Ebene wird innerhalb von „${visiblePrefix.toUpperCase()}…“ geöffnet`
              : `Zuordnung bis „${visiblePrefix.toUpperCase()}“ verfeinert`}
          </p>
        )}
      </div>
      <ul className="space-y-1.5 text-sm">
        <li className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Bereichsrollen</li>
        {legend.map((r) => (
          <li key={r.id} className={`flex items-center gap-2 ${r.id === idx ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: roleColors[roles.get(r.id) ?? "current"] }} />
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
