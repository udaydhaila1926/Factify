import { GoogleFactCheckReview } from "../types";

export const searchFactChecks = async (query: string, apiKey: string): Promise<GoogleFactCheckReview[]> => {
  if (!apiKey) return [];

  try {
    const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&key=${apiKey}&languageCode=en`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn("Google Fact Check API request failed");
      return [];
    }

    const data = await response.json();
    
    if (!data.claims || data.claims.length === 0) {
      return [];
    }

    // Map the API response to our simplified interface
    return data.claims.flatMap((claim: any) => {
      return (claim.claimReview || []).map((review: any) => ({
        publisher: {
          name: review.publisher?.name || "Unknown Publisher",
          site: review.publisher?.site || "",
        },
        url: review.url,
        title: review.title || claim.text,
        reviewDate: review.reviewDate,
        textualRating: review.textualRating || "Rated",
        languageCode: review.languageCode
      }));
    }).slice(0, 3); // Limit to top 3 relevant checks

  } catch (error) {
    console.error("Error fetching fact checks:", error);
    return [];
  }
};
