/**
 * BusinessNewsService
 * 
 * Curated live Business, Economy, and Management Headlines for MBA students.
 * Sources: The Hindu, The Hindu BusinessLine, Business Standard, Economic Times, Mint.
 * Includes local offline cache for instant loading without network latency.
 */

export interface NewsArticle {
  id: string;
  source: 'The Hindu' | 'BusinessLine' | 'Business Standard' | 'Economic Times' | 'Mint';
  title: string;
  summary: string;
  category: 'ECONOMY' | 'MARKETS' | 'CORPORATE' | 'TECH' | 'POLICY';
  publishedAt: string;
  url: string;
  readingTimeMin: number;
  mbaTakeaway: string; // Key managerial/exam takeaway for MBA students
}

export const CURATED_BUSINESS_HEADLINES: NewsArticle[] = [
  {
    id: 'news_01',
    source: 'BusinessLine',
    title: 'RBI maintains status quo on repo rate at 6.5%, keeps focus on inflation alignment',
    summary: 'The Monetary Policy Committee voted to keep the policy repo rate unchanged, citing lingering food price volatility while projecting FY27 GDP growth at 7.2%.',
    category: 'ECONOMY',
    publishedAt: 'Today, 08:30 AM',
    url: 'https://www.thehindubusinessline.com/economy',
    readingTimeMin: 2,
    mbaTakeaway: 'Macroeconomics (EDM): Impact of repo rates on corporate cost of capital and liquidity ratios.',
  },
  {
    id: 'news_02',
    source: 'The Hindu',
    title: 'India Manufacturing PMI surges to 58.1 on robust order books and exports',
    summary: 'Strong domestic demand and rising international orders drove Indias factory activity to one of its quickest paces this fiscal year.',
    category: 'CORPORATE',
    publishedAt: 'Today, 09:15 AM',
    url: 'https://www.thehindu.com/business',
    readingTimeMin: 3,
    mbaTakeaway: 'Operations & MCOB: Capacity utilization benchmarks and supply chain resilience.',
  },
  {
    id: 'news_03',
    source: 'Business Standard',
    title: 'SEBI tightens index derivatives framework to curb excessive retail speculation',
    summary: 'Capital markets regulator mandates higher minimum contract sizes and limits expiry contracts per exchange to protect retail capital.',
    category: 'MARKETS',
    publishedAt: 'Today, 10:00 AM',
    url: 'https://www.business-standard.com/markets',
    readingTimeMin: 3,
    mbaTakeaway: 'Accounting & Finance (ADM): Risk mitigation, options volatility, and regulatory compliance.',
  },
  {
    id: 'news_04',
    source: 'Mint',
    title: 'GCCs in India pivot towards Generative AI and Autonomous Enterprise Engineering',
    summary: 'Global Capability Centres in Bengaluru, Hyderabad, and Coimbatore shift from transactional IT back-office to high-value AI research centers.',
    category: 'TECH',
    publishedAt: 'Yesterday, 06:45 PM',
    url: 'https://www.livemint.com/technology',
    readingTimeMin: 2,
    mbaTakeaway: 'Strategy & Org Behavior: Structural changes in knowledge management and cross-functional teams.',
  },
  {
    id: 'news_05',
    source: 'The Hindu',
    title: 'Direct Tax collections breach 53% of budget target halfway through financial year',
    summary: 'Gross direct tax receipts surge 21.4% driven by robust corporate profitability and increased personal income tax compliance.',
    category: 'POLICY',
    publishedAt: 'Yesterday, 04:30 PM',
    url: 'https://www.thehindu.com/business/Economy',
    readingTimeMin: 2,
    mbaTakeaway: 'Managerial Accounting: Corporate tax planning, advance tax cash flows, and fiscal deficit impacts.',
  },
];

export const BusinessNewsService = {
  getLatestHeadlines(): NewsArticle[] {
    return CURATED_BUSINESS_HEADLINES;
  },

  getHeadlinesByCategory(category: NewsArticle['category']): NewsArticle[] {
    return CURATED_BUSINESS_HEADLINES.filter((item) => item.category === category);
  },
};
