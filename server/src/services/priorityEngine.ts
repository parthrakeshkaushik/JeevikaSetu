// Priority Scoring Engine for JeevikaSetu
// Transparent, explainable prioritization for humanitarian triage

export interface PriorityEvaluation {
  score: number; // 0 to 100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  rationale: string;
}

export class PriorityEngine {
  public static calculate(params: {
    livelihoodCategories: string[];
    disruptionDurationDays?: number;
    householdSize?: number;
    vulnerabilityFlags?: string[];
    daysPending?: number;
    estimatedLossAmount?: number;
  }): PriorityEvaluation {
    let score = 20; // baseline score
    const factors: string[] = ['आधारभूत स्कोर (+20)'];

    // 1. Criticality of Affected Livelihood Categories (up to +35)
    const cats = params.livelihoodCategories || [];
    let categoryPoints = 0;

    if (cats.includes('LIVESTOCK')) {
      categoryPoints += 20;
      factors.push('पशुधन क्षति/चारा संकट (+20)');
    }
    if (cats.includes('CROP')) {
      categoryPoints += 15;
      factors.push('कृषि/फसल जलमग्नता (+15)');
    }
    if (cats.includes('WAGE_LABOR')) {
      categoryPoints += 15;
      factors.push('दैनिक मजदूरी ठप (+15)');
    }
    if (cats.includes('SHOP_BUSINESS') || cats.includes('INVENTORY')) {
      categoryPoints += 10;
      factors.push('दुकान/अनाज भंडार क्षति (+10)');
    }
    if (cats.includes('FISHERIES') || cats.includes('ARTISAN_TOOLS')) {
      categoryPoints += 10;
      factors.push('कारीगर/मत्स्य आजीविका क्षति (+10)');
    }

    score += Math.min(35, categoryPoints);

    // 2. Vulnerability Indicators (+5 to +20)
    const vulns = params.vulnerabilityFlags || [];
    let vulnPoints = 0;
    if (vulns.includes('WOMEN_HEADED')) {
      vulnPoints += 10;
      factors.push('महिला प्रधान परिवार (+10)');
    }
    if (vulns.includes('LANDLESS_LABOR')) {
      vulnPoints += 10;
      factors.push('भूमिहीन दैनिक मजदूर (+10)');
    }
    if (vulns.includes('MARGINAL_FARMER')) {
      vulnPoints += 5;
      factors.push('सीमांत कृषक (+5)');
    }
    if (vulns.includes('DISABLED') || vulns.includes('ELDERLY')) {
      vulnPoints += 8;
      factors.push('दिव्यांग/बुजुर्ग आश्रित (+8)');
    }
    score += Math.min(20, vulnPoints);

    // 3. Disruption Duration & Household Load (+5 to +15)
    if (params.householdSize && params.householdSize >= 6) {
      score += 5;
      factors.push(`बड़ा परिवार (${params.householdSize} सदस्य) (+5)`);
    }

    if (params.disruptionDurationDays && params.disruptionDurationDays > 7) {
      score += 10;
      factors.push(`दीर्घकालिक अवरोध (>7 दिन) (+10)`);
    } else if (params.disruptionDurationDays && params.disruptionDurationDays >= 3) {
      score += 5;
      factors.push('मध्यम अवरोध (3-7 दिन) (+5)');
    }

    // 4. Aging / Pending Delay Escalation (+5 to +15)
    if (params.daysPending && params.daysPending >= 3) {
      score += 15;
      factors.push(`लंबित विलंब (${params.daysPending} दिन बिना सत्यापन) (+15)`);
    } else if (params.daysPending && params.daysPending >= 1.5) {
      score += 8;
      factors.push(`प्रतीक्षारत 24-48 घंटे (+8)`);
    }

    // Clamp score to 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine level
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'LOW';
    if (score >= 75) {
      level = 'URGENT';
    } else if (score >= 55) {
      level = 'HIGH';
    } else if (score >= 35) {
      level = 'MEDIUM';
    }

    return {
      score,
      level,
      rationale: factors.join(' • '),
    };
  }
}
