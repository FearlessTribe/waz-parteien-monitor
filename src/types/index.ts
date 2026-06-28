export interface SentimentResult {
  label: "positive" | "negative" | "neutral" | "mixed" | string;
  score: number;
}

export interface PartyMention {
  party: string;
  alias: string;
  field: string;
  sentence: string;
  char_offset: number;
  sentiment: SentimentResult | null;
  sentiment_context?: string | null;
}

export type SentimentLabel = "positive" | "negative" | "neutral" | "mixed";
export type ImpactForParty =
  | "very_positive"
  | "positive"
  | "slightly_positive"
  | "neutral"
  | "slightly_negative"
  | "negative"
  | "very_negative"
  | "mixed";

export interface TargetedSignal {
  dimension: string;
  sub_signal: string;
  polarity: "positive" | "negative";
  intensity: number;
  attribution: string;
  section: string;
  text: string;
}

export interface TargetedEvidence {
  text: string;
  section: string;
  polarity: string;
  weight: number;
}

export interface DetectedParty {
  party_id: string;
  party_name: string;
  mentioned: boolean;
  matched_terms: string[];
  matched_politicians: string[];
  relevance: number;
  mention_count: { title: number; subtitle: number; summary: number; body: number; total: number };
  sentiment_score: number;
  sentiment_label: SentimentLabel;
  impact_for_party: ImpactForParty;
  main_frame: string;
  signals: TargetedSignal[];
  evidence: TargetedEvidence[];
  reasoning_short: string;
  confidence: number;
}

export interface TargetedSentimentResult {
  article_id: string;
  source?: string;
  detected_parties: DetectedParty[];
  overall_article_topic?: string;
  processing_notes?: {
    uses_external_knowledge: boolean;
    ambiguous_matches: string[];
    warnings: string[];
  };
}

export interface ArticlePortrayal {
  label: string;
  score: number;
  sentiment_score?: number;
  impact_for_party?: ImpactForParty | string;
  relevance?: number;
  confidence?: number;
  main_frame?: string;
  reasoning_short?: string;
  evidence_sentences?: string[];
  mention_breakdown?: Record<string, number>;
  method?: string;
  signals?: TargetedSignal[];
  evidence?: TargetedEvidence[];
}

export interface PartySummaryEntry {
  mention_count: number;
  dominant_sentiment: string | null;
  scores: Array<{ label: string; score: number; sentiment_score?: number; context?: string }>;
  article_portrayal?: ArticlePortrayal | null;
  targeted_sentiment?: DetectedParty | null;
}

export interface PartyAnalysis {
  has_party_mention: boolean;
  parties_mentioned: string[];
  mentions: PartyMention[];
  party_summary: Record<string, PartySummaryEntry>;
  targeted_sentiment?: TargetedSentimentResult | null;
}

export interface Article {
  url: string;
  title: string | null;
  publishing_date: string | null;
  authors: string[];
  topics: string[];
  summary: string | null;
  sections: unknown[];
  plaintext: string | null;
  party_analysis: PartyAnalysis;
}

export interface PollResult {
  party: string;
  value: number;
  available: boolean;
}

export interface PollData {
  source: string;
  sourceUrl: string;
  institute: string;
  commissioner: string;
  publishedAt: string;
  surveyPeriodStart: string;
  surveyPeriodEnd: string;
  surveyedPersons: number;
  method: string;
  results: PollResult[];
  note?: string;
}

export type SentimentClass = "positiv" | "neutral" | "negativ" | "gemischt";

export interface PartyStats {
  party: string;
  mentionCount: number;
  mentionShare: number;
  pollValue: number | null;
  pollAvailable: boolean;
  visibilityGap: number | null;
  avgSentimentScore: number | null;
  sentimentLabel: SentimentLabel | null;
  sentimentClass: SentimentClass | null;
  impactForParty: ImpactForParty | null;
  avgConfidence: number | null;
  articlesWithSentiment: number;
  trendMentions: number | null;
  trendSentiment: number | null;
}

export interface ArticleRef {
  url: string;
  title: string;
  date: string;
  sentimentScore: number | null;
  sentimentLabel: SentimentLabel | null;
  impactForParty: ImpactForParty | null;
  reasoningShort: string | null;
  mentionCount: number;
  section: string;
  signals: TargetedSignal[];
}

export interface PartyDetail {
  party: string;
  mentionCount: number;
  pollValue: number | null;
  avgSentimentScore: number | null;
  sentimentLabel: SentimentLabel | null;
  impactForParty: ImpactForParty | null;
  topSources: Array<{ name: string; count: number }>;
  keyArticles: ArticleRef[];
  positiveArticles: ArticleRef[];
  negativeArticles: ArticleRef[];
  topSignals: Array<{ sub_signal: string; count: number; polarity: string }>;
  topTerms: Array<{ term: string; count: number }>;
  sentimentTimeline: Array<{ date: string; sentimentScore: number; mentions: number }>;
}

export interface DashboardKPIs {
  articleCount: number;
  articlesWithPartyMentions: number;
  articlesWithTargetedSentiment: number;
  sourceCount: number;
  periodLabel: string;
  lastCrawlDate: string | null;
  topMentionParty: string | null;
  mostPositiveParty: string | null;
  mostNegativeParty: string | null;
}

export interface TimelinePoint {
  date: string;
  [party: string]: string | number;
}

export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";

/** Default period when opening the dashboard */
export const DEFAULT_DATE_PRESET: DateRangePreset = "90d";

export interface DateRange {
  preset: DateRangePreset;
  start: Date;
  end: Date;
}

export interface DashboardData {
  articles: Article[];
  polls: PollData;
  lastUpdated: string | null;
}
