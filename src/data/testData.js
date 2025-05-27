// Data for basic science subjects - alphabetically sorted
export const basicScienceData = [
  { name: 'Anatomy', correct: 112, incorrect: 32, ratio: 78 },
  { name: 'Biochemistry', correct: 109, incorrect: 19, ratio: 85 },
  { name: 'Biostatistics', correct: 70, incorrect: 22, ratio: 76 },
  { name: 'Ethical and Social Sciences', correct: 88, incorrect: 6, ratio: 94 },
  { name: 'Genetics', correct: 81, incorrect: 22, ratio: 79 },
  { name: 'Immunology', correct: 40, incorrect: 74, ratio: 35 },
  { name: 'Microbiology', correct: 118, incorrect: 44, ratio: 73 },
  { name: 'Pathology', correct: 122, incorrect: 34, ratio: 78 },
  { name: 'Pharmacology', correct: 155, incorrect: 21, ratio: 88 },
  { name: 'Physiology', correct: 168, incorrect: 15, ratio: 92 }
];

// Data for organ systems - alphabetically sorted
export const organSystemData = [
  { name: 'Blood & Lymphatic', correct: 84, incorrect: 22, ratio: 79 },
  { name: 'Cardiovascular', correct: 120, incorrect: 12, ratio: 91 },
  { name: 'Endocrine', correct: 103, incorrect: 21, ratio: 83 },
  { name: 'Female Reproductive', correct: 70, incorrect: 22, ratio: 76 },
  { name: 'Gastrointestinal', correct: 108, incorrect: 27, ratio: 80 },
  { name: 'Male Reproductive', correct: 71, incorrect: 25, ratio: 74 },
  { name: 'Multisystem', correct: 94, incorrect: 18, ratio: 84 },
  { name: 'Musculoskeletal', correct: 97, incorrect: 12, ratio: 89 },
  { name: 'Nervous System', correct: 108, incorrect: 19, ratio: 85 },
  { name: 'Psychiatry', correct: 77, incorrect: 17, ratio: 82 },
  { name: 'Renal', correct: 78, incorrect: 30, ratio: 72 },
  { name: 'Respiratory', correct: 104, incorrect: 14, ratio: 88 },
  { name: 'Risk Factors and Prognosis', correct: 106, incorrect: 7, ratio: 94 },
  { name: 'Skin', correct: 68, incorrect: 16, ratio: 81 }
];

// Data for specialties - alphabetically sorted
export const specialtyData = [
  { name: 'Emergency Medicine', correct: 105, incorrect: 19, ratio: 85 },
  { name: 'Family Medicine', correct: 79, incorrect: 19, ratio: 81 },
  { name: 'Internal Medicine', correct: 149, incorrect: 16, ratio: 90 },
  { name: 'Obstetrics & Gynecology', correct: 84, incorrect: 33, ratio: 72 },
  { name: 'Pediatrics', correct: 103, incorrect: 25, ratio: 80 },
  { name: 'Psychiatry', correct: 83, incorrect: 24, ratio: 78 },
  { name: 'Surgery', correct: 114, incorrect: 28, ratio: 80 }
];

// Top-level metrics for the circular statistic
export const overallStats = {
  overallScore: 82,
  totalQuestions: 5000,
  usedQuestions: 3600,
  unusedQuestions: 1400,
  correctAnswers: 2940,
  incorrectAnswers: 660
};

// Data for pie charts
export const correctVsIncorrectData = [
  { name: 'Correct', value: overallStats.correctAnswers, color: '#22c55e' },
  { name: 'Incorrect', value: overallStats.incorrectAnswers, color: '#ef4444' }
];

export const usedVsUnusedData = [
  { name: 'Used', value: overallStats.usedQuestions, color: '#3b82f6' },
  { name: 'Unused', value: overallStats.unusedQuestions, color: '#94a3b8' }
];

// Dummy data for testPairs
export const testPairs = [
  {
    id: 1,
    term1: "What is the capital of France?",
    term2: "Paris",
    category: "geography",
    difficulty: "easy",
    notes: {
      term1Notes: "France is a country in Western Europe",
      term2Notes: "Paris is located in the north-central part of France",
      bulletPoints: ["Largest city in France", "Population of over 2 million", "Known as the City of Light"],
      explanation: "Paris has been the capital of France since 987 AD and is the country's political, economic, and cultural center.",
      image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/watch?v=example1",
      videoTitle: "Paris City Tour"
    }
  },
  {
    id: 2,
    term1: "What is 2 + 2?",
    term2: "4",
    category: "mathematics",
    difficulty: "easy",
    notes: {
      explanation: "Basic addition of two numbers",
      bulletPoints: ["Fundamental arithmetic operation", "Base-10 number system"]
    }
  },
  {
    id: 3,
    term1: "Who wrote Romeo and Juliet?",
    term2: "William Shakespeare",
    category: "literature",
    difficulty: "medium",
    notes: {
      term1Notes: "A famous tragedy about star-crossed lovers",
      term2Notes: "English playwright and poet (1564-1616)",
      explanation: "Shakespeare wrote this play around 1594-1596, and it remains one of his most popular works.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop"
    }
  },
  {
    id: 4,
    term1: "What is the chemical symbol for gold?",
    term2: "Au",
    category: "chemistry",
    difficulty: "medium",
    notes: {
      explanation: "Au comes from the Latin word 'aurum' meaning gold",
      bulletPoints: ["Atomic number 79", "Precious metal", "Highly unreactive"]
    }
  },
  {
    id: 5,
    term1: "What is the largest planet in our solar system?",
    term2: "Jupiter",
    category: "astronomy",
    difficulty: "easy",
    notes: {
      term2Notes: "Jupiter is a gas giant with a mass greater than all other planets combined",
      bulletPoints: ["Has over 80 moons", "Great Red Spot storm", "Made mostly of hydrogen and helium"],
      videoUrl: "https://www.youtube.com/watch?v=example2",
      videoTitle: "Journey to Jupiter"
    }
  }
];

// Dummy data for performance tracking
export const pairPerformance = {
  current: [
    { pairId: 1, isCorrect: true },
    { pairId: 2, isCorrect: true },
    { pairId: 3, isCorrect: false },
    { pairId: 4, isCorrect: true },
    { pairId: 5, isCorrect: false }
  ]
};

// Helper functions
export const getFlaggedIds = () => [3, 5]; // Items 3 and 5 are flagged
export const formatCategoryName = (category) => category.charAt(0).toUpperCase() + category.slice(1);