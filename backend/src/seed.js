/**
 * Seed script — generates 100 candidates with randomized data.
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

  const assignment_score = randomInt(30, 100);
  const video_score = randomInt(30, 100);
  const ats_score = randomInt(30, 100);
  const github_score = randomInt(30, 100);
  const communication_score = randomInt(30, 100);

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

async function seed() {
  try {
    console.log("🌱 Starting seed...\n");

    // Initialize tables
    await initDb();

    // Clear existing data
    await pool.query("DELETE FROM notes");
    await pool.query("DELETE FROM evaluations");
    await pool.query("DELETE FROM candidates");
    await pool.query("ALTER SEQUENCE candidates_id_seq RESTART WITH 1");
    console.log("🗑️  Cleared existing data\n");

    // Generate and insert 100 candidates
    const candidates = [];
    for (let i = 0; i < 100; i++) {
      candidates.push(generateCandidate());
    }

    for (const c of candidates) {
      await pool.query(
        `INSERT INTO candidates (name, college, assignment_score, video_score, ats_score, github_score, communication_score, priority_score, priority_bucket, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
    }

    console.log(`✅ Inserted ${candidates.length} candidates\n`);

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
