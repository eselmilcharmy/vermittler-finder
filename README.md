# Vermittler Finder

Ein clientseitiges Tool zum Parsen alphabetischer Zuordnungsbereiche und zum Anzeigen der passenden Regel.

## Lokal starten

```sh
bun install --frozen-lockfile
bun run dev
```

## GitHub Pages

Der Build rendert die Seiten statisch nach `.output/public`. Der Workflow unter `.github/workflows/pages.yml` baut und veröffentlicht diesen Ordner bei jedem Push auf `main`.

Aktiviere im Repository unter **Settings > Pages** die Veröffentlichung über **GitHub Actions**. Die URL lautet danach `https://<konto>.github.io/<repository>/`.

Die Beispielzuordnung ist anonymisiert. Vor dem Veröffentlichen dürfen keine echten Intranet-Dumps, Namen oder internen Zuordnungen in den Quelldateien stehen.
