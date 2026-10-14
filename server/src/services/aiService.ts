// Modular AI and Natural Language Processing Service for JeevikaSetu
// Provides deterministic entity extraction, category suggestions, and duplicate detection
// Includes clear safeguards and explainability labels

export interface ExtractedEntities {
  suggestedCategories: string[];
  detectedAssets: string[];
  confidence: number;
  extractedKeywords: string[];
  disclaimer: string;
}

export class AiService {
  /**
   * Deterministic entity and category extraction from Hindi/Bhojpuri/English speech transcripts
   */
  public static extractFromTranscript(text: string): ExtractedEntities {
    const lower = text.toLowerCase();
    const suggestedCategories: string[] = [];
    const detectedAssets: string[] = [];
    const keywords: string[] = [];

    // Crop loss keywords in Hindi / Bhojpuri
    const cropKeywords = ['फसल', 'धान', 'मक्का', 'गेहूं', 'बीघा', 'खेत', 'सब्जी', 'डूब', 'गल', 'पानी भर', 'पइध'];
    if (cropKeywords.some((k) => lower.includes(k))) {
      suggestedCategories.push('CROP');
      keywords.push('कृषि/फसल');
      if (lower.includes('धान')) detectedAssets.push('धान (Paddy)');
      if (lower.includes('मक्का')) detectedAssets.push('मक्का (Maize)');
      if (lower.includes('बीघा') || lower.includes('कट्ठा')) detectedAssets.push('कृषि भूमि (Land)');
    }

    // Livestock keywords
    const livestockKeywords = ['गाय', 'भैंस', 'बैल', 'बकरी', 'मवेशी', 'चारा', 'पशु', 'बीमार', 'बह गई', 'मर गई', 'छागल'];
    if (livestockKeywords.some((k) => lower.includes(k))) {
      suggestedCategories.push('LIVESTOCK');
      keywords.push('पशुधन/चारा');
      if (lower.includes('गाय') || lower.includes('गऊ')) detectedAssets.push('गाय (Cow)');
      if (lower.includes('भैंस')) detectedAssets.push('भैंस (Buffalo)');
      if (lower.includes('बकरी') || lower.includes('छागल')) detectedAssets.push('बकरी (Goat)');
      if (lower.includes('चारा')) detectedAssets.push('पशु चारा संकट (Fodder Crisis)');
    }

    // Equipment keywords
    const equipKeywords = ['पम्पसेट', 'पंपसेट', 'ट्रैक्टर', 'मोटर', 'मशीन', 'औजार', 'स्प्रेयर'];
    if (equipKeywords.some((k) => lower.includes(k))) {
      suggestedCategories.push('EQUIPMENT');
      keywords.push('कृषि उपकरण');
      detectedAssets.push('पम्पसेट/मशीनरी');
    }

    // Shop and business keywords
    const shopKeywords = ['दुकान', 'गुमटी', 'किराना', 'धंधा', 'व्यापार', 'सामान भीग', 'गल्ला'];
    if (shopKeywords.some((k) => lower.includes(k))) {
      suggestedCategories.push('SHOP_BUSINESS');
      keywords.push('दुकान/व्यवसाय');
      detectedAssets.push('दुकान भंडार/इन्वेंट्री');
    }

    // Wage labor interruption keywords
    const laborKeywords = ['मजदूरी', 'मजूरी', 'काम बंद', 'रोजगार', 'काम नहीं', 'दिहाड़ी'];
    if (laborKeywords.some((k) => lower.includes(k))) {
      suggestedCategories.push('WAGE_LABOR');
      keywords.push('दैनिक मजदूरी');
      detectedAssets.push('दैनिक रोजगार अवरोध');
    }

    // Fisheries
    const fishKeywords = ['मछली', 'पोखरा', 'तालाब', 'जाल', 'जीरा'];
    if (fishKeywords.some((k) => lower.includes(k))) {
      suggestedCategories.push('FISHERIES');
      keywords.push('मत्स्य पालन');
      detectedAssets.push('मछली पालन पोखरा');
    }

    // Fallback if none matched
    if (suggestedCategories.length === 0) {
      suggestedCategories.push('OTHER');
      keywords.push('सामान्य बाढ़ क्षति');
    }

    return {
      suggestedCategories: Array.from(new Set(suggestedCategories)),
      detectedAssets: Array.from(new Set(detectedAssets)),
      confidence: 0.88,
      extractedKeywords: keywords,
      disclaimer: 'यह सुझावित श्रेणियां हैं। अंतिम निर्णय नागरिक और प्रशासनिक सत्यापन पर आधारित होगा। (AI suggestions only)',
    };
  }

  /**
   * Duplicate detection check for administrative review
   */
  public static checkPossibleDuplicate(existingReports: Array<{ id: string; citizenPhone: string; village: string; livelihoodCategories: string }>, newReport: { citizenPhone: string; village: string }): { isDuplicateCandidate: boolean; matchedReportId?: string; reason?: string } {
    const match = existingReports.find(
      (r) => r.citizenPhone === newReport.citizenPhone && r.village.toLowerCase() === newReport.village.toLowerCase()
    );

    if (match) {
      return {
        isDuplicateCandidate: true,
        matchedReportId: match.id,
        reason: `समान मोबाइल नंबर (${newReport.citizenPhone}) और गांव (${newReport.village}) में पूर्व रिपोर्ट पाई गई।`,
      };
    }

    return { isDuplicateCandidate: false };
  }
}
