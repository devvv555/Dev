import { CoursePlan } from '../types';

export const OFFICIAL_COURSE_PLANS: Record<string, CoursePlan> = {
  '24GM14': {
    subjectCode: '24GM14',
    subjectTitle: 'Business Statistics',
    semester: 'I',
    batch: 'MBA',
    mode: 'CA & FE',
    faculty: ['Dr. J. Sekkizhar', 'Prof. T. Sathish', 'Dr. Ravisankar Jetti'],
    courseObjective:
      'This course empowers students to delve into patterns, predict trends, and unravel relationships within data, from basic summaries to sophisticated modeling techniques.',
    caMaxMarks: 50,
    feMaxMarks: 50,
    assessments: [
      {
        id: 'ca_mini_project',
        title: 'Mini Project (Group Activity)',
        type: 'GROUP_ACTIVITY',
        scheduledDate: 'September 10, 2026 (4th week)',
        sessionsCovered: 'Unit 1',
        marksAllotted: 10,
        coTarget: 'CO1',
        description:
          'Download secondary data (e.g. Helium10 / Kaggle) of business related. Create research questions with logic, identify appropriate descriptive tools, apply software packages, interpret and present with data visualization.',
      },
      {
        id: 'ca_mid_term',
        title: 'Mid Term Test',
        type: 'EXAM',
        scheduledDate: 'September 21–23, 2026 (6th week)',
        sessionsCovered: 'Unit 1 & 2',
        marksAllotted: 20,
        coTarget: 'CO1, CO2',
        description:
          'Summative examination: 3 comprehensive questions covering descriptive statistics, probability distributions, decision trees, and inferential hypothesis basics.',
      },
      {
        id: 'ca_practical_spss',
        title: 'Practical Test (SPSS / Jamovi)',
        type: 'INDIVIDUAL_LAB',
        scheduledDate: 'November 5, 2026 (11th week)',
        sessionsCovered: 'Unit 3 & 4',
        marksAllotted: 10,
        coTarget: 'CO3 & CO4',
        description:
          'Individual lab activity. Data sets provided to perform hypothesis testing (t-test, ANOVA, Chi-square, non-parametric tests) using SPSS / Jamovi / PSPP.',
      },
      {
        id: 'ca_case_analysis',
        title: 'Case Analysis (Individual Activity)',
        type: 'CASE_ANALYSIS',
        scheduledDate: 'November 19, 2026 (14th week)',
        sessionsCovered: 'Unit 5',
        marksAllotted: 10,
        coTarget: 'CO5',
        description:
          'A comprehensive hypothetical business case study with regression and SEM modeling. Interpret statistical outputs and identify managerial implications.',
      },
    ],
    sessions: [
      {
        sessionNumber: 1,
        unit: 'Bridge',
        topic: 'Applications in Business and Economics – Elements: Introduction to statistics & quantitative literacy',
        date: 'August 17, 2026',
      },
      {
        sessionNumber: 2,
        unit: 'Bridge',
        topic: 'Numeracy session: Counting, two-way tabulation, SD, CV, Mean, Median & Mode',
      },
      {
        sessionNumber: 3,
        unit: 'Bridge',
        topic: 'Numeracy session: Correlation, Regression, Bar diagram',
      },
      {
        sessionNumber: 4,
        unit: 'I',
        topic: 'Data and Statistics – Variables: Categorical & Quantitative Data, Cross-Sectional and Time Series Data',
      },
      {
        sessionNumber: 5,
        unit: 'I',
        topic: 'Quantitative Variable – Numerical Measures & Statistics in Practice, Variability Control charts',
      },
      {
        sessionNumber: 6,
        unit: 'I',
        topic: 'Data Purification Application – Interpretation and graphical summarization',
      },
      {
        sessionNumber: 7,
        unit: 'II',
        topic: 'Probability and Applications: Random Experiments – Simple, Conditional and Bayesian Probability',
      },
      {
        sessionNumber: 8,
        unit: 'II',
        topic: 'Application: Decision Making under Risk & Decision Tree Analysis',
      },
      {
        sessionNumber: 9,
        unit: 'II',
        topic: 'Probability Distributions – Developing Discrete & Continuous Probability Distributions',
      },
      {
        sessionNumber: 10,
        unit: 'II',
        topic: 'Monte Carlo Simulation modeling in business risk',
        requiresLaptop: true,
        software: 'Excel / SPSS',
      },
      {
        sessionNumber: 11,
        unit: 'III',
        topic: 'Inferential Statistics: Sampling distribution, Interval Estimation, Hypothesis Tests',
      },
      {
        sessionNumber: 12,
        unit: 'III',
        topic: 'Inference About Means and Proportions',
      },
      {
        sessionNumber: 13,
        unit: 'II',
        topic: 'MIDTERM TEST (Session 13–14)',
        date: 'September 21–23, 2026',
        isExam: true,
      },
      {
        sessionNumber: 14,
        unit: 'II',
        topic: 'MIDTERM TEST (Part II)',
        date: 'September 21–23, 2026',
        isExam: true,
      },
      {
        sessionNumber: 15,
        unit: 'III',
        topic: 'Mid-term Question paper discussion – Revision & remediation',
      },
      {
        sessionNumber: 16,
        unit: 'III',
        topic: 'Analysis of Variance (One-Way and Two-Way ANOVA)',
        requiresLaptop: true,
        software: 'SPSS / Jamovi',
      },
      {
        sessionNumber: 17,
        unit: 'III',
        topic: 'T test – Independent sample and Post-hoc t-test',
        requiresLaptop: true,
        software: 'SPSS',
      },
      {
        sessionNumber: 18,
        unit: 'III',
        topic: 'Experimental Design: Principles and statistical controls',
      },
      {
        sessionNumber: 19,
        unit: 'III',
        topic: 'Paired t-test and pre-post intervention studies',
        requiresLaptop: true,
        software: 'SPSS',
      },
      {
        sessionNumber: 20,
        unit: 'IV',
        topic: 'Non-parametric tests: Test of Independence and Goodness of Fit – Chi-square test',
        requiresLaptop: true,
        software: 'SPSS / Jamovi',
      },
      {
        sessionNumber: 21,
        unit: 'IV',
        topic: 'Normality tests – Randomness test & QQ plots',
        requiresLaptop: true,
        software: 'SPSS',
      },
      {
        sessionNumber: 22,
        unit: 'IV',
        topic: 'Sign Test, Wilcoxon Signed-Rank Test, Mann-Whitney U, Kruskal-Wallis Test, Rank Correlation',
        requiresLaptop: true,
        software: 'SPSS',
      },
      {
        sessionNumber: 23,
        unit: 'V',
        topic: 'Regression Analysis: Model Building – Correlation matrix, Simple Linear Regression, Multiple Regression',
        requiresLaptop: true,
        software: 'SPSS / Gretl',
      },
      {
        sessionNumber: 24,
        unit: 'V',
        topic: 'Autocorrelation and the Durbin-Watson Test diagnostics',
        requiresLaptop: true,
        software: 'SPSS',
      },
      {
        sessionNumber: 25,
        unit: 'V',
        topic: 'Path analysis – Structural equation modeling: CB SEM and PLS SEM overview',
        requiresLaptop: true,
        software: 'SmartPLS / Jamovi',
      },
      {
        sessionNumber: 26,
        unit: 'V',
        topic: 'Reliability and Validity of the model: Cronbach Alpha & Construct Validity',
        requiresLaptop: true,
        software: 'SPSS',
      },
      {
        sessionNumber: 27,
        unit: 'Revision',
        topic: 'Comprehensive Course Revision & Previous Exam Paper Walkthrough',
      },
      {
        sessionNumber: 28,
        unit: 'Revision',
        topic: 'SPSS Data Modeling & Practical Problem Remediation',
        requiresLaptop: true,
        software: 'SPSS',
      },
      {
        sessionNumber: 29,
        unit: 'Revision',
        topic: 'Case Study Q&A & Managerial Decision Making review',
      },
      {
        sessionNumber: 30,
        unit: 'Revision',
        topic: 'End-Semester Final Exam Preparation & Doubt Clearing',
      },
    ],
    classroomRules: [
      '🔢 Calculator is required for all classes (Scientific calculator is preferable).',
      '📓 Separate notebook needs to be maintained for the Statistics class.',
      '💻 Laptop is mandatory for analysis using SPSS / PSPP, Jamovi, Gretl & AI software in classes.',
      '🤝 Group preparations for examinations and case studies are encouraged.',
    ],
    recommendedBooks: [
      'Business Statistics (10th edition) by David M. Levine, Stephen A. Mazur, Barbara A. Carlson (Prentice Hall, 2023)',
      'Business Statistics for Contemporary Decision Making (10th edition) by Ken Black (Pearson, 2023)',
      'Statistics for Business & Economics by Anderson DR, Williams TA, Cochran JJ (Cengage Learning, 2020)',
      'Applied Business Statistics (7th edition) by Ken Black (Pearson, 2023)',
      'Statistics in Plain English by Timothy C. Urdan (6th edition, Routledge)',
    ],
    additionalInfo: {
      miniProject: [
        'Download secondary data (e.g. Helium10 / Kaggle) of business related.',
        'Create research questions with logic.',
        'Identify appropriate descriptive statistics based on variable types.',
        'Apply software packages to analyze the data.',
        'Interpret results and present with interactive visualization.',
      ],
      practicalTest: [
        'Data sets will be provided to students with expected tools in testing of hypothesis.',
        'Students are expected to demonstrate SPSS and other relevant statistical packages to bring the right answers.',
      ],
      caseAnalysis: [
        'A comprehensive hypothetical business case study including regression and SEM model will be provided.',
        'Students are expected to interpret the statistical outputs and identify managerial implications.',
      ],
    },
  },
};

/**
 * Returns course plan for a subject or generates a default template
 */
export function getCoursePlanForSubject(subjectCode: string, subjectName?: string): CoursePlan {
  const cleanCode = subjectCode.toUpperCase().trim();
  if (OFFICIAL_COURSE_PLANS[cleanCode]) {
    return OFFICIAL_COURSE_PLANS[cleanCode];
  }

  // Standard MBA Semester 1 CA Assessment Pattern Default (50 Marks)
  return {
    subjectCode: cleanCode,
    subjectTitle: subjectName || cleanCode,
    semester: 'I',
    batch: 'MBA',
    mode: 'CA & FE',
    faculty: ['PSGIM Faculty Coordinator'],
    courseObjective: `Master core concepts, analytical frameworks, and managerial applications in ${subjectName || cleanCode}.`,
    caMaxMarks: 50,
    feMaxMarks: 50,
    assessments: [
      {
        id: `ca_${cleanCode.toLowerCase()}_1`,
        title: 'Continuous Assessment 1 (Assignment / Mini Project)',
        type: 'GROUP_ACTIVITY',
        scheduledDate: 'Mid Semester',
        sessionsCovered: 'Unit 1 & 2',
        marksAllotted: 10,
        description: 'Case analysis, practical project, or seminar presentation.',
      },
      {
        id: `ca_${cleanCode.toLowerCase()}_mid`,
        title: 'Mid Term Test',
        type: 'EXAM',
        scheduledDate: 'September 21–23, 2026',
        sessionsCovered: 'Unit 1 & 2',
        marksAllotted: 20,
        description: 'Summative written examination evaluating conceptual grasp.',
      },
      {
        id: `ca_${cleanCode.toLowerCase()}_2`,
        title: 'Continuous Assessment 2 (Quiz / Lab / Field Work)',
        type: 'INDIVIDUAL_LAB',
        scheduledDate: 'Late Semester',
        sessionsCovered: 'Unit 3 & 4',
        marksAllotted: 10,
        description: 'Practical evaluation, Moodle quiz, or individual assignment.',
      },
      {
        id: `ca_${cleanCode.toLowerCase()}_case`,
        title: 'Case Study / End Term Seminar',
        type: 'CASE_ANALYSIS',
        scheduledDate: 'Final Weeks',
        sessionsCovered: 'Unit 5',
        marksAllotted: 10,
        description: 'Comprehensive business case analysis and managerial synthesis.',
      },
    ],
    sessions: Array.from({ length: 30 }, (_, i) => ({
      sessionNumber: i + 1,
      unit: i < 6 ? 'Unit I' : i < 12 ? 'Unit II' : i < 18 ? 'Unit III' : i < 24 ? 'Unit IV' : 'Unit V',
      topic: `${subjectName || cleanCode} – Lecture Session ${i + 1}`,
      isExam: i === 12 || i === 13,
    })),
    classroomRules: [
      '📖 Regular attendance and punctuality are required for all sessions.',
      '💻 Bring laptop whenever analytical or case discussion is scheduled.',
      '🤝 Active class participation in case analysis is mandatory.',
    ],
    recommendedBooks: [
      `Standard Textbooks for ${subjectName || cleanCode} (PSGIM Library Reference)`,
    ],
  };
}
