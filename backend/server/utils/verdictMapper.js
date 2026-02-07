/**
 * Utility for mapping fact check verdicts to standardized scores
 */
class VerdictMapper {
  /**
   * Map various fact check ratings to standardized scores
   * @param {string} verdict - The verdict text from fact check
   * @returns {Object} - Standardized verdict info
   */
  static mapVerdict(verdict) {
    if (!verdict) {
      return {
        status: 'No Existing Check',
        score: 0.5,
        confidence: 'low'
      };
    }

    const lowerVerdict = verdict.toLowerCase();

    // Verified/True verdicts
    if (this.isTrueVerdict(lowerVerdict)) {
      return {
        status: 'Verified',
        score: 1.0,
        confidence: 'high'
      };
    }

    // Contradicted/False verdicts
    if (this.isFalseVerdict(lowerVerdict)) {
      return {
        status: 'Contradicted',
        score: 0.0,
        confidence: 'high'
      };
    }

    // Partially true/mixed verdicts
    if (this.isPartialVerdict(lowerVerdict)) {
      return {
        status: 'Verified',
        score: 0.7,
        confidence: 'medium'
      };
    }

    // Unclear or other verdicts
    return {
      status: 'No Existing Check',
      score: 0.5,
      confidence: 'low'
    };
  }

  /**
   * Check if verdict indicates true/correct
   */
  static isTrueVerdict(verdict) {
    const trueKeywords = [
      'true', 'verified', 'correct', 'accurate', 'confirmed',
      'fact', 'supported', 'valid', 'authentic', 'genuine'
    ];

    return trueKeywords.some(keyword => verdict.includes(keyword));
  }

  /**
   * Check if verdict indicates false/incorrect
   */
  static isFalseVerdict(verdict) {
    const falseKeywords = [
      'false', 'incorrect', 'wrong', 'misleading', 'contradicted',
      'debunked', 'untrue', 'fake', 'fabricated', 'bogus'
    ];

    return falseKeywords.some(keyword => verdict.includes(keyword));
  }

  /**
   * Check if verdict indicates partial/mixed truth
   */
  static isPartialVerdict(verdict) {
    const partialKeywords = [
      'partly', 'partial', 'mixed', 'somewhat', 'partially',
      'inaccurate', 'exaggerated', 'overstated', 'understated'
    ];

    return partialKeywords.some(keyword => verdict.includes(keyword));
  }

  /**
   * Get verdict severity level
   * @param {string} status - Verdict status
   * @returns {string} - Severity level
   */
  static getSeverity(status) {
    switch (status) {
      case 'Verified':
        return 'positive';
      case 'Contradicted':
        return 'negative';
      case 'No Existing Check':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}

module.exports = VerdictMapper;