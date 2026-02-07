/**
 * Mock Claim Service (NO OpenAI)
 * Hackathon-safe implementation
 */

class ClaimService {
  extractClaim(text) {
    console.log("🧠 Mock claim extraction running");

    if (!text || typeof text !== "string") {
      return "NO_CLAIM_FOUND";
    }

    const claim = text.split(".")[0].trim();

    if (claim.length < 5) {
      return "NO_CLAIM_FOUND";
    }

    return claim;
  }

  isOpinionBased(text) {
    if (!text || typeof text !== "string") return true;

    const opinionWords = [
      "i think",
      "i believe",
      "in my opinion",
      "seems like",
      "probably",
      "might be",
      "could be",
      "best",
      "worst"
    ];

    const lower = text.toLowerCase();

    return opinionWords.some(word => lower.includes(word));
  }
}

module.exports = new ClaimService();
