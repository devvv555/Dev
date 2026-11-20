// Official PSGIM MBA Course Syllabi Registry
// Contains Units I-V, Course Outcomes (CO1-CO5), Course Objectives, and Recommended Textbooks

export interface SyllabusOutcome {
  code: string;
  title: string;
  description: string;
}

export interface SyllabusUnit {
  unitNumber: string;
  title: string;
  topics: string[];
  coTarget: string;
}

export interface CourseSyllabus {
  subjectCode: string;
  subjectTitle: string;
  credits: string;
  mode: string;
  courseObjective: string;
  faculty: string[];
  courseOutcomes: SyllabusOutcome[];
  units: SyllabusUnit[];
  recommendedBooks: string[];
}

export const OFFICIAL_COURSE_SYLLABI: Record<string, CourseSyllabus> = {
  // =========================================================================
  // 1. ACCOUNTING FOR DECISION MAKING (24GM13 / ADM)
  // =========================================================================
  '24GM13': {
    subjectCode: '24GM13',
    subjectTitle: 'Accounting for Decision Making (ADM)',
    credits: '3 Credits (45 Hours)',
    mode: 'Continuous Assessment (50) & Final Exam (50)',
    faculty: ['Dr. D. Kavitha', 'Dr. J. Nancy Christina', 'Dr. Nithya', 'Dr. Aiswarya D Pillai'],
    courseObjective:
      'Equip students with knowledge and skills in comprehending, assessing, and applying financial and cost data for strategic business decision-making and managerial control.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Foundations of Financial Accounting',
        description: 'Understand fundamental financial accounting principles, accounting cycle, users of accounting information, and corporate reporting concepts.',
      },
      {
        code: 'CO2',
        title: 'Financial Statements & Standards',
        description: 'Prepare, interpret, and evaluate corporate financial statements including Balance Sheet, Profit & Loss Statement, and Cash Flow Statement (Indirect Method).',
      },
      {
        code: 'CO3',
        title: 'Financial Statement Analysis & Modeling',
        description: 'Perform financial statement analysis using Comparative statements, Common Size statements, Financial Ratios, and DuPont framework in MS Excel.',
      },
      {
        code: 'CO4',
        title: 'Cost Concepts & Operational Decisions',
        description: 'Apply cost accounting concepts, Cost-Volume-Profit (CVP) analysis, and relevant costing principles for operational managerial decisions (Make/Buy, Add/Drop, Special Orders).',
      },
      {
        code: 'CO5',
        title: 'Budgetary Control & Standard Costing',
        description: 'Formulate Master Budgets, administer budgetary control systems, perform Standard Costing variance analysis, and implement transfer pricing mechanisms.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Introduction to Financial Accounting & Corporate Reporting',
        coTarget: 'CO1',
        topics: [
          'Financial Accounting concepts, conventions, and double-entry accounting cycle',
          'Accounting equation, transaction analysis, and debit/credit rules',
          'Forms of business organization and comparison of financial vs. cost accounting systems',
          'Sources of corporate financial data and reading an Annual Report (Reliance & Infosys cases)',
          'Corporate disclosures, auditor reports, and corporate governance basics',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Corporate Financial Statements & Standards',
        coTarget: 'CO2',
        topics: [
          'Corporate Balance Sheet: Structure, classifications, assets, liabilities, and equity',
          'Corporate Statement of Profit and Loss: Revenue recognition and linkage with Balance Sheet',
          'Statement of Retained Earnings and Statement of Changes in Equity',
          'Cash Flow Statement: Operating, Investing, and Financing activities using the Indirect Method',
          'Indian Accounting Standards (IND AS) overview and international convergence with IFRS',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Financial Statement Analysis & Performance Modeling',
        coTarget: 'CO3',
        topics: [
          'Comparative and Common Size financial statements: Horizontal and vertical analysis',
          'Financial Ratio Analysis: Liquidity, Solvency, Turnover, and Profitability ratios',
          'Case Study Analysis: Castile Corp and Weller Corp financial diagnostic evaluation',
          'DuPont Analysis: 3-point and 5-point decomposition of Return on Equity (ROE)',
          'Dynamic Financial Dashboards in MS Excel: Design, modeling, and executive presentation',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'Cost Accounting & Short-Term Managerial Decisions',
        coTarget: 'CO4',
        topics: [
          'Fundamentals of Cost Accounting: Cost concepts, classification, behavior, and Cost Sheet',
          'Cost-Volume-Profit (CVP) Analysis: Contribution Margin, Margin of Safety, Break-Even Point (BEP)',
          'Absorption Costing vs. Marginal / Contribution Costing systems',
          'Relevant Costing for decision making: Avoidable vs. Unavoidable costs, Opportunity costs',
          'Operational Decision Applications: Make or Buy, Add or Drop a product line, Special order pricing',
          'Equipment replacement decisions and Target Costing (Harsh Electricals Case)',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Budgetary Control, Standard Costing & Responsibility Accounting',
        coTarget: 'CO5',
        topics: [
          'Budgeting: Objectives, advantages, budget committee, and budget manual',
          'Types of Budgets: Sales, Production, Cash Budget, and Flexible Budgets',
          'Master Budget preparation and operational budgetary control mechanisms',
          'Responsibility Accounting: Cost centers, Revenue centers, Profit centers, Investment centers',
          'Transfer Pricing: Methods, market-based, cost-based, and negotiated pricing',
          'Standard Costing: Setting standards, Material Variances (Price, Usage, Mix) and Labor Variances (Rate, Efficiency, Idle time)',
        ],
      },
    ],
    recommendedBooks: [
      'Horngren, C. T., Sundem, G. L., Stratton, W. O., Burgstahler, D., and Schatzberg, J. O. “Introduction to Management Accounting”. Pearson, 17th edition, 2022.',
      'Garrison, Noreen, Brewer. “Managerial Accounting”. McGraw Hill, 16th edition, 2021.',
      'Khan, M. Y., Jain, P. K. “Management Accounting”. Tata McGraw Hill, 8th edition, 2021.',
      'Gupta, Ambrish. “Financial Accounting for Management: An Analytical Perspective”. Pearson Education, 6th edition, 2018.',
      'Drury, Colin. “Cost and Management Accounting: An Introduction”. Cengage Learning, 10th edition, 2018.',
      'John J Wild, Prakash Singh. “Financial Accounting: Information for Decisions”. McGraw Hill, 11th edition, 2024.',
    ],
  },

  // =========================================================================
  // 2. BUSINESS STATISTICS (24GM14 / BS)
  // =========================================================================
  '24GM14': {
    subjectCode: '24GM14',
    subjectTitle: 'Business Statistics (BS)',
    credits: '3 Credits (45 Hours)',
    mode: 'Continuous Assessment (50) & Final Exam (50)',
    faculty: ['Dr. J. Sekkizhar', 'Prof. T. Sathish', 'Dr. Ravisankar Jetti'],
    courseObjective:
      'This course empowers students to delve into patterns, predict trends, and unravel relationships within data, from basic summaries to sophisticated modeling techniques.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Descriptive Analytics & Data Visualization',
        description: 'Organize, summarize, and visualize quantitative and categorical business data using descriptive statistics, exploratory data analysis, and graphical plots.',
      },
      {
        code: 'CO2',
        title: 'Probability & Decision Theory',
        description: 'Apply probability theorems, Bayes theorem, probability distributions, and decision tree models under conditions of business uncertainty.',
      },
      {
        code: 'CO3',
        title: 'Hypothesis Testing & Inferential Statistics',
        description: 'Formulate hypotheses and execute parametric tests including Z-test, t-test (independent and paired), and Analysis of Variance (ANOVA).',
      },
      {
        code: 'CO4',
        title: 'Non-Parametric Methods & Goodness of Fit',
        description: 'Implement non-parametric tests including Chi-square test of independence, goodness of fit, and normality testing using statistical software.',
      },
      {
        code: 'CO5',
        title: 'Regression Modeling & Multivariate Diagnostics',
        description: 'Construct multiple linear regression models, evaluate goodness of fit, diagnose multicollinearity and autocorrelation, and interpret managerial implications.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Descriptive Statistics & Data Summarization',
        coTarget: 'CO1',
        topics: [
          'Introduction to quantitative literacy, variables, scales of measurement, and data purification',
          'Categorical and Quantitative data summarization: Frequency distributions, histograms, box plots',
          'Measures of Central Tendency: Mean, Median, Mode, Weighted Mean',
          'Measures of Dispersion: Variance, Standard Deviation, Coefficient of Variation, Skewness, Kurtosis',
          'Exploratory data analysis in SPSS / Excel with real business data (Helium10 / Kaggle)',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Probability Concepts & Decision Theory',
        coTarget: 'CO2',
        topics: [
          'Probability concepts: Random experiments, sample space, events, simple and conditional probability',
          'Bayes Theorem and its application in managerial decision making',
          'Decision making under risk and uncertainty: Decision Tree Analysis, EMV, EVPI',
          'Discrete Probability Distributions: Binomial and Poisson distributions',
          'Continuous Probability Distributions: Normal distribution and standard normal variate (Z-score)',
          'Monte Carlo simulation modeling for business risk assessment',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Sampling Distributions & Parametric Hypothesis Testing',
        coTarget: 'CO3',
        topics: [
          'Sampling methods, Central Limit Theorem, and sampling distribution of mean and proportion',
          'Point estimation and Confidence Interval estimation for single and two population means',
          'Hypothesis testing framework: Null and Alternative hypotheses, Type I and Type II errors, p-value approach',
          'One-sample t-test, Independent two-sample t-test, and Paired t-test for intervention studies',
          'Analysis of Variance (ANOVA): One-way ANOVA, Two-way ANOVA, and Post-hoc tests in SPSS / Jamovi',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'Non-Parametric Testing & Association Analysis',
        coTarget: 'CO4',
        topics: [
          'Chi-Square test: Test of independence for contingency tables and Goodness of Fit test',
          'Non-parametric tests: Mann-Whitney U test, Wilcoxon signed-rank test, Kruskal-Wallis test',
          'Normality testing diagnostics: Shapiro-Wilk test, Kolmogorov-Smirnov test, and Q-Q plots',
          'Simple correlation: Pearson correlation coefficient and Spearman rank correlation',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Regression Analysis & Multivariate Diagnostics',
        coTarget: 'CO5',
        topics: [
          'Simple and Multiple Linear Regression models: Estimation of parameters via Ordinary Least Squares (OLS)',
          'Evaluation of model fit: R-squared, Adjusted R-squared, Standard Error of Estimate, ANOVA F-test',
          'Regression diagnostics: Multicollinearity (VIF), Homoscedasticity, Autocorrelation (Durbin-Watson)',
          'Structural Equation Modeling (SEM) overview: CB-SEM and PLS-SEM introductory concepts',
          'Construct reliability and validity: Cronbach Alpha and Factor loadings in SPSS',
        ],
      },
    ],
    recommendedBooks: [
      'Anderson, D. R., Sweeney, D. J., Williams, T. A., Camm, J. D., and Cochran, J. J. “Statistics for Business and Economics”. Cengage Learning, 14th edition, 2021.',
      'Levin, R. I., Rubin, D. S., Rastogi, S., and Siddiqui, M. H. “Statistics for Management”. Pearson, 8th edition, 2020.',
      'Black, Ken. “Business Statistics for Contemporary Decision Making”. Wiley, 9th edition, 2020.',
      'Field, Andy. “Discovering Statistics Using IBM SPSS Statistics”. SAGE Publications, 5th edition, 2018.',
      'Srivastava, T. N., and Rego, Shailaja. “Business Statistics”. McGraw Hill Education, 3rd edition, 2017.',
    ],
  },

  // =========================================================================
  // 3. SPREADSHEET APPLICATIONS (24GM16 / SSA)
  // =========================================================================
  '24GM16': {
    subjectCode: '24GM16',
    subjectTitle: 'Spreadsheet Applications (SSA)',
    credits: '2 Credits (30 Hours Lab)',
    mode: '100% Continuous Assessment (Practical Lab)',
    faculty: ['Mr. G. Kangasabapathy', 'Mr. Imayavendan'],
    courseObjective:
      'Develop mastery in advanced Microsoft Excel spreadsheet techniques, business data modeling, automated reporting, PivotTables, and scenario analysis for effective managerial decision-making.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Spreadsheet Foundations & Data Management',
        description: 'Utilize advanced cell references, data validation rules, conditional formatting, and text/date manipulation functions.',
      },
      {
        code: 'CO2',
        title: 'Advanced Lookup & Logical Modeling',
        description: 'Construct robust data retrieval models using XLOOKUP, VLOOKUP, INDEX/MATCH, and nested logical conditions.',
      },
      {
        code: 'CO3',
        title: 'Financial & What-If Modeling',
        description: 'Build financial decision models using Time Value of Money functions, Scenario Manager, Data Tables, and Goal Seek.',
      },
      {
        code: 'CO4',
        title: 'PivotTables & Interactive Dashboards',
        description: 'Aggregate large business datasets using PivotTables, Slicers, Timelines, Calculated Fields, and interactive dashboard charts.',
      },
      {
        code: 'CO5',
        title: 'Optimization & Process Automation',
        description: 'Solve constrained managerial optimization problems using Excel Solver and automate repetitive tasks using Macro recordings.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Excel Foundations & Advanced Data Manipulation',
        coTarget: 'CO1',
        topics: [
          'Workbook interface, navigation shortcuts, relative, absolute, and mixed cell references ($A$1)',
          'Data cleaning, Flash Fill, Text-to-Columns, and removing duplicate records',
          'Text and date functions: CONCAT, TEXTSPLIT, LEFT, RIGHT, MID, DATE, DATEDIF, NETWORKDAYS',
          'Advanced conditional formatting with dynamic custom formula rules',
          'Data validation lists, input messages, and error alert configurations',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Advanced Formula Architecture & Lookup Operations',
        coTarget: 'CO2',
        topics: [
          'Modern lookup functions: XLOOKUP syntax, exact/approximate match, search mode, multi-criteria lookup',
          'Legacy lookup functions: VLOOKUP, HLOOKUP, and INDEX/MATCH combination',
          'Logical functions: IF, nested IFS, AND, OR, XOR, SWITCH, IFERROR',
          'Statistical aggregation: SUMIFS, COUNTIFS, AVERAGEIFS with multiple criteria ranges',
          'Dynamic array formulas: FILTER, SORT, UNIQUE, SEQUENCE, TRANSPOSE',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Financial Functions & Scenario Analysis',
        coTarget: 'CO3',
        topics: [
          'Financial modeling functions: PV, FV, PMT, PPMT, IPMT, NPER, RATE for loan amortization',
          'Capital budgeting functions: NPV (Net Present Value), IRR (Internal Rate of Return), XNPV, XIRR',
          'What-If analysis tools: Data Tables (One-variable and Two-variable tables)',
          'Goal Seek for target break-even and pricing determination',
          'Scenario Manager for best-case, base-case, and worst-case multi-variable planning',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'PivotTables, Slicers & Dynamic Dashboard Architecture',
        coTarget: 'CO4',
        topics: [
          'PivotTable construction: Row fields, column fields, values, report filters',
          'Grouping dates by months/quarters/years, number formatting inside PivotTables',
          'Calculated Fields and Calculated Items creation inside PivotTables',
          'Interactive dashboard controls: Slicers, Timelines, and multi-PivotTable report connections',
          'Executive dashboard layout principles: KPIs, conditional cards, sparklines, dynamic chart linking',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Constrained Optimization & Process Automation',
        coTarget: 'CO5',
        topics: [
          'Linear programming and constrained optimization using Excel Solver add-in',
          'Defining objective functions (Max, Min, Target), decision variable cells, and constraint sets',
          'Sensitivity reports and shadow prices interpretation for managerial decisions',
          'Introduction to Excel Macros: Developer tab, recording macros with relative references',
          'Assigning macros to buttons and shapes for automated one-click workbook execution',
        ],
      },
    ],
    recommendedBooks: [
      'Alexander, Michael, and Walkenbach, John. “Excel 2019 Bible”. Wiley, 2019.',
      'Winston, Wayne L. “Microsoft Excel 2019: Data Analysis and Business Modeling”. Microsoft Press, 6th edition, 2020.',
      'Jelen, Bill. “MrExcel LX: The Holy Grail of Excel Tips”. Holy Macro! Books, 2020.',
      'Fairhurst, Danielle Stein. “Financial Modeling in Excel For Dummies”. Wiley, 2nd edition, 2022.',
    ],
  },

  // =========================================================================
  // 4. MANAGEMENT CONCEPTS & ORGANIZATIONAL BEHAVIOR (24GM11 / MCOB)
  // =========================================================================
  '24GM11': {
    subjectCode: '24GM11',
    subjectTitle: 'Management Concepts & Organizational Behavior (MCOB)',
    credits: '3 Credits (45 Hours)',
    mode: 'Continuous Assessment (50) & Final Exam (50)',
    faculty: ['Dr. M. Kirupa Priyadarshini', 'Dr. Vijaya Vardhan Manchala', 'Dr. R. Indumathy', 'Dr. N. Udayakumar'],
    courseObjective:
      'Provide a comprehensive understanding of foundational management principles, individual psychology, team dynamics, leadership paradigms, and organizational structures.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Evolution of Management Thought',
        description: 'Analyze classical, behavioral, and contemporary management theories, managerial roles, and ethical decision-making principles.',
      },
      {
        code: 'CO2',
        title: 'Individual Behavior & Personality',
        description: 'Examine personality theories (Big Five, MBTI), perception, attitudes, learning processes, and emotional intelligence in organizational settings.',
      },
      {
        code: 'CO3',
        title: 'Motivation Theories & Job Design',
        description: 'Evaluate content and process motivation theories (Maslow, Herzberg, McClelland, Vroom) and their application to employee engagement.',
      },
      {
        code: 'CO4',
        title: 'Group Dynamics & Conflict Resolution',
        description: 'Analyze team development stages, team cohesion, communication channels, negotiation techniques, and conflict management styles.',
      },
      {
        code: 'CO5',
        title: 'Leadership, Culture & Organizational Change',
        description: 'Synthesize leadership styles (Transformational, Servant, Situational), organizational culture diagnostics, and change management models.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Foundations of Management & Managerial Roles',
        coTarget: 'CO1',
        topics: [
          'Nature, scope, and functions of management: Planning, Organizing, Leading, Controlling',
          'Evolution of management thought: Scientific management (Taylor), Administrative theory (Fayol), Bureaucracy (Weber)',
          'Human relations movement (Hawthorne studies) and Modern systems / contingency approaches',
          'Managerial roles (Mintzberg) and essential managerial skills (Technical, Human, Conceptual)',
          'Managerial ethics, corporate social responsibility, and sustainable governance',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Individual Differences, Perception & Attitudes',
        coTarget: 'CO2',
        topics: [
          'Personality determinants and frameworks: Big Five traits, Myers-Briggs Type Indicator (MBTI)',
          'Values, attitudes, job satisfaction, organizational citizenship behavior (OCB), and turnover intentions',
          'Perceptual process, attribution theory, perceptual errors (Halo effect, Stereotyping, Projection)',
          'Learning theories: Classical conditioning, Operant conditioning, Social learning theory',
          'Emotional Intelligence (Goleman) and workplace stress management strategies',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Work Motivation & Organizational Reward Systems',
        coTarget: 'CO3',
        topics: [
          'Content theories of motivation: Maslow Hierarchy of Needs, Herzberg Two-Factor Theory, McClelland Acquired Needs',
          'Process theories of motivation: Vroom Expectancy Theory, Adams Equity Theory, Locke Goal-Setting Theory',
          'Job design models: Hackman and Oldham Job Characteristics Model, Job enrichment, Job rotation',
          'Intrinsic vs. extrinsic rewards, employee recognition programs, and performance incentives',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'Group Dynamics, Teamwork & Conflict Management',
        coTarget: 'CO4',
        topics: [
          'Foundations of group behavior, types of groups, Tuckman five-stage model of team development',
          'Group decision making: Brainstorming, Nominal Group Technique, Delphi method, Groupthink, Groupshift',
          'Communication process, barriers to effective communication, active listening, non-verbal cues',
          'Conflict process, functional vs. dysfunctional conflict, Thomas-Kilmann conflict resolution modes',
          'Negotiation strategies: Distributive vs. Integrative bargaining tactics',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Leadership, Organizational Culture & Change Management',
        coTarget: 'CO5',
        topics: [
          'Trait, Behavioral (Ohio, Michigan, Managerial Grid), and Contingency leadership theories (Fiedler, Hersey-Blanchard)',
          'Contemporary leadership: Transformational, Transactional, Charismatic, and Servant leadership',
          'Organizational culture: Elements, creation, sustenance, and Schein organizational culture levels',
          'Organizational structure: Mechanistic vs. Organic designs, departmentalization, span of control',
          'Organizational change: Lewin three-step model, Kotter eight-step model, overcoming resistance to change',
        ],
      },
    ],
    recommendedBooks: [
      'Robbins, Stephen P., Judge, Timothy A., and Vohra, Neharika. “Organizational Behavior”. Pearson, 18th edition, 2019.',
      'Koontz, Harold, and Weihrich, Heinz. “Essentials of Management: An International, Innovation, and Leadership Perspective”. McGraw Hill, 10th edition, 2018.',
      'Luthans, Fred, Luthans, Brett C., and Luthans, Kyle W. “Organizational Behavior: An Evidence-Based Approach”. Information Age Publishing, 14th edition, 2021.',
      'Daft, Richard L. “Management”. Cengage Learning, 13th edition, 2020.',
    ],
  },

  // =========================================================================
  // 5. ECONOMICS FOR DECISION MAKING (24GM12 / EDM)
  // =========================================================================
  '24GM12': {
    subjectCode: '24GM12',
    subjectTitle: 'Economics for Decision Making (EDM)',
    credits: '3 Credits (45 Hours)',
    mode: 'Continuous Assessment (50) & Final Exam (50)',
    faculty: ['Dr. Sreeanandan', 'Dr. Aiswarya D Pillai', 'Dr. E. Sri Varshini'],
    courseObjective:
      'Equip students with microeconomic and macroeconomic frameworks, market structure analysis, demand estimation, pricing dynamics, and monetary/fiscal policies for strategic managerial decision-making.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Demand Analysis & Elasticity Forecasting',
        description: 'Analyze consumer behavior, law of demand, demand elasticity metrics (price, income, cross), and demand forecasting techniques.',
      },
      {
        code: 'CO2',
        title: 'Production Functions & Cost Dynamics',
        description: 'Examine short-run and long-run production functions, law of diminishing returns, economies of scale, and cost curves.',
      },
      {
        code: 'CO3',
        title: 'Market Structures & Pricing Strategies',
        description: 'Evaluate firm equilibrium and pricing strategies under Perfect Competition, Monopoly, Monopolistic Competition, and Oligopoly.',
      },
      {
        code: 'CO4',
        title: 'Macroeconomic Aggregates & Business Cycles',
        description: 'Measure national income indicators (GDP, GNP, NNP), understand inflation causes and remedies, and analyze business cycle phases.',
      },
      {
        code: 'CO5',
        title: 'Fiscal, Monetary Policy & Global Trade',
        description: 'Assess the impact of RBI monetary policy instruments, government fiscal budgets, balance of payments, and exchange rates on businesses.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Managerial Economics, Demand Theory & Forecasting',
        coTarget: 'CO1',
        topics: [
          'Nature and scope of Managerial Economics: Circular flow of economic activity, opportunity cost principle',
          'Law of Demand, demand schedules, market demand determinants, and consumer surplus',
          'Elasticity of Demand: Price elasticity, Income elasticity, Cross elasticity, Advertising elasticity',
          'Managerial application of demand elasticities for revenue optimization and pricing decisions',
          'Demand forecasting methodologies: Qualitative surveys, Delphi method, Time-series, Regression forecasting',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Theory of Production & Cost Dynamics',
        coTarget: 'CO2',
        topics: [
          'Production function: Total Product, Marginal Product, Average Product, Law of Diminishing Marginal Returns',
          'Long-run production: Isoquants, Isocost lines, Marginal Rate of Technical Substitution (MRTS), Producer equilibrium',
          'Returns to Scale: Increasing, Constant, and Decreasing returns to scale; Economies and Diseconomies of Scale',
          'Short-run cost curves: Fixed cost, Variable cost, Marginal cost, Average cost relationships',
          'Long-run average cost (LAC) curve, learning curve effects, and envelope curve dynamics',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Market Structures, Game Theory & Pricing Strategies',
        coTarget: 'CO3',
        topics: [
          'Perfect Competition: Characteristics, short-run and long-run profit maximization, shutdown condition',
          'Monopoly: Sources of monopoly power, price and output determination, deadweight loss',
          'Price Discrimination: First, Second, and Third-degree price discrimination conditions',
          'Monopolistic Competition: Product differentiation, excess capacity theorem, selling costs',
          'Oligopoly: Collusive vs. Non-collusive models, Sweezy Kinked Demand Curve, Cartels (OPEC)',
          'Game Theory basics: Prisoner Dilemma, Nash Equilibrium, dominant strategies in business rivalry',
          'Strategic pricing techniques: Cost-plus, Penetration, Skimming, Bundling, Peak-load, Two-part tariff',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'Macroeconomic Fundamentals & Inflation',
        coTarget: 'CO4',
        topics: [
          'National Income accounting: Gross Domestic Product (GDP), Real vs. Nominal GDP, GNI, Per Capita Income',
          'Methods of measuring National Income: Product method, Income method, Expenditure method',
          'Inflation: Types (Demand-pull, Cost-push, Creeping, Hyperinflation), Consumer Price Index (CPI), WPI',
          'Economic impact of inflation on investments, purchasing power, interest rates, and competitiveness',
          'Business Cycles: Phases (Expansion, Peak, Contraction, Trough), leading/lagging economic indicators',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Monetary Policy, Fiscal Policy & International Economics',
        coTarget: 'CO5',
        topics: [
          'Monetary Policy: Reserve Bank of India (RBI) objectives, policy repo rate, reverse repo rate, CRR, SLR',
          'Fiscal Policy: Union Budget components, Revenue vs. Capital receipts, Fiscal deficit, Primary deficit',
          'Interaction of Monetary and Fiscal policies in stabilizing national economic growth and employment',
          'Balance of Payments (BoP): Current Account vs. Capital Account, BoP disequilibrium and corrective measures',
          'Foreign Exchange Market: Nominal and Real Effective Exchange Rates (NEER/REER), currency depreciation/appreciation impact',
        ],
      },
    ],
    recommendedBooks: [
      'Damodaran, Suma. “Managerial Economics”. Oxford University Press, 2nd edition, 2017.',
      'Pindyck, Robert S., and Rubinfeld, Daniel L. “Microeconomics”. Pearson, 9th edition, 2018.',
      'Mankiw, N. Gregory. “Principles of Macroeconomics”. Cengage Learning, 9th edition, 2020.',
      'Paul, Samuelson A., and William, Nordhaus D. “Economics”. McGraw Hill Education, 19th edition, 2019.',
    ],
  },

  // =========================================================================
  // 6. MARKETING MANAGEMENT (24GM15 / MC)
  // =========================================================================
  '24GM15': {
    subjectCode: '24GM15',
    subjectTitle: 'Marketing Management (MC)',
    credits: '3 Credits (45 Hours)',
    mode: 'Continuous Assessment (50) & Final Exam (50)',
    faculty: ['Dr. R. Deepa', 'Dr. R. Indumathy', 'Dr. E. Sri Varshini', 'Dr. Chenna Upendra'],
    courseObjective:
      'Equip students with strategic marketing frameworks, consumer behavior analysis, segmentation, targeting, positioning (STP), and marketing mix (4Ps/7Ps) formulation.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Marketing Concepts & Environment Analysis',
        description: 'Understand core marketing concepts, value creation, and conduct micro/macro environmental scans (PESTLE).',
      },
      {
        code: 'CO2',
        title: 'Consumer Behavior & STP Strategy',
        description: 'Analyze consumer decision-making processes, market segmentation bases, target segment selection, and perceptual positioning.',
      },
      {
        code: 'CO3',
        title: 'Product & Brand Management',
        description: 'Formulate Product Life Cycle (PLC) strategies, new product development stages, brand equity architecture, and packaging.',
      },
      {
        code: 'CO4',
        title: 'Pricing Dynamics & Distribution Channels',
        description: 'Apply pricing strategies (Value-based, Cost-based, Dynamic), channel design, logistics, and retail management.',
      },
      {
        code: 'CO5',
        title: 'Integrated Marketing Communications & Digital Trends',
        description: 'Design Integrated Marketing Communication (IMC) campaigns combining advertising, PR, sales promotion, and digital media.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Foundations of Marketing & Environment Analysis',
        coTarget: 'CO1',
        topics: [
          'Core concepts: Needs, Wants, Demands, Customer Value, Satisfaction, and Customer Relationship Management (CRM)',
          'Marketing orientations: Production, Product, Selling, Marketing, and Holistic / Societal Marketing concepts',
          'Marketing Environment: Micro-environment (Company, Suppliers, Intermediaries, Customers, Competitors, Publics)',
          'Macro-environment analysis: PESTLE framework (Political, Economic, Socio-cultural, Technological, Legal, Environmental)',
          'Marketing Information System (MIS) and Market Research process steps',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Consumer Decision Making & STP Framework',
        coTarget: 'CO2',
        topics: [
          'Consumer buying behavior: Psychological, social, cultural, and personal determinants of purchase decisions',
          'Consumer decision journey: Problem recognition, information search, evaluation, purchase decision, post-purchase behavior',
          'B2B vs. B2C buying behavior: Buying centers and stages in industrial purchasing',
          'Market Segmentation: Demographic, Geographic, Psychographic (VALS), and Behavioral bases',
          'Target Market selection strategies: Undifferentiated, Differentiated, Concentrated (Niche), and Micro-marketing',
          'Positioning Strategy: Points of Parity (POP), Points of Difference (POD), and Perceptual Mapping',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Product Strategy, New Product Development & Branding',
        coTarget: 'CO3',
        topics: [
          'Product levels: Core benefit, Basic product, Expected product, Augmented product, Potential product',
          'Product classifications: Convenience, Shopping, Specialty, Unsought goods',
          'Product Life Cycle (PLC): Stages (Introduction, Growth, Maturity, Decline) and marketing strategies across each stage',
          'New Product Development (NPD) process: Idea generation, screening, concept testing, business analysis, commercialization',
          'Branding principles: Brand Equity models (Keller Brand Asset Valuator), Brand extensions, co-branding, packaging and labeling',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'Pricing Models & Channel Distribution Management',
        coTarget: 'CO4',
        topics: [
          'Pricing considerations: Customer value perceptions, product costs, competitor offerings',
          'General pricing approaches: Cost-plus, Target return, Perceived-value, Value pricing, Going-rate pricing',
          'New product pricing strategies: Market-skimming vs. Market-penetration pricing',
          'Product-mix pricing: Product-line pricing, Optional-product, Captive-product, By-product, Product-bundle pricing',
          'Marketing Channels: Direct vs. Indirect channels, Multi-channel and Omnichannel distribution systems',
          'Channel conflict management: Horizontal vs. Vertical conflicts; Physical distribution and supply chain logistics',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Integrated Marketing Communications & Digital Marketing',
        coTarget: 'CO5',
        topics: [
          'Integrated Marketing Communications (IMC) concept and communication mix tools',
          'Advertising: Developing advertising campaigns, 5Ms of advertising (Mission, Money, Message, Media, Measurement)',
          'Sales Promotion, Public Relations (PR), Personal Selling process, Direct Marketing',
          'Digital Marketing ecosystem: Search Engine Optimization (SEO), Social Media Marketing (SMM), Influencer marketing',
          'Marketing metrics and analytics: Customer Acquisition Cost (CAC), Customer Lifetime Value (CLV), Return on Marketing Investment (ROMI)',
        ],
      },
    ],
    recommendedBooks: [
      'Kotler, Philip, Keller, Kevin Lane, Chernev, Alexander, and Koshy, Abraham. “Marketing Management”. Pearson, 16th edition, 2022.',
      'Ramaswamy, V. S., and Namakumari, S. “Marketing Management: Indian Context with Global Perspective”. SAGE Publications, 6th edition, 2018.',
      'Grewal, Dhruv, and Levy, Michael. “Marketing”. McGraw Hill Education, 7th edition, 2020.',
      'Baines, Paul, Fill, Chris, Rosengren, Sara, and Antonetti, Paolo. “Marketing”. Oxford University Press, 5th edition, 2019.',
    ],
  },

  // =========================================================================
  // 7. LEGAL ASPECTS OF BUSINESS (24GM19 / LA)
  // =========================================================================
  '24GM19': {
    subjectCode: '24GM19',
    subjectTitle: 'Legal Aspects of Business (LA)',
    credits: '2 Credits (30 Hours)',
    mode: 'Continuous Assessment (50) & Final Exam (50)',
    faculty: ['Ms. C. Dhanya', 'Dr. Firdaus Bashir'],
    courseObjective:
      'Impart comprehensive knowledge of commercial laws, Indian Contract Act, Sale of Goods Act, Companies Act, intellectual property rights, and consumer protection regulations.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Indian Contract Act & Enforceability',
        description: 'Understand essential elements of valid contracts, offer/acceptance, consideration, capacity, and breach remedies.',
      },
      {
        code: 'CO2',
        title: 'Special Contracts & Sale of Goods',
        description: 'Examine indemnity, guarantee, bailment, pledge, agency, conditions vs warranties, and transfer of title.',
      },
      {
        code: 'CO3',
        title: 'Company Law & Corporate Governance',
        description: 'Analyze incorporation procedures, memorandum/articles, director duties, meetings, and winding up processes.',
      },
      {
        code: 'CO4',
        title: 'Intellectual Property Rights (IPR)',
        description: 'Evaluate legal protections for patents, trademarks, copyrights, trade secrets, and industrial designs in commercial markets.',
      },
      {
        code: 'CO5',
        title: 'Consumer Protection & Digital Law',
        description: 'Assess consumer dispute redressal mechanisms, Consumer Protection Act 2019, Information Technology Act, and cyber regulations.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Law of Contract: General Principles',
        coTarget: 'CO1',
        topics: [
          'Indian Contract Act 1872: Definition, classification, and essential elements of a valid contract (Section 10)',
          'Proposal and Acceptance: Rules of valid offer, revocation, and communication of acceptance',
          'Lawful Consideration: Doctrine of Privity of Contract and exceptions to "No consideration, no contract"',
          'Capacity of parties: Contracts with minors, persons of unsound mind, and disqualified individuals',
          'Free Consent: Coercion, Undue Influence, Fraud, Misrepresentation, and Mistake',
          'Discharge of contract and Remedies for breach of contract: Damages, Injunction, Specific Performance',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Special Contracts & Sale of Goods Act',
        coTarget: 'CO2',
        topics: [
          'Contract of Indemnity and Guarantee: Rights of surety, discharge of surety liability',
          'Contract of Bailment and Pledge: Duties of bailor and bailee, rights of pawnee',
          'Contract of Agency: Creation of agency, rights/duties of agent, principal liability, termination of agency',
          'Sale of Goods Act 1930: Contract of sale vs. Agreement to sell, Goods classification',
          'Conditions and Warranties: Express vs. Implied conditions, Rule of Caveat Emptor and exceptions',
          'Transfer of property and risk, Rights of an unpaid seller against goods and buyer',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Companies Act 2013 & Corporate Governance',
        coTarget: 'CO3',
        topics: [
          'Nature and characteristics of a company: Separate legal entity (Salomon case), Limited liability, Perpetual succession',
          'Types of companies: Private, Public, One Person Company (OPC), Small Company, Section 8 Company',
          'Incorporation documents: Memorandum of Association (MoA), Articles of Association (AoA), Doctrine of Ultra Vires, Indoor Management',
          'Management and Administration: Directors (DIN, appointment, disqualification, legal duties, independent directors)',
          'Company meetings: Annual General Meeting (AGM), Extraordinary General Meeting (EGM), Quorum, Resolutions',
          'Winding up of companies: Summary overview of insolvency and liquidation under IBC 2016',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'Intellectual Property Rights (IPR) Framework',
        coTarget: 'CO4',
        topics: [
          'Overview of Intellectual Property Rights in commercial commerce: TRIPS agreement compliance',
          'Patents Act 1970: Patentable inventions, novelty, non-obviousness, industrial application, patent application process',
          'Trademarks Act 1999: Distinctiveness, trademark registration, infringement vs. passing off, remedies',
          'Copyright Act 1957: Subject matter of copyright, author rights, fair dealing provisions, digital copyright',
          'Trade Secrets, Geographical Indications (GI), and Industrial Design protection',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Consumer Protection Act & Cyber Regulations',
        coTarget: 'CO5',
        topics: [
          'Consumer Protection Act 2019: Definition of consumer, consumer rights, unfair trade practices, misleading advertisements',
          'Three-tier Consumer Disputes Redressal Commission: District, State, and National commissions jurisdiction and powers',
          'Product Liability rules and penalties under the 2019 Act',
          'Information Technology Act 2000: Digital signatures, electronic records legal recognition, cyber offences and penalties',
          'Data privacy and digital personal data protection essentials for business operations',
        ],
      },
    ],
    recommendedBooks: [
      'Kuchhal, M. C., and Kuchhal, Vivek. “Business Legislation for Management”. Vikas Publishing House, 5th edition, 2018.',
      'Kapoor, N. D. “Elements of Mercantile Law”. Sultan Chand & Sons, 38th edition, 2020.',
      'Pathak, Akhileshwar. “Legal Aspects of Business”. McGraw Hill Education, 7th edition, 2018.',
      'Ravinder Kumar. “Legal Aspects of Business”. Cengage Learning, 4th edition, 2016.',
    ],
  },

  // =========================================================================
  // 8. SPORTS & SELF MANAGEMENT (24GM18 / SSM)
  // =========================================================================
  '24GM18': {
    subjectCode: '24GM18',
    subjectTitle: 'Sports & Self Management (SSM)',
    credits: '2 Credits (30 Hours)',
    mode: '100% Continuous Assessment (Practical & Portfolio)',
    faculty: ['Dr. D. Kavitha', 'Ms. C. Dhanya', 'Ms. Kanagathara', 'Dr. Venkatalakshmi', 'Mr. Zakeer Khan'],
    courseObjective:
      'Foster holistic personal development, emotional resilience, stress management, ethical leadership, physical fitness, and team synergy.',
    courseOutcomes: [
      {
        code: 'CO1',
        title: 'Self-Awareness & Values Clarification',
        description: 'Cultivate introspective self-awareness, personal values alignment, life goal setting, and growth mindset principles.',
      },
      {
        code: 'CO2',
        title: 'Mindfulness & Stress Management',
        description: 'Apply breathing exercises, mindfulness meditation, cognitive reframing, and resilience strategies for peak performance.',
      },
      {
        code: 'CO3',
        title: 'Time & Energy Management',
        description: 'Implement productivity matrices (Eisenhower), habit formation loops, circadian rhythm optimization, and digital detox habits.',
      },
      {
        code: 'CO4',
        title: 'Physical Wellness & Athletic Conditioning',
        description: 'Engage in structured cardiovascular fitness, strength training, flexibility routines, and nutritional awareness.',
      },
      {
        code: 'CO5',
        title: 'Sportsmanship & Collaborative Team Leadership',
        description: 'Demonstrate ethical sportsmanship, strategic team coordination, peer communication, and fair play in group sports.',
      },
    ],
    units: [
      {
        unitNumber: 'Unit I',
        title: 'Self-Discovery, Personal Values & Goal Setting',
        coTarget: 'CO1',
        topics: [
          'Self-concept, Johari Window model for self-awareness, identifying blind spots and personal strengths',
          'Values clarification: Aligning core individual ethics with managerial career choices',
          'Growth mindset (Dweck) vs. Fixed mindset: Embracing failure as feedback and learning',
          'SMART goal formulation and long-term vision board development',
          'Reflective journaling and emotional introspection exercises',
        ],
      },
      {
        unitNumber: 'Unit II',
        title: 'Emotional Resilience, Mindfulness & Stress Regulation',
        coTarget: 'CO2',
        topics: [
          'Neurobiology of stress: Fight-or-flight response, cortisol effects, and academic burnout indicators',
          'Mindfulness meditation, breathwork (Pranayama), and progressive muscle relaxation (PMR)',
          'Cognitive reframing: Overcoming cognitive distortions, catastrophizing, and imposter syndrome',
          'Emotional regulation techniques during high-pressure academic deadlines and corporate interviews',
        ],
      },
      {
        unitNumber: 'Unit III',
        title: 'Time Mastery, Habit Architecture & Productivity',
        coTarget: 'CO3',
        topics: [
          'Time management frameworks: Eisenhower Urgent-Important matrix, Pomodoro technique, Time-blocking',
          'Habit loops (Clear Atomic Habits): Cue, Craving, Response, Reward; Habit stacking principles',
          'Energy management vs. Time management: Circadian cycles, sleep hygiene, and nutritional cognitive fuel',
          'Managing digital distractions, notifications overload, and structured digital detox routines',
        ],
      },
      {
        unitNumber: 'Unit IV',
        title: 'Physical Conditioning, Aerobic Fitness & Nutrition',
        coTarget: 'CO4',
        topics: [
          'Cardiovascular endurance training: Interval walking, jogging, and aerobic conditioning drills',
          'Core stability, flexibility, posture alignment, and ergonomics for executive desk work',
          'Basic nutritional science: Macronutrients, hydration balance, glycemic index, and sustained mental energy',
          'Individual physical fitness tracking and progress benchmark logging',
        ],
      },
      {
        unitNumber: 'Unit V',
        title: 'Sportsmanship, Team Synergy & Athletic Leadership',
        coTarget: 'CO5',
        topics: [
          'Principles of ethical sportsmanship: Respecting opponents, accepting referee decisions, integrity in victory and defeat',
          'Outdoor sports activities: Badminton, Volleyball, Basketball, and Track sports practical participation',
          'Team coordination dynamics: Non-verbal communication, tactical play execution, supporting peer players',
          'Translating athletic grit, peer accountability, and sports strategy to corporate managerial teams',
        ],
      },
    ],
    recommendedBooks: [
      'Goleman, Daniel. “Emotional Intelligence: Why It Can Matter More Than IQ”. Bantam Books, 2005.',
      'Clear, James. “Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones”. Avery, 2018.',
      'Covey, Stephen R. “The 7 Habits of Highly Effective People”. Simon & Schuster, 2020.',
      'Dweck, Carol S. “Mindset: The New Psychology of Success”. Ballantine Books, 2006.',
    ],
  },
};

/**
 * Helper to retrieve official course syllabus by code or name
 */
export function getCourseSyllabus(subjectCode: string, subjectName?: string): CourseSyllabus {
  const cleanCode = subjectCode ? subjectCode.toUpperCase().trim() : '';
  const cleanName = subjectName ? subjectName.toUpperCase().trim() : '';
  const combined = `${cleanCode} ${cleanName}`;

  if (OFFICIAL_COURSE_SYLLABI[cleanCode]) {
    return OFFICIAL_COURSE_SYLLABI[cleanCode];
  }

  // Accounting for Decision Making (24GM13 / ADM)
  if (
    cleanCode === 'ADM' ||
    cleanCode === '24GM13' ||
    cleanCode.includes('GM13') ||
    cleanName.includes('ACCOUNTING') ||
    cleanName.includes('ADM') ||
    combined.includes('ACCOUNT')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM13'];
  }

  // Business Statistics (24GM14 / BS)
  if (
    cleanCode === 'BS' ||
    cleanCode === '24GM14' ||
    cleanCode.includes('GM14') ||
    cleanName.includes('STATISTIC') ||
    cleanName.includes('BUSINESS STAT') ||
    combined.includes('STAT')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM14'];
  }

  // Spreadsheet Applications (24GM16 / SSA)
  if (
    cleanCode === 'SSA' ||
    cleanCode === '24GM16' ||
    cleanCode.includes('GM16') ||
    cleanName.includes('SPREADSHEET') ||
    cleanName.includes('SSA') ||
    combined.includes('EXCEL')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM16'];
  }

  // Management Concepts & Organizational Behavior (24GM11 / MCOB)
  if (
    cleanCode === 'MCOB' ||
    cleanCode === '24GM11' ||
    cleanCode.includes('GM11') ||
    cleanName.includes('ORGANIZATIONAL') ||
    cleanName.includes('MCOB') ||
    combined.includes('BEHAVIOR')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM11'];
  }

  // Economics for Decision Making (24GM12 / EDM)
  if (
    cleanCode === 'EDM' ||
    cleanCode === '24GM12' ||
    cleanCode.includes('GM12') ||
    cleanName.includes('ECONOMICS') ||
    cleanName.includes('EDM') ||
    combined.includes('ECONOM')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM12'];
  }

  // Marketing Management (24GM15 / MC)
  if (
    cleanCode === 'MC' ||
    cleanCode === '24GM15' ||
    cleanCode.includes('GM15') ||
    cleanName.includes('MARKETING') ||
    cleanName.includes('MC')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM15'];
  }

  // Legal Aspects of Business (24GM19 / LA)
  if (
    cleanCode === 'LA' ||
    cleanCode === '24GM19' ||
    cleanCode.includes('GM19') ||
    cleanName.includes('LEGAL') ||
    cleanName.includes('LA') ||
    combined.includes('LAW')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM19'];
  }

  // Sports & Self Management (24GM18 / SSM)
  if (
    cleanCode === 'SSM' ||
    cleanCode === '24GM18' ||
    cleanCode.includes('GM18') ||
    cleanName.includes('SPORTS') ||
    cleanName.includes('SSM') ||
    combined.includes('SELF')
  ) {
    return OFFICIAL_COURSE_SYLLABI['24GM18'];
  }

  // Fallback to ADM
  return OFFICIAL_COURSE_SYLLABI['24GM13'];
}
