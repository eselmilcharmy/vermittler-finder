# Vermittler Finder

Create a clean, modern single-page web application (React + Tailwind CSS) called "Vermittler-Zuordnungs-Tool". The app runs 100% client-side so it can easily be hosted on GitHub Pages.

### Primary Purpose:

Parse raw text dumps from intranet/SharePoint routing tables (alphabetical ranges) and automatically match a person's name to their assigned Vermittler (case manager), providing a visual explanation of the match logic.

---

### UI & Layout Requirements:

1. **Header & Preset Action:**

   - App title: "Vermittler-Zuordnung & Analyse"

   - Button: "Beispieldaten laden" (loads 'Hermann Peschke' and the default SharePoint text dump into the inputs for quick testing).

2. **Input Section (Two Grid Columns or Form Cards):**

   - **Person Input:**

     - First Name (Vorname) field

     - Last Name (Nachname) field (e.g. "Peschke")

   - **Data Dump Input:**

     - Large Textarea for pasting raw intranet text containing ranges, names, and team numbers (OrgZ).

3. **Parser & Matching Logic:**

   - Automatically extract rules from the text dump using regex patterns matching standard routing tables:

     - Pattern example: `[Range] [Vermittler Name] [OrgZ]` (e.g., `Popb - Ried   Bauer, Petra   171` or `L - Leom   Chasan, Refika   171`).

   - Alphabetical comparison: Match the input person's last name against the range prefixes (case-insensitive, handling variable range lengths).

4. **Results & Graphical Explanation (Visual Breakdown):**

   - **Primary Match Card:**

     - Large, clear badge showing the assigned Vermittler name and Team/OrgZ (e.g. "Bauer, Petra — Team 171").

     - Exact matching range found (e.g. `Popb` bis `Ried`).

   - **Visual Alphabetical Timeline / List View:**

     - Render an interactive, styled list of ALL parsed ranges extracted from the dump.

     - Highlight the **active matching range** with a distinct color (e.g. green border + glow).

     - Show an inline callout badge indicating where the entered last name sits alphabetically (e.g. `Popb` ➔ **[Peschke]** ➔ `Ried`).

     - Allow filtering or searching within the parsed list.

5. **Sample Preset Data:**

   Pre-load the following default data when clicking "Beispieldaten laden":

   - **Vorname:** Hermann

   - **Nachname:** Peschke

   - **Text-Dump:**

"""
 Zum Hauptinhalt wechseln

Animationen deaktivieren

SharePoint      

 

 

 

Ramovic Alida  

Social Intranet

arbeitsagentur.de

Dienststellen

Datenschutz

Logo der Bundesagentur für Arbeit

Suche in Portal + FAQ SGB III

 

 

Portal + FAQ SGB III

DIP

FAQ SGB III

GLF & EMB-AH

Aufgabensteckbriefe für die Eingangszonen

Gesprächsleitfäden / Arbeitshilfen für die Eingangszonen

Gesprächsleitfäden für die Service Center SGB III

E-Mail-Bearbeitung im Kundenportal SGB IIII

Klickdummys

Arbeitslosengeld Online

"BA-mobil" App

Clever-Klicker

Gründungszuschuss

OASU & OALO

Veränderungsmitteilungen SGB III

Widerspruch Online

Zusätzliche Hilfen

Kernaufgaben Operativer Service

SGB III - Sozialgesetzbuch (SGB) Drittes Buch (III)

Überweisungsplan Alg 2026

Kundenportal

SGB III

Bayern

München

Zuordnungskriterien akademische und gehobene kaufmännische Arbeitsvermittlung Agentur für Arbeit München

Zuordnungskriterien akademische und gehobene kaufmännische Arbeitsvermittlung Agentur für Arbeit MünchenIntranet der Bundesagentur für Arbeit

druckenempfehlenStanddatum:08.10.2026

Bayern

Ansbach – Weißenburg

Aschaffenburg

Augsburg

Bamberg – Coburg

Bayreuth – Hof

Deggendorf

Donauwörth

Freising

Fürth

Ingolstadt

Kempten – Memmingen

Landshut – Pfarrkirchen

München(Zurzeit ausgewählt)

Arbeitgeber-Service

Dienstleistungskatalog

Führungskräfte

Jobcenter

Regionale Besonderheiten

Servicerufnummern

Terminierung

Zuordnung Bewerberbetreuer

Nürnberg

Passau

Regensburg

Rosenheim

Schwandorf

Schweinfurt

Traunstein

Weiden

Weilheim

Würzburg

​​​​​​​​​​​​Erstgespräche/ -beratungen: 60 Minuten​

 

Hinweis zur akademischen bzw. gehoben kaufmännischen Zuordnung:

 

KundInnen mit Hochschul- oder Fachhochschulabschluss

KundInnen mit Jahreseinkommen ab 80.000 € + mind. 5-jährige Führungserfahrung + Verantwortung für mind. 15 MitarbeiterInnen

DKZ​ 613, 634, 711-714, 721, 731-732, 833, 841-845, 911-914, 921-924

Folgende DKZ​ werden unabhängig vom Ausbildungshintergrund durch Team 123 betreut: 715, 722, 723, 733

KünstlerInnen werden durch Team 122 betreut: 933, 941-946

Prüfung NICHT akademische/gehoben kaufmännische KundInnen:

 

Zuletzt mehr als zwölf Monate berufsfremd „nicht-akademisch“ tätig und keine Zugehörigkeit zu oben genannten DKZ​ > Zuordnung allgemeinen AV​ nach letzter DKZ​​

​ Teams: 124, 171

 

Anfangsbuchstabe Nachname   Name, Vorname           OrgZ​

Aa-Arf  Mitskanets, Galina        124

Arg-Berh          Buch, Thomas  124

Beri-Bur            Dr. Vogtländer, Anna    124

Bus-Dan           Stelzer, Andre   124

Dao-Des           Schwalber, Carla          124

Det-Ert Ludwig, Beatrice           124

Eru-Gal Maier-Contino, Maria    124

Gam-Gra          Schießl, Christine         124

Grb-Hein          Krämer, Sebastian        124

Heio-Hub          Schied, Franziska         124

Huc-Kat            Blömken, Sandra          124

Kau-Kna           Hasanbegovic, Vanesa 124

Knb-Kre            Amba Assam, Rima      124

Krf-Kz   Nieße, Agnes    124

L - Leom           Chasan, Refika 171

Leon - Mahm    Wolf, Martin      171

Mahn - Mat       Boezio, Jessica 171

Mau - Mulla      Lutz, Elisabeth  171

Mullb - Osm      Liavvas, Rafaela           171

Osn - Popa       Frey, Nikol        171

Popb - Ried      Bauer, Petra     171

Riee - Schac     Stassinopoulou, Anastasia        171

Schad - Schuk  Meißner, Nina   171

Schul - Sic        Rechl, Maximilian          171

Sid - Ste           Bremer, Veith   171

Stf - Ts Mehlhorn, Lutz  171

Tt - Wag           Anand, Katrin   171

Wah - Wi          Reil, Harald      171

Wj - Z   Bacher, Ulrike   171

"""

---

### Tech Stack & GitHub Compatibility:

- Plain React, Lucide Icons, Tailwind CSS.

- No external server or database required.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9d8f44db-40d5-5846-964d-f450e72e6a64).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
