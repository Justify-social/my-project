// Test script to demonstrate audience data transformation

// Backend data format (what we receive from the database)
const backendData = {
  id: 'b6b80439-274f-4bc1-8704-c290905eca48',
  // Audience data is split across multiple properties
  demographics: {
    ageDistribution: {
      age1824: 0,
      age2534: 0,
      age3544: 0,
      age4554: 0,
      age5564: 0,
      age65plus: 100
    },
    gender: ['Female'],
    otherGender: "",
    educationLevel: "some_college",
    jobTitles: [],
    incomeLevel: 100000
  },
  locations: [
    { location: 'london' }
  ],
  targeting: {
    screeningQuestions: [
      { question: 'london' }
    ],
    languages: [
      { language: 'German' }
    ]
  },
  competitors: ['london']
};

// Normalized data for frontend (what we want to use in Step3Content)
const normalizedData = {
  ...backendData,
  audience: {
    location: backendData.locations.map(loc => loc.location),
    ageDistribution: backendData.demographics.ageDistribution,
    gender: backendData.demographics.gender,
    otherGender: backendData.demographics.otherGender,
    screeningQuestions: backendData.targeting.screeningQuestions.map(q => q.question),
    languages: backendData.targeting.languages.map(l => l.language),
    educationLevel: backendData.demographics.educationLevel,
    jobTitles: backendData.demographics.jobTitles,
    incomeLevel: backendData.demographics.incomeLevel,
    competitors: backendData.competitors
  }
};

console.log('Backend data structure:');
console.log(JSON.stringify(backendData, null, 2));

console.log('\nNormalized data for frontend:');
console.log(JSON.stringify(normalizedData, null, 2));

// Demonstration of how Step3Content will extract data
console.log('\nStep3Content Initial Values:');
const initialValues = {
  location: normalizedData.audience.location,
  ageDistribution: normalizedData.audience.ageDistribution,
  gender: normalizedData.audience.gender,
  otherGender: normalizedData.audience.otherGender,
  screeningQuestions: normalizedData.audience.screeningQuestions,
  languages: normalizedData.audience.languages,
  educationLevel: normalizedData.audience.educationLevel,
  jobTitles: normalizedData.audience.jobTitles,
  incomeLevel: normalizedData.audience.incomeLevel,
  competitors: normalizedData.audience.competitors
};
console.log(JSON.stringify(initialValues, null, 2)); 