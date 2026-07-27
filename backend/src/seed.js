/**
 * Seed script — generates 100 candidates with randomized data,
 * evaluations (~60%), and notes (~40%).
 * PRD §8: Normal distribution ~65, evaluations+notes seeding, idempotent.
 * Run with: npm run seed
 */
import "dotenv/config";
import pool from "./config/db.js";
import initDb from "./config/initDb.js";
import { calculatePriority } from "./utils/priorityEngine.js";

const firstNames = [
  "Aarav", "Riya", "Aditya", "Neha", "Rahul", "Sneha", "Karan", "Pooja", "Amit", "Anjali",
  "Vikas", "Priya", "Rohit", "Kavya", "Arjun", "Meera", "Sahil", "Nisha", "Manish", "Simran",
  "Deepak", "Isha", "Yash", "Divya", "Harsh", "Tanvi", "Mohit", "Ritika", "Akash", "Shreya",
  "Nitin", "Payal", "Gaurav", "Komal", "Varun", "Alok", "Ruchi", "Sumit", "Swati", "Ankit",
  "Preeti", "Ramesh", "Sonal", "Ajay", "Neeraj", "Pankaj", "Seema", "Vivek", "Rekha", "Tarun",
];

const lastNames = [
  "Sharma", "Verma", "Singh", "Gupta", "Yadav", "Kapoor", "Mehta", "Kumar", "Mishra", "Patel",
  "Nair", "Reddy", "Das", "Iyer", "Khan", "Agarwal", "Tiwari", "Kaur", "Chauhan", "Jain",
  "Thakur", "Bansal", "Vardhan", "Joshi", "Arora", "Sinha", "Paul", "Saxena", "Roy", "Pandey",
];

const colleges = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "NIT Trichy", "NIT Warangal",
  "DTU", "BITS Pilani", "VIT", "IIIT Hyderabad", "NIT Surathkal",
  "IIT Kanpur", "IIT Kharagpur", "NSUT", "MAIT", "IGDTUW",
];

const statuses = ["pending", "pending", "pending", "pending", "reviewed", "reviewed", "shortlisted"];

const reviewerNames = [
  "Recruiter A", "Senior HR", "Tech Lead", "Hiring Manager",
  "Panel Member 1", "Panel Member 2", "CTO Office",
];

const sampleNotes = [
  "Good communication skills, articulate responses.",
  "Strong technical fundamentals, needs improvement in system design.",
  "Impressive portfolio, GitHub profile well-maintained.",
  "2:30 - Great explanation of state management approach.",
  "1:15 - Struggled with edge case scenario, recovered well.",
  "Solid understanding of React component lifecycle.",
  "Needs more experience with backend technologies.",
  "4:00 - Excellent tradeoff discussion on database choice.",
  "Very confident presentation, clear architecture explanation.",
  "Could improve accessibility awareness in UI components.",
  "3:45 - Mentioned interesting approach to error handling.",
  "Strong problem-solving skills demonstrated in assignment.",
];

/**
 * Generate a normally distributed random number centered at mean with given stddev,
 * clipped to [min, max]. Uses Box-Muller transform.
 * PRD §8: "normal distribution centered ~65, clipped to [0,100]"
 */
function normalRandom(mean = 65, stddev = 15, min = 0, max = 100) {
  let u1 = Math.random();
  let u2 = Math.random();
  // Avoid log(0)
  while (u1 === 0) u1 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const value = mean + z * stddev;
  return Math.round(Math.max(min, Math.min(max, value)) * 100) / 100;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCandidate() {
  const firstName = pickRandom(firstNames);
  const lastName = pickRandom(lastNames);
  const name = `${firstName} ${lastName}`;
  const college = pickRandom(colleges);
  const status = pickRandom(statuses);

  const assignment_score = normalRandom(65, 15);
  const video_score = normalRandom(65, 15);
  const ats_score = normalRandom(65, 15);
  const github_score = normalRandom(65, 15);
  const communication_score = normalRandom(65, 15);

  const { score, bucket } = calculatePriority({
    assignment_score,
    video_score,
    ats_score,
    github_score,
    communication_score,
  });

  return {
    name,
    college,
    assignment_score,
    video_score,
    ats_score,
    github_score,
    communication_score,
    priority_score: score,
    priority_bucket: bucket,
    status,
  };
}

function generateEvaluation() {
  return {
    ui_quality: randomInt(20, 95),
    state_handling: randomInt(20, 95),
    edge_case_thinking: randomInt(20, 95),
    architecture_understanding: randomInt(20, 95),
    communication: randomInt(20, 95),
    confidence: randomInt(20, 95),
    accessibility_awareness: randomInt(20, 95),
  };
}

async function seed() {
  try {
    console.log("🌱 Starting seed...\n");

    // Initialize tables
    await initDb();

    // Clear existing data (idempotent per PRD §8)
    await pool.query("DELETE FROM notes");
    await pool.query("DELETE FROM evaluations");
    await pool.query("DELETE FROM candidates");
    await pool.query("ALTER SEQUENCE candidates_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE evaluations_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE notes_id_seq RESTART WITH 1");
    console.log("🗑️  Cleared existing data\n");

    // Generate and insert 100 candidates
    const candidateIds = [];
    for (let i = 0; i < 100; i++) {
      const c = generateCandidate();
      const result = await pool.query(
        `INSERT INTO candidates (name, college, assignment_score, video_score, ats_score, github_score, communication_score, priority_score, priority_bucket, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          c.name,
          c.college,
          c.assignment_score,
          c.video_score,
          c.ats_score,
          c.github_score,
          c.communication_score,
          c.priority_score,
          c.priority_bucket,
          c.status,
        ]
      );
      candidateIds.push(result.rows[0].id);
    }

    console.log(`✅ Inserted ${candidateIds.length} candidates\n`);

    // PRD §8: Attach evaluations to ~60% of candidates
    let evalCount = 0;
    for (const id of candidateIds) {
      if (Math.random() < 0.6) {
        const evalData = generateEvaluation();
        await pool.query(
          `INSERT INTO evaluations (candidate_id, ui_quality, state_handling, edge_case_thinking, architecture_understanding, communication, confidence, accessibility_awareness)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, evalData.ui_quality, evalData.state_handling, evalData.edge_case_thinking, evalData.architecture_understanding, evalData.communication, evalData.confidence, evalData.accessibility_awareness]
        );
        evalCount++;
      }
    }

    console.log(`✅ Inserted ${evalCount} evaluations (~${Math.round(evalCount / candidateIds.length * 100)}% of candidates)\n`);

    // PRD §8: Attach notes to ~40% of candidates
    let noteCount = 0;
    for (const id of candidateIds) {
      if (Math.random() < 0.4) {
        const numNotes = randomInt(1, 3);
        for (let n = 0; n < numNotes; n++) {
          await pool.query(
            `INSERT INTO notes (candidate_id, reviewer, note) VALUES ($1, $2, $3)`,
            [id, pickRandom(reviewerNames), pickRandom(sampleNotes)]
          );
          noteCount++;
        }
      }
    }

    console.log(`✅ Inserted ${noteCount} notes\n`);

    // Print summary
    const summary = await pool.query(`
      SELECT
        priority_bucket,
        COUNT(*) AS count
      FROM candidates
      GROUP BY priority_bucket
      ORDER BY priority_bucket
    `);

    console.log("📊 Priority Distribution:");
    for (const row of summary.rows) {
      console.log(`   ${row.priority_bucket}: ${row.count} candidates`);
    }

    const statusSummary = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM candidates
      GROUP BY status
      ORDER BY status
    `);

    console.log("\n📋 Status Distribution:");
    for (const row of statusSummary.rows) {
      console.log(`   ${row.status}: ${row.count} candidates`);
    }

    console.log("\n🎉 Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
