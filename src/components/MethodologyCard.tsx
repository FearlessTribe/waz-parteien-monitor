import type { PollData } from "@/types";
import { PARTY_ALIASES_DOC } from "@/lib/parties";
import { formatDateDE } from "@/lib/format";

interface Props {
  polls: PollData;
  referenceDateLabel?: string | null;
}

export function MethodologyCard({ polls, referenceDateLabel }: Props) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-stone-900">Methodik & Datenquellen</h3>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Datenbasis & Crawl
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Artikel stammen von{" "}
            <a
              href="https://www.waz.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-800 underline decoration-stone-300 hover:decoration-stone-600"
            >
              waz.de
            </a>{" "}
            und werden mit Fundus (NewsMap, Monats-Archiv-Sitemap) gecrawlt; optional ergänzt
            Common Crawl News (CC-NEWS) Lücken in der Archivabdeckung. Alle Artikel liegen in{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">data/articles.jsonl</code>, das
            Dashboard lädt den Export{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">public/articles.json</code> (
            <code className="rounded bg-stone-100 px-1 text-xs">npm run export-data</code>). Die
            KPI „Gecrawlte Artikel“ zählt alle Artikel im gewählten Zeitraum; Partei-Charts und
            Sentiment nutzen nur Artikel mit mindestens einer Parteierwähnung (entspricht{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">articles_with_parties.jsonl</code>
            ).
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Zeitraum & Stichtag
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Die Filter oben (Letzter Tag, 7 / 30 Tage, 3 Monate, benutzerdefiniert) beziehen sich
            nicht auf das heutige Datum, sondern auf den <strong>Stichtag</strong>
            {referenceDateLabel ? (
              <> ({referenceDateLabel})</>
            ) : (
              ""
            )}
            : das Veröffentlichungsdatum des neuesten Artikels im Datensatz. „Letzter Tag“ = nur
            dieser Tag; „3 Monate“ = 90 Tage rückwärts bis einschließlich Stichtag. Trends in der
            Parteientabelle vergleichen den gewählten Zeitraum mit dem unmittelbar vorherigen
            Intervall gleicher Länge.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Parteierkennung
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Zehn Parteien werden per Alias-Matching mit Wortgrenzen in Titel, Summary und Fließtext
            erkannt (z. B. „Union“ → CDU/CSU, „Grüne“ → GRÜNE). Mehrere Parteien und mehrere
            Erwähnungen pro Artikel sind möglich. Kleine Parteien ohne NRW-Relevanz (z. B. Volt,
            Die PARTEI) sind bewusst nicht im Monitor.
          </p>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs font-medium text-stone-500 hover:text-stone-700">
              Alias-Übersicht anzeigen
            </summary>
            <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-stone-500">
              {Object.entries(PARTY_ALIASES_DOC).map(([party, aliases]) => (
                <li key={party} className="mt-1">
                  <span className="font-medium text-stone-700">{party}:</span>{" "}
                  {aliases.join(", ")}
                </li>
              ))}
            </ul>
          </details>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Targeted Sentiment
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Regelbasierte, deterministische Bewertung pro Partei und Artikel (kein ML-Modell): der
            gesamte Text wird segmentiert und gewichtet (Titel ×3, Summary ×2, Zwischenüberschriften
            ×1,5, Fließtext ×1). Ein Signal-Katalog über sieben Dimensionen (Wahl, Kompetenz,
            Integrität, Politik, Resonanz, Relation, Framing) liefert Belege mit Attribution
            (Fakt, Vorwurf, Gegner-Zitat). Daraus entstehen Score (−100 bis +100), Label, Impact
            und eine Kurzbegründung. Parteien, die nur als Kritikerin auftreten ohne negatives
            Eigenimage, werden neutral gewertet. In der Detailansicht sind Signale und
            Schlüsselartikel einsehbar.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            NRW-Umfragewerte
          </h4>
          <dl className="mt-2 space-y-1 text-sm text-stone-600">
            <div className="flex gap-2">
              <dt className="font-medium text-stone-700">Quelle:</dt>
              <dd>
                <a
                  href={polls.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-800 underline decoration-stone-300 hover:decoration-stone-600"
                >
                  {polls.institute} ({polls.commissioner}) via {polls.source}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-stone-700">Stand:</dt>
              <dd>{formatDateDE(polls.publishedAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-stone-700">Befragung:</dt>
              <dd>
                {formatDateDE(polls.surveyPeriodStart)} – {formatDateDE(polls.surveyPeriodEnd)} ·
                n = {polls.surveyedPersons.toLocaleString("de-DE")} · {polls.method}
              </dd>
            </div>
          </dl>
          {polls.note && (
            <p className="mt-2 rounded-md border border-amber-100 bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
              {polls.note}
            </p>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Hinweis zur Interpretation
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Medienerwähnungen sind kein Indikator für Zustimmung oder Wahlabsicht. Der Medienanteil
            ist der Anteil einer Partei an allen Parteierwähnungen im Zeitraum; die
            Sichtbarkeitslücke (Medienanteil − Umfragewert in Prozentpunkten) zeigt relative Über-
            oder Unterrepräsentation gegenüber der Sonntagsfrage. Sentiment-Scores messen die
            mediale Darstellung in WAZ-Artikeln, nicht die öffentliche Meinung. Bei wenigen
            Erwähnungen sind Mittelwerte und Trends statistisch unsicher.
          </p>
        </div>
      </div>
    </section>
  );
}
