import type { ResearchProvider } from './provider'
import { AggregateProvider } from './aggregateProvider'
import { ArxivProvider } from './providers/arxiv'
import { CrossrefProvider } from './providers/crossref'
import { NewsProvider } from './providers/news'

// Single swap point for the whole app's research data layer.
//
// `getResearchProvider()` returns the ResearchProvider the dashboard talks to.
// Today it aggregates real, free, no-key sources:
//   • Google News RSS  → Latest News        (via CORS proxy, degrades to [])
//   • arXiv            → Recent Papers        (STEM topics)
//   • Crossref         → Recent Publications  (cross-domain scholarly metadata)
//   • Trending          → derived from news titles by the aggregator
//
// To add a source later (Nature, PubMed, OpenAlex, IEEE, government datasets…):
//   1. implement ResearchProvider in providers/<name>.ts
//   2. add it to the PROVIDERS array below
// The dashboard consumes normalized items and never changes.
//
// The file keeps its historical name so existing imports don't churn; it is now
// a provider registry rather than a mock. (The AggregateProvider already
// degrades to empty sections offline, giving elegant empty states without any
// synthetic data.)

function buildProvider(): AggregateProvider {
  return new AggregateProvider([
    new NewsProvider(),
    new ArxivProvider(),
    new CrossrefProvider(),
  ])
}

let instance: AggregateProvider | null = null

export function getResearchProvider(): ResearchProvider {
  if (!instance) instance = buildProvider()
  return instance
}

/**
 * Drop cached results and hand back the provider, so the dashboard's manual
 * refresh forces a fresh fetch from every source.
 */
export function refreshResearchProvider(): ResearchProvider {
  if (!instance) instance = buildProvider()
  instance.clearCache()
  return instance
}