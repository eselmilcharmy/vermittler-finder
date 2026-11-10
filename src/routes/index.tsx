import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Database, Search, Sparkles, UserRound, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { parseRules, findMatch, inRange } from "@/lib/vermittler";
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
    setVorname("Hermann");
    setNachname("Peschke");
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
          <input className="field" value={vorname} onChange={(e) => setVorname(e.target.value)} placeholder="z. B. Hermann" />
          <label className="field-label mt-4">Nachname</label>
          <input className="field" value={nachname} onChange={(e) => setNachname(e.target.value)} placeholder="z. B. Peschke" />
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
