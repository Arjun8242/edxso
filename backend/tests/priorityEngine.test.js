import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculatePriority } from "../src/utils/priorityEngine.js";

describe("calculatePriority", () => {
  it("should compute correct weighted score with known inputs", () => {
    const result = calculatePriority({
      assignment_score: 100,
      video_score: 100,
      ats_score: 100,
      github_score: 100,
      communication_score: 100,
    });
    assert.equal(result.score, 100);
    assert.equal(result.bucket, "P0");
  });

  it("should compute correct weighted score with all zeros", () => {
    const result = calculatePriority({
      assignment_score: 0,
      video_score: 0,
      ats_score: 0,
      github_score: 0,
      communication_score: 0,
    });
    assert.equal(result.score, 0);
    assert.equal(result.bucket, "P3");
  });

  it("should apply correct weights: 0.30 + 0.25 + 0.20 + 0.15 + 0.10 = 1.00", () => {

    const score = 80;
    const result = calculatePriority({
      assignment_score: score,
      video_score: score,
      ats_score: score,
      github_score: score,
      communication_score: score,
    });
    assert.equal(result.score, score);
  });

  it("should compute correct score with mixed inputs", () => {

    const result = calculatePriority({
      assignment_score: 90,
      video_score: 80,
      ats_score: 70,
      github_score: 60,
      communication_score: 50,
    });
    assert.equal(result.score, 75);
    assert.equal(result.bucket, "P1");
  });

  it("should assign P0 bucket for score >= 85", () => {
    const result = calculatePriority({
      assignment_score: 90,
      video_score: 90,
      ats_score: 90,
      github_score: 90,
      communication_score: 90,
    });
    assert.equal(result.score, 90);
    assert.equal(result.bucket, "P0");
  });

  it("should assign P0 at boundary score = 85", () => {

    const result = calculatePriority({
      assignment_score: 85,
      video_score: 85,
      ats_score: 85,
      github_score: 85,
      communication_score: 85,
    });
    assert.equal(result.score, 85);
    assert.equal(result.bucket, "P0");
  });

  it("should assign P1 for score in [70, 84.99]", () => {
    const result = calculatePriority({
      assignment_score: 80,
      video_score: 80,
      ats_score: 80,
      github_score: 80,
      communication_score: 80,
    });
    assert.equal(result.score, 80);
    assert.equal(result.bucket, "P1");
  });

  it("should assign P1 at boundary score = 70", () => {
    const result = calculatePriority({
      assignment_score: 70,
      video_score: 70,
      ats_score: 70,
      github_score: 70,
      communication_score: 70,
    });
    assert.equal(result.score, 70);
    assert.equal(result.bucket, "P1");
  });

  it("should assign P2 for score in [50, 69.99]", () => {
    const result = calculatePriority({
      assignment_score: 60,
      video_score: 60,
      ats_score: 60,
      github_score: 60,
      communication_score: 60,
    });
    assert.equal(result.score, 60);
    assert.equal(result.bucket, "P2");
  });

  it("should assign P2 at boundary score = 50", () => {
    const result = calculatePriority({
      assignment_score: 50,
      video_score: 50,
      ats_score: 50,
      github_score: 50,
      communication_score: 50,
    });
    assert.equal(result.score, 50);
    assert.equal(result.bucket, "P2");
  });

  it("should assign P3 for score < 50", () => {
    const result = calculatePriority({
      assignment_score: 30,
      video_score: 30,
      ats_score: 30,
      github_score: 30,
      communication_score: 30,
    });
    assert.equal(result.score, 30);
    assert.equal(result.bucket, "P3");
  });

  it("should assign P3 at boundary score = 49.99", () => {

    const result = calculatePriority({
      assignment_score: 49,
      video_score: 50,
      ats_score: 50,
      github_score: 50,
      communication_score: 50,
    });
    assert.equal(result.score, 49.7);
    assert.equal(result.bucket, "P3");
  });

  it("should handle float scores correctly", () => {
    const result = calculatePriority({
      assignment_score: 85.5,
      video_score: 72.3,
      ats_score: 91.7,
      github_score: 68.2,
      communication_score: 55.9,
    });

    assert.equal(result.score, 77.89);
    assert.equal(result.bucket, "P1");
  });

  it("should round to 2 decimal places", () => {
    const result = calculatePriority({
      assignment_score: 33,
      video_score: 33,
      ats_score: 33,
      github_score: 33,
      communication_score: 33,
    });
    assert.equal(result.score, 33);
  });
});
