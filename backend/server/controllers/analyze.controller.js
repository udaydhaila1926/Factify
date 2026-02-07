const claimTypeService = require('../services/claimType.service');
const claimService = require('../services/claim.service');
const factCheckService = require('../services/factcheck.service');
const evidenceService = require('../services/evidence.service');
const biasService = require('../services/bias.service');
const llmVerifier = require('../services/llmVerifier.service');

const analyzeContent = async (req, res) => {
  try {
    const { content, url } = req.body;

    if (!content && !url) {
      return res.status(400).json({ error: 'Either content or url must be provided' });
    }

    let textContent = content;

    // URL extraction
    if (url) {
      try {
        textContent = await claimService.extractFromUrl(url);
      } catch {
        return res.status(400).json({ error: 'Failed to extract content from URL' });
      }
    }

    // Opinion detection
    if (claimService.isOpinionBased(textContent)) {
      return res.json({
        claim: null,
        verdict: 'Opinion',
        truthScore: 50,
        credibilityLevel: 'Medium',
        claimType: 'OPINION',
        biasLevel: 'High',
        explanation:
          'This content expresses subjective opinions rather than verifiable factual claims.',
        supportingSources: [],
        disclaimer:
          'This system assesses credibility based on available evidence and does not assert absolute truth.'
      });
    }

    // 1️⃣ Extract claim
    const claim = claimService.extractClaim(textContent);
    console.log('📌 Claim:', claim);

    // 2️⃣ Detect claim type (FACTUAL / GENERAL / NUMERIC / EVENT)
    const claimType = claimTypeService.detectType(claim);

    // 3️⃣ Collect signals
    const [factCheckResult, evidenceSources, biasLevel] = await Promise.all([
      factCheckService.checkClaim(claim),
      evidenceService.gatherEvidence(claim),
      biasService.detectBias(textContent)
    ]);

    const evidenceTexts = evidenceSources
      .map(src => src.snippet)
      .filter(Boolean);

    // 4️⃣ LLM reasoning (core authority)
    const llmResult = await llmVerifier.verifyClaim({
      claim,
      evidenceTexts
    });

    /*
      llmResult = {
        verdict: Supported | Contradicted | Unverified
        confidence: 0–1
        reasoning: string
      }
    */

    // 5️⃣ FINAL VERDICT (LLM first, FactCheck as evidence)
    let finalVerdict = llmResult.verdict;

    if (factCheckResult.status === 'Verified') {
      finalVerdict = 'Supported';
    }
    if (factCheckResult.status === 'Contradicted') {
      finalVerdict = 'Contradicted';
    }

    // 6️⃣ TRUTH SCORE (EXPLAINABLE FORMULA)
    let truthScore;

    if (finalVerdict === 'Supported') {
      truthScore = 70 + llmResult.confidence * 30;
    } else if (finalVerdict === 'Contradicted') {
      truthScore = (1 - llmResult.confidence) * 40;
    } else {
      // Unverified
      truthScore = 45 + llmResult.confidence * 10;
    }

    // Claim-type adjustment
    if (claimType === 'GENERAL') truthScore += 5;
    if (claimType === 'NUMERIC') truthScore -= 5;

    // Bias penalty
    if (biasLevel === 'High') truthScore -= 10;

    truthScore = Math.max(0, Math.min(100, Math.round(truthScore)));

    // Credibility bucket
    let credibilityLevel = 'Low';
    if (truthScore >= 75) credibilityLevel = 'High';
    else if (truthScore >= 50) credibilityLevel = 'Medium';

    return res.json({
      claim,
      verdict: finalVerdict,
      truthScore,
      credibilityLevel,
      claimType,
      biasLevel,
      factCheckStatus: factCheckResult.status,
      explanation: llmResult.reasoning,
      supportingSources: evidenceSources.map(src => src.url),
      disclaimer:
        'This system assesses credibility based on available evidence and does not assert absolute truth.'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error during analysis' });
  }
};

module.exports = { analyzeContent };
