/**
 * PlacementMatcherService
 * 
 * Provides semantic vector-style job profile matching, MBA competency gap analysis,
 * and interview preparation advice for PSGIM campus recruitment drives.
 */

export interface CampusJobDrive {
  id: string;
  companyName: string;
  role: string;
  packageLpa: string;
  domain: 'FINANCE' | 'MARKETING' | 'HR' | 'OPERATIONS' | 'CONSULTING' | 'ANALYTICS';
  requiredSkills: string[];
  keyCompetencies: string[];
  sampleInterviewFocus: string[];
}

export interface MatchAnalysisResult {
  matchScore: number; // 0 - 100%
  verdict: 'STRONG_CANDIDATE' | 'COMPETITIVE_WITH_PREP' | 'SUBSTANTIAL_GAP';
  matchedSkills: string[];
  missingSkills: string[];
  recommendedPreparation: string[];
  mockQuestions: string[];
}

export const CAMPUS_COMPANIES: CampusJobDrive[] = [
  {
    id: 'deloitte-consulting',
    companyName: 'Deloitte',
    role: 'Analyst - Strategy & Operations',
    packageLpa: '8.5 - 11.0 LPA',
    domain: 'CONSULTING',
    requiredSkills: [
      'Financial Modeling',
      'Data Analytics',
      'Power BI / Excel',
      'Business Problem Solving',
      'Client Presentation',
    ],
    keyCompetencies: ['Structured Thinking', 'Case Interview Problem Solving', 'Quantitative Analysis'],
    sampleInterviewFocus: [
      'Walk me through a time you synthesized ambiguous market data to make a strategic recommendation.',
      'How would you estimate the market size for EV two-wheelers in Coimbatore?',
      'Explain DCF valuation vs comparable company multiples.',
    ],
  },
  {
    id: 'federal-bank-mt',
    companyName: 'Federal Bank',
    role: 'Management Trainee - Credit & Banking',
    packageLpa: '9.0 - 12.0 LPA',
    domain: 'FINANCE',
    requiredSkills: [
      'Financial Statement Analysis',
      'Working Capital Management',
      'Risk Assessment',
      'Regulatory Compliance (RBI)',
      'Customer Relationship Management',
    ],
    keyCompetencies: ['Credit Appraisal', 'Balance Sheet Ratio Analysis', 'Banking Regulations'],
    sampleInterviewFocus: [
      'How do you assess Debt Service Coverage Ratio (DSCR) for a commercial borrower?',
      'What are the key implications of current RBI repo rate adjustments on retail banking?',
      'How do you evaluate working capital cycles in seasonal businesses?',
    ],
  },
  {
    id: 'zoho-product-marketing',
    companyName: 'Zoho Corporation',
    role: 'Product Marketing Manager (PMM)',
    packageLpa: '7.5 - 9.5 LPA',
    domain: 'MARKETING',
    requiredSkills: [
      'B2B SaaS Positioning',
      'Content Strategy',
      'Market Research',
      'Funnel Analytics',
      'Customer Persona Mapping',
    ],
    keyCompetencies: ['Product Storytelling', 'Competitive Intelligence', 'Go-To-Market Execution'],
    sampleInterviewFocus: [
      'How would you launch a new B2B productivity app against established enterprise players?',
      'Differentiate between CAC (Customer Acquisition Cost) and LTV (Lifetime Value) in SaaS.',
      'Design a 30-day product launch campaign for an AI accounting tool.',
    ],
  },
  {
    id: 'asian-paints-sc',
    companyName: 'Asian Paints',
    role: 'Supply Chain & Operations Manager',
    packageLpa: '8.0 - 10.5 LPA',
    domain: 'OPERATIONS',
    requiredSkills: [
      'Inventory Optimization (EOQ/JIT)',
      'Demand Forecasting',
      'Logistics & Distribution',
      'Quality Management (Six Sigma)',
      'Vendor Negotiations',
    ],
    keyCompetencies: ['Supply Chain Bottleneck Analysis', 'Warehouse Inventory Velocity', 'Linear Programming'],
    sampleInterviewFocus: [
      'How would you mitigate bullwhip effects across retail paint distribution networks?',
      'Explain EOQ and how safety stock levels are determined under demand volatility.',
      'Describe a real-world scenario where you improved process cycle time.',
    ],
  },
  {
    id: 'goldman-sachs-ib',
    companyName: 'Goldman Sachs',
    role: 'Financial Analyst - Global Markets',
    packageLpa: '14.0 - 18.0 LPA',
    domain: 'FINANCE',
    requiredSkills: [
      'Valuation (DCF / LBO / Multiples)',
      'Financial Statement Analysis',
      'Python / Advanced Excel Modeling',
      'Equity & Fixed Income Markets',
      'Derivatives & Hedging Strategies',
    ],
    keyCompetencies: ['Macroeconomic Analysis', 'Quantitative Valuation', 'High-Conviction Pitching'],
    sampleInterviewFocus: [
      'Walk me through the three financial statements and how a ₹100 depreciation expense affects each.',
      'How would you pitch an equity investment in the renewable energy sector today?',
      'Explain the difference between Enterprise Value and Equity Value when debt carries a high coupon.',
    ],
  },
  {
    id: 'amazon-ops',
    companyName: 'Amazon',
    role: 'Operations & Area Manager',
    packageLpa: '11.5 - 15.0 LPA',
    domain: 'OPERATIONS',
    requiredSkills: [
      'Supply Chain Logistics',
      'Six Sigma & Kaizen Process Control',
      'Workforce Capacity Planning',
      'Fulfillment Center Metrics (Pick/Pack/Sort)',
      'Leadership Principles (Customer Obsession, Bias for Action)',
    ],
    keyCompetencies: ['High-Velocity Operational Problem Solving', 'Root-Cause Analysis (5 Whys)', 'People Leadership'],
    sampleInterviewFocus: [
      'Tell me about a time you made a critical decision without complete data.',
      'How would you optimize fulfillment bottleneck when package volume spikes 40% during festival sales?',
      'Walk me through a project where you eliminated waste in an existing workflow.',
    ],
  },
  {
    id: 'titan-marketing',
    companyName: 'Titan Company (Tata Group)',
    role: 'Brand Manager - Lifestyle & Luxury Retail',
    packageLpa: '9.5 - 12.5 LPA',
    domain: 'MARKETING',
    requiredSkills: [
      'Brand Architecture & Positioning',
      'Retail Merchandising & Consumer Insights',
      'Omnichannel Campaign Management',
      'Market Segmentation & Pricing Strategy',
      'Customer Experience & Journey Mapping',
    ],
    keyCompetencies: ['Brand Storytelling', 'Consumer Psychology', 'Visual Merchandising'],
    sampleInterviewFocus: [
      'How would you reposition a heritage luxury product for Gen-Z consumers without diluting brand equity?',
      'What pricing strategy would you adopt when entering Tier-2 and Tier-3 luxury retail markets in Tamil Nadu?',
      'How do you measure ROI on high-budget brand awareness campaigns?',
    ],
  },
];

export const PlacementMatcherService = {
  getAvailableCompanies(): CampusJobDrive[] {
    return CAMPUS_COMPANIES;
  },

  /**
   * Evaluates student profile text/skills against the target company's job description
   */
  evaluateStudentProfile(
    companyId: string,
    studentSkillsText: string,
    specialization: string
  ): MatchAnalysisResult {
    const company = CAMPUS_COMPANIES.find((c) => c.id === companyId) || CAMPUS_COMPANIES[0];
    const textLower = (studentSkillsText + ' ' + specialization).toLowerCase();

    const matched: string[] = [];
    const missing: string[] = [];

    // Analyze skill token coverage
    company.requiredSkills.forEach((skill) => {
      const tokens = skill.toLowerCase().split(/[\s/]+/);
      const isMatch = tokens.some((token) => token.length > 2 && textLower.includes(token));
      if (isMatch) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    // Baseline domain alignment
    const domainMatches = textLower.includes(company.domain.toLowerCase()) || textLower.includes(specialization.toLowerCase());
    const baseWeight = domainMatches ? 25 : 10;
    const skillRatio = matched.length / company.requiredSkills.length;
    const rawScore = Math.round(baseWeight + skillRatio * 75);
    const matchScore = Math.min(Math.max(rawScore, 35), 98);

    let verdict: 'STRONG_CANDIDATE' | 'COMPETITIVE_WITH_PREP' | 'SUBSTANTIAL_GAP' = 'COMPETITIVE_WITH_PREP';
    if (matchScore >= 80) {
      verdict = 'STRONG_CANDIDATE';
    } else if (matchScore < 60) {
      verdict = 'SUBSTANTIAL_GAP';
    }

    const recommendedPrep: string[] = [];
    if (missing.length > 0) {
      recommendedPrep.push(`Deep-dive into ${missing.slice(0, 2).join(' & ')} before technical screening.`);
    }
    recommendedPrep.push(`Practice structural frameworks for ${company.keyCompetencies[0] || 'case analysis'}.`);
    recommendedPrep.push(`Review recent Q3 quarterly financial & industry reports for ${company.companyName}.`);

    return {
      matchScore,
      verdict,
      matchedSkills: matched,
      missingSkills: missing,
      recommendedPreparation: recommendedPrep,
      mockQuestions: company.sampleInterviewFocus,
    };
  },
};
