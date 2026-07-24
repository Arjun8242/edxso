/**
 * Mock Data Generator
 *
 * Generates 100 realistic candidate profiles with randomized scores.
 */

const firstNames = [
  'Aarav', 'Aditi', 'Akshay', 'Ananya', 'Arjun', 'Bhavya', 'Chirag', 'Diya',
  'Esha', 'Farhan', 'Gaurav', 'Harini', 'Ishaan', 'Jaya', 'Karan', 'Lakshmi',
  'Manish', 'Neha', 'Omkar', 'Priya', 'Rahul', 'Sneha', 'Tanvi', 'Uday',
  'Varun', 'Waris', 'Xavier', 'Yash', 'Zara', 'Aditya', 'Bharat', 'Chitra',
  'Deepak', 'Elena', 'Faisal', 'Govind', 'Hema', 'Irfan', 'Jatin', 'Kavya',
  'Lalit', 'Meera', 'Naman', 'Ojas', 'Pallavi', 'Qasim', 'Ritika', 'Sahil',
  'Tanya', 'Umesh',
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Joshi', 'Verma', 'Reddy',
  'Nair', 'Iyer', 'Chopra', 'Malik', 'Das', 'Bhat', 'Rao', 'Mehta',
  'Shah', 'Pillai', 'Menon', 'Thakur', 'Mishra', 'Pandey', 'Chauhan', 'Saxena',
  'Aggarwal', 'Kulkarni', 'Deshmukh', 'Jain', 'Banerjee', 'Mukherjee',
];

const colleges = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'BITS Pilani', 'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'IIIT Hyderabad',
  'DTU Delhi', 'NSUT Delhi', 'VIT Vellore', 'SRM Chennai', 'MIT Manipal',
  'PES University', 'RV College', 'RVCE Bangalore', 'Jadavpur University',
  'Anna University', 'COEP Pune', 'VJTI Mumbai', 'Thapar University',
  'Amity University', 'Manipal IT', 'Christ University', 'BMS College',
  'DAIICT Gandhinagar', 'IIIT Bangalore', 'LNM Jaipur',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCandidate(id) {
  const statusRoll = Math.random();
  let status;
  if (statusRoll < 0.4) status = 'pending';
  else if (statusRoll < 0.7) status = 'reviewed';
  else if (statusRoll < 0.9) status = 'shortlisted';
  else status = 'rejected';

  return {
    id,
    name: `${pickRandom(firstNames)} ${pickRandom(lastNames)}`,
    email: `candidate${id}@example.com`,
    college: pickRandom(colleges),
    assignmentScore: randomInt(20, 100),
    videoScore: randomInt(15, 100),
    atsScore: randomInt(10, 100),
    githubScore: randomInt(10, 100),
    communicationScore: randomInt(15, 100),
    status,
    // Sub-evaluation scores (Assignment)
    assignmentEval: {
      uiQuality: randomInt(1, 10),
      componentStructure: randomInt(1, 10),
      stateHandling: randomInt(1, 10),
      edgeCaseHandling: randomInt(1, 10),
      responsiveness: randomInt(1, 10),
      accessibilityAwareness: randomInt(1, 10),
    },
    // Sub-evaluation scores (Video)
    videoEval: {
      clarity: randomInt(1, 10),
      confidence: randomInt(1, 10),
      architectureExplanation: randomInt(1, 10),
      tradeoffReasoning: randomInt(1, 10),
      communicationStrength: randomInt(1, 10),
    },
    // Timestamp-based video notes
    videoNotes: [],
    appliedAt: new Date(
      2026,
      randomInt(0, 3),
      randomInt(1, 28)
    ).toISOString(),
  };
}

export function generateMockCandidates(count = 100) {
  const candidates = [];
  for (let i = 1; i <= count; i++) {
    candidates.push(generateCandidate(i));
  }
  return candidates;
}
