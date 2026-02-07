class ScoreService {
  calculateConfidence({
    claimType,
    evidenceAgreement,
    sourceCredibility,
    factCheckExists,
    biasLevel
  }) {
    let confidence = 0;

    if (claimType === 'FOUNDATIONAL') {
      confidence =
        0.6 * evidenceAgreement +
        0.4 * sourceCredibility;
    }

    if (claimType === 'GENERAL') {
      confidence =
        0.5 * evidenceAgreement +
        0.35 * sourceCredibility +
        0.15 * (factCheckExists ? 1 : 0);
    }

    if (claimType === 'COMPLEX') {
      confidence =
        0.55 * evidenceAgreement +
        0.30 * sourceCredibility +
        0.15 * (factCheckExists ? 1 : 0);
    }

    // Bias penalty
    const biasMultiplier =
      biasLevel === 'High' ? 0.6 :
      biasLevel === 'Medium' ? 0.8 :
      1.0;

    confidence *= biasMultiplier;

    // Clamp
    confidence = Math.max(0, Math.min(1, confidence));

    return Math.round(confidence * 100);
  }

  getCredibilityLevel(score) {
    if (score >= 75) return 'High';
    if (score >= 45) return 'Medium';
    return 'Low';
  }
}

module.exports = new ScoreService();
