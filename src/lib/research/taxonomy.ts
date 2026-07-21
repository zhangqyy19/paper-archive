// A curated taxonomy of standardized research topics.
//
// Notebooks store a topic's stable `id` (not free text), so notebooks about the
// same subject resolve to the same category and the same data sources. The UI
// offers autocomplete over this list; users pick a suggestion rather than
// inventing inconsistent names.
//
// Each topic carries provider "routing" hints kept deliberately generic:
//  - `query`     : a keyword string for keyword-based APIs (Crossref, news).
//  - `arxiv`     : arXiv category codes (e.g. 'cs.LG') when the field maps to
//                  arXiv, so the papers/publications provider can target them.
// Adding a topic here immediately makes it selectable and searchable — no UI or
// provider code changes required.

export interface TopicDef {
  id: string
  label: string
  /** A short group heading for grouped suggestions (e.g. "Computer Science"). */
  group: string
  /** Extra search terms so typing a synonym still surfaces the topic. */
  aliases?: string[]
  /** Keyword query used by keyword-based providers. Defaults to `label`. */
  query?: string
  /** arXiv category codes this topic maps to, if any. */
  arxiv?: string[]
}

export const TOPICS: readonly TopicDef[] = [
  // ---- Computer Science ----
  { id: 'machine-learning', label: 'Machine Learning', group: 'Computer Science', aliases: ['ml', 'deep learning', 'neural networks'], arxiv: ['cs.LG', 'stat.ML'] },
  { id: 'machine-vision', label: 'Machine Vision', group: 'Computer Science', aliases: ['computer vision', 'image recognition'], arxiv: ['cs.CV'] },
  { id: 'artificial-intelligence', label: 'Artificial Intelligence', group: 'Computer Science', aliases: ['ai'], arxiv: ['cs.AI'] },
  { id: 'natural-language-processing', label: 'Natural Language Processing', group: 'Computer Science', aliases: ['nlp', 'language models', 'llm'], arxiv: ['cs.CL'] },
  { id: 'robotics', label: 'Robotics', group: 'Computer Science', arxiv: ['cs.RO'] },
  { id: 'cryptography', label: 'Cryptography & Security', group: 'Computer Science', aliases: ['security', 'crypto'], arxiv: ['cs.CR'] },
  { id: 'distributed-systems', label: 'Distributed Systems', group: 'Computer Science', aliases: ['systems'], arxiv: ['cs.DC'] },

  // ---- Physics & Astronomy ----
  { id: 'astrophysics', label: 'Astrophysics', group: 'Physics & Astronomy', aliases: ['astronomy', 'cosmology'], arxiv: ['astro-ph'] },
  { id: 'quantum-physics', label: 'Quantum Physics', group: 'Physics & Astronomy', aliases: ['quantum'], arxiv: ['quant-ph'] },
  { id: 'condensed-matter', label: 'Condensed Matter Physics', group: 'Physics & Astronomy', arxiv: ['cond-mat'] },
  { id: 'high-energy-physics', label: 'High Energy Physics', group: 'Physics & Astronomy', aliases: ['particle physics'], arxiv: ['hep-ph', 'hep-th'] },

  // ---- Mathematics ----
  { id: 'mathematics', label: 'Mathematics', group: 'Mathematics', aliases: ['math'], arxiv: ['math.GM'] },
  { id: 'statistics', label: 'Statistics', group: 'Mathematics', aliases: ['stats'], arxiv: ['stat.TH'] },

  // ---- Engineering ----
  { id: 'mechanical-engineering', label: 'Mechanical Engineering', group: 'Engineering', aliases: ['mechanics'] },
  { id: 'electrical-engineering', label: 'Electrical Engineering', group: 'Engineering', arxiv: ['eess.SY'] },
  { id: 'signal-processing', label: 'Signal Processing', group: 'Engineering', arxiv: ['eess.SP'] },

  // ---- Life Sciences & Medicine ----
  { id: 'biology', label: 'Biology', group: 'Life Sciences', aliases: ['life sciences'], arxiv: ['q-bio'] },
  { id: 'genetics', label: 'Genetics & Genomics', group: 'Life Sciences', aliases: ['genomics', 'dna'] },
  { id: 'neuroscience', label: 'Neuroscience', group: 'Life Sciences', aliases: ['brain', 'neurons'], arxiv: ['q-bio.NC'] },
  { id: 'medicine', label: 'Medicine & Health', group: 'Life Sciences', aliases: ['health', 'clinical', 'medical'] },

  // ---- Social Sciences ----
  { id: 'politics', label: 'Politics', group: 'Social Sciences', aliases: ['political news', 'government'] },
  { id: 'political-science', label: 'Political Science', group: 'Social Sciences' },
  { id: 'public-policy', label: 'Public Policy', group: 'Social Sciences', aliases: ['policy'] },
  { id: 'international-relations', label: 'International Relations', group: 'Social Sciences', aliases: ['geopolitics', 'foreign affairs'] },
  { id: 'economics', label: 'Economics', group: 'Social Sciences', aliases: ['economy'], arxiv: ['econ.GN'] },
  { id: 'sociology', label: 'Sociology', group: 'Social Sciences' },
  { id: 'psychology', label: 'Psychology', group: 'Social Sciences', aliases: ['mind', 'behavior'] },

  // ---- Environment ----
  { id: 'climate', label: 'Climate & Environment', group: 'Environment', aliases: ['climate change', 'environment', 'sustainability'] },
  { id: 'energy', label: 'Energy', group: 'Environment', aliases: ['renewables', 'clean energy'] },

  // ---- Business & Finance ----
  { id: 'finance', label: 'Finance', group: 'Business & Finance', aliases: ['markets', 'investing'], arxiv: ['q-fin.GN'] },
  { id: 'business', label: 'Business & Management', group: 'Business & Finance', aliases: ['management', 'startups'] },

  // ---- Humanities ----
  { id: 'philosophy', label: 'Philosophy', group: 'Humanities' },
  { id: 'history', label: 'History', group: 'Humanities' },
  { id: 'literature', label: 'Literature', group: 'Humanities', aliases: ['literary studies'] },
]

const TOPIC_MAP = new Map(TOPICS.map((t) => [t.id, t]))

/** Look up a topic definition by its stable id. */
export function getTopicDef(id: string): TopicDef | undefined {
  return TOPIC_MAP.get(id)
}

/** The keyword query a provider should use for a topic id. */
export function topicQuery(id: string): string {
  const def = TOPIC_MAP.get(id)
  return def?.query ?? def?.label ?? id
}

/**
 * Lowercased keyword set for a topic (label words + query words + aliases),
 * used to check whether a fetched item is actually about the topic. Short
 * words (< 4 chars, e.g. "of") are dropped so they don't match noise.
 */
export function topicKeywords(id: string): string[] {
  const def = TOPIC_MAP.get(id)
  if (!def) return []
  const raw = [def.label, def.query ?? '', ...(def.aliases ?? [])]
  const words = new Set<string>()
  for (const phrase of raw) {
    const p = phrase.trim().toLowerCase()
    if (!p) continue
    // Keep the full phrase (for multi-word matches like "machine learning")…
    if (p.length >= 3) words.add(p)
    // …and its individual significant words.
    for (const w of p.split(/\s+/)) {
      if (w.length >= 4) words.add(w)
    }
  }
  return [...words]
}

/** arXiv category codes for a topic id (empty if it doesn't map to arXiv). */
export function topicArxivCats(id: string): string[] {
  return TOPIC_MAP.get(id)?.arxiv ?? []
}

export interface TopicMatch {
  topic: TopicDef
  /** Character index in `label` where the query matched, or -1 (alias hit). */
  matchStart: number
  matchLength: number
}

/**
 * Rank topics against a query for autocomplete. Prefers label prefix matches,
 * then label substring matches, then alias matches. Returns match position in
 * the label so the UI can highlight it (alias-only hits report -1).
 */
export function searchTopics(query: string, limit = 8): TopicMatch[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const scored: { m: TopicMatch; score: number }[] = []
  for (const topic of TOPICS) {
    const label = topic.label.toLowerCase()
    const idx = label.indexOf(q)
    if (idx === 0) {
      scored.push({ m: { topic, matchStart: idx, matchLength: q.length }, score: 0 })
    } else if (idx > 0) {
      scored.push({ m: { topic, matchStart: idx, matchLength: q.length }, score: 1 })
    } else if (topic.aliases?.some((a) => a.toLowerCase().includes(q))) {
      scored.push({ m: { topic, matchStart: -1, matchLength: 0 }, score: 2 })
    }
  }

  scored.sort((a, b) => a.score - b.score || a.m.topic.label.localeCompare(b.m.topic.label))
  return scored.slice(0, limit).map((s) => s.m)
}