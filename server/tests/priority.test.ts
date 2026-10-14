import { describe, it, expect } from 'vitest';
import { PriorityEngine } from '../src/services/priorityEngine.js';

describe('PriorityEngine', () => {
  it('calculates baseline score for minimal report', () => {
    const result = PriorityEngine.calculate({
      livelihoodCategories: ['OTHER'],
    });

    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.level).toBe('LOW');
    expect(result.rationale).toContain('आधारभूत');
  });

  it('boosts priority for livestock loss and fodder crisis', () => {
    const result = PriorityEngine.calculate({
      livelihoodCategories: ['LIVESTOCK'],
      householdSize: 6,
    });

    // Baseline 20 + Livestock 20 + Household 5 = 45
    expect(result.score).toBeGreaterThanOrEqual(45);
    expect(['MEDIUM', 'HIGH', 'URGENT']).toContain(result.level);
    expect(result.rationale).toContain('पशुधन');
  });

  it('assigns URGENT level for severe multiple vulnerabilities and disruption', () => {
    const result = PriorityEngine.calculate({
      livelihoodCategories: ['CROP', 'LIVESTOCK', 'WAGE_LABOR'],
      vulnerabilityFlags: ['WOMEN_HEADED', 'LANDLESS_LABOR'],
      disruptionDurationDays: 10,
      householdSize: 7,
      daysPending: 4,
    });

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.level).toBe('URGENT');
    expect(result.rationale).toContain('महिला प्रधान परिवार');
    expect(result.rationale).toContain('भूमिहीन');
  });

  it('clamps priority score within 0 to 100 bounds', () => {
    const result = PriorityEngine.calculate({
      livelihoodCategories: ['CROP', 'LIVESTOCK', 'WAGE_LABOR', 'SHOP_BUSINESS', 'EQUIPMENT'],
      vulnerabilityFlags: ['WOMEN_HEADED', 'LANDLESS_LABOR', 'MARGINAL_FARMER', 'DISABLED'],
      disruptionDurationDays: 30,
      householdSize: 12,
      daysPending: 10,
    });

    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
