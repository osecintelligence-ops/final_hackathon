
export const askIQureAi = async (question: string): Promise<string> => {
  const lowerQ = question.toLowerCase();

  // Local knowledge base fallback for when API is unreachable
  const getFallbackAnswer = (q: string) => {
    if (q.includes('zone') || q.includes('color') || q.includes('risk')) {
      return "HealthIQure has 3 Risk Zones based on your Health Score:\n\n🟢 Green Zone (Score 80+): Earn -5% to -20% Premium Discount.\n🟡 Yellow Zone (Score 50-79): Standard Premium Rates.\n🔴 Red Zone (Score <50): Reduced discount. Note: You never pay more than the Base Premium.";
    }
    if (q.includes('price') || q.includes('cost') || q.includes('premium')) {
      return "Premiums are dynamic! They start at ₹800-₹4500/mo base, but you can reduce this by maintaining a high Health Score through daily steps and healthy vitals.";
    }
    if (q.includes('pm-jay') || q.includes('government') || q.includes('scheme')) {
      return "Ayushman Bharat PM-JAY provides ₹5 Lakh health cover per family per year for secondary and tertiary care hospitalization. It covers over 10 crore families.";
    }
    if (q.includes('hello') || q.includes('hi')) {
       return "Hello! I am IQureAi. Ask me about Health Zones, Premiums, or Government Schemes.";
    }
    return "I am currently offline due to high traffic, but here is a quick tip: Maintain a Health Score above 80 to stay in the Green Zone and save money!";
  };

  try {
    // Attempt to reach the RAG API
    const response = await fetch('https://puneet666-rag-pdf-api.hf.space/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.answer || getFallbackAnswer(lowerQ);
  } catch (error) {
    console.warn("IQureAi API Error (Using Fallback):", error);
    // Return fallback answer instead of a generic error message
    return getFallbackAnswer(lowerQ);
  }
};
