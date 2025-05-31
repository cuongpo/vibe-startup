import axios from 'axios';

// Define the API base URL and endpoints
const API_URL = 'https://api.perplexity.ai';

// Interface for the startup idea input
export interface StartupIdeaInput {
  idea: string;
  problem: string;
  problemStatement: string;
  solution: string;
  targetAudience?: string;
  additionalContext?: string;
}

// Interface for the validation report response
export interface ValidationReport {
  // We've simplified to just use the raw report data
  rawReportData: string;
}

/**
 * Helper function to create a default validation report structure
 * Used when the API response cannot be properly parsed
 */
const createDefaultReport = (): ValidationReport => {
  return {
    // Just provide the raw report data for simplified output
    rawReportData: JSON.stringify({ error: "Failed to get a valid response from the AI" })
  };
};

/**
 * Helper function to ensure the validation report has the expected structure
 * This is a simplified version that just returns the data with rawReportData
 */
const ensureValidReportStructure = (data: any): ValidationReport => {
  // Just ensure we have rawReportData
  if (!data.rawReportData) {
    data.rawReportData = JSON.stringify(data);
  }
  
  return data as ValidationReport;
};

/**
 * Helper function to extract structured sections from markdown content
 */
const extractSectionsFromMarkdown = (markdown: string): any => {
  const sections: any = {
    problemStatement: '',
    painPoints: [],
    marketInfo: {
      size: '',
      growth: '',
      trends: [],
      audience: ''
    },
    competitorInfo: {
      directCompetitors: [],
      indirectCompetitors: [],
      advantage: ''
    },
    recommendations: {
      nextSteps: [],
      pivots: [],
      risks: []
    }
  };
  
  // Extract problem statement
  const problemMatch = markdown.match(/problem statement[:\s-]+([\s\S]*?)(?=\n#|$)/i);
  if (problemMatch && problemMatch[1]) {
    sections.problemStatement = problemMatch[1].trim();
  }
  
  // Extract pain points
  const painPointsMatch = markdown.match(/pain points[:\s-]+([\s\S]*?)(?=\n#|$)/i);
  if (painPointsMatch && painPointsMatch[1]) {
    sections.painPoints = painPointsMatch[1]
      .split(/\n[-*]|\n\d+\./) // Split by bullet points or numbered items
      .map(point => point.trim())
      .filter(point => point.length > 0);
  }
  
  // Extract market information
  const marketMatch = markdown.match(/market (analysis|size)[:\s-]+([\s\S]*?)(?=\n#|$)/i);
  if (marketMatch && marketMatch[2]) {
    const marketText = marketMatch[2];
    
    // Extract market size
    const sizeMatch = marketText.match(/market size[:\s-]+([\s\S]*?)(?=growth|$)/i);
    if (sizeMatch && sizeMatch[1]) {
      sections.marketInfo.size = sizeMatch[1].trim();
    }
    
    // Extract growth rate
    const growthMatch = marketText.match(/growth (rate)?[:\s-]+([\s\S]*?)(?=trends|$)/i);
    if (growthMatch && growthMatch[2]) {
      sections.marketInfo.growth = growthMatch[2].trim();
    }
    
    // Extract trends
    const trendsMatch = marketText.match(/trends[:\s-]+([\s\S]*?)(?=audience|$)/i);
    if (trendsMatch && trendsMatch[1]) {
      sections.marketInfo.trends = trendsMatch[1]
        .split(/\n[-*]|\n\d+\./) // Split by bullet points or numbered items
        .map(trend => trend.trim())
        .filter(trend => trend.length > 0);
    }
    
    // Extract target audience
    const audienceMatch = marketText.match(/target audience[:\s-]+([\s\S]*?)(?=$)/i);
    if (audienceMatch && audienceMatch[1]) {
      sections.marketInfo.audience = audienceMatch[1].trim();
    }
  }
  
  // Extract recommendations, next steps, etc.
  const recsMatch = markdown.match(/recommendations[:\s-]+([\s\S]*?)(?=\n#|$)/i);
  if (recsMatch && recsMatch[1]) {
    const recsText = recsMatch[1];
    
    // Extract next steps
    const stepsMatch = recsText.match(/next steps[:\s-]+([\s\S]*?)(?=pivots|$)/i);
    if (stepsMatch && stepsMatch[1]) {
      sections.recommendations.nextSteps = stepsMatch[1]
        .split(/\n[-*]|\n\d+\./) // Split by bullet points or numbered items
        .map(step => step.trim())
        .filter(step => step.length > 0);
    }
    
    // Extract potential pivots
    const pivotsMatch = recsText.match(/potential pivots[:\s-]+([\s\S]*?)(?=risks|$)/i);
    if (pivotsMatch && pivotsMatch[1]) {
      sections.recommendations.pivots = pivotsMatch[1]
        .split(/\n[-*]|\n\d+\./) // Split by bullet points or numbered items
        .map(pivot => pivot.trim())
        .filter(pivot => pivot.length > 0);
    }
    
    // Extract key risks
    const risksMatch = recsText.match(/key risks[:\s-]+([\s\S]*?)(?=$)/i);
    if (risksMatch && risksMatch[1]) {
      sections.recommendations.risks = risksMatch[1]
        .split(/\n[-*]|\n\d+\./) // Split by bullet points or numbered items
        .map(risk => risk.trim())
        .filter(risk => risk.length > 0);
    }
  }
  
  return sections;
};

/**
 * Helper function to process raw text response when JSON parsing fails
 */
/**
 * Format report data from a JSON response
 */
const formatReportFromDirectJson = (data: any): ValidationReport => {
  // With the simplified approach, we just store the raw JSON data
  return {
    rawReportData: JSON.stringify(data, null, 2)
  };
};

/**
 * Helper function to process raw text response when JSON parsing fails
 */
const processRawResponse = (text: string): ValidationReport => {
  // With the simplified approach, we just store the raw text
  return {
    rawReportData: text
  };
};

/**
 * Interface for the market size report
 */
export interface MarketSizeReport {
  rawReportData?: string;
}

/**
 * Interface for the competitor analysis report
 */
export interface CompetitorAnalysisReport {
  rawReportData?: string;
}

/**
 * Function to validate a startup idea using Perplexity Sonar API
 * @param input The startup idea input
 * @param apiKey Perplexity API key
 * @returns Validation report and market size report
 */
export const validateStartupIdea = async (
  input: StartupIdeaInput,
  apiKey: string
): Promise<{ validationReport: ValidationReport; marketSizeReport: MarketSizeReport; competitorAnalysisReport: CompetitorAnalysisReport }> => {
  try {
    // Construct the validation prompt (Prompt 1)
    const validationPrompt = `I am validating a software/AI startup idea. The problem my solution addresses is:
${input.problemStatement}

The solution is:
${input.solution}

Please help me validate this problem statement by providing a comprehensive analysis. Be thorough and methodical in your evaluation.

Respond with a structured JSON report that follows this format:
- Problem Statement: A refined, clear version of the problem
- Evidence Collection Summary: Key pain points and current solutions
- Metric Scoring: Individual scores for problem evidence, pain level, current solutions, problem persistence, willingness to pay, and an overall score
- Final Decision: Proceed or Reconsider
- Key Insights: The most important takeaways from the analysis
- Next Steps: Recommended actions based on the analysis`;
    
    // Construct the market size prompt (Prompt 2)
    const marketSizePrompt = `I am validating a software/AI startup idea. The problem my solution addresses is:
${input.problemStatement}

The solution is:
${input.solution}

Please help me complete a full Market Size Analysis to determine if this is a viable and scalable business opportunity. Follow the structure below:

1. Market Size Estimates
Provide detailed estimates for:

Total Addressable Market (TAM): Total global potential users/customers

Serviceable Addressable Market (SAM): Realistic segment we can target based on our solution

Serviceable Obtainable Market (SOM): Expected reachable audience in the first 2–3 years
Include:

Dollar value if possible (e.g., market spend)

Sources or assumptions used in your estimates

Comparable companies and their estimated market sizes

Geographic distribution of the market

Key customer segments and use cases

2. Market Growth & Trend Analysis
Estimate annual growth rate and 5-year CAGR

Identify key market drivers (e.g., technology trends, regulation, funding)

Find Google Trends data for 3–5 related search terms. For each:

Plot trend over 5 years

Identify seasonality or anomalies

Compare to competing or adjacent search terms

Highlight top geographic regions

Assess if the market is:

Growing, stable, or declining

Temporary or persistent

Localized or global in appeal

3. Customer Acquisition Analysis
Analyze the Customer Acquisition Cost (CAC) dynamics:

Typical CAC in this market (range in USD)

Most efficient acquisition channels (e.g., SEO, outbound, paid ads, partnerships)

Potential CAC:LTV ratio

Key challenges to acquiring customers at scale

Role of product-led growth, freemium, or sales-led motion in reducing CAC

4. Revenue Model & Monetization Strategy
Evaluate and compare the following models for this solution:

SaaS subscription

Freemium with paid upgrades

Usage-based pricing

One-time purchase/license

Marketplace or commission-based

For each, provide:

Typical pricing ranges in this space

Estimated ARPU (Average Revenue Per User)

Estimated customer Lifetime Value (LTV)

Pros and cons of each for our solution

Examples of companies using this model successfully

Recommend the best pricing strategy and justify your choice

5. Final Report: Market Size Analysis
Using the data above, create a concise report:

Market Overview:

Short summary of the market opportunity

Market Size Estimates:

TAM: [Number + $ Value]

SAM: [Number + $ Value]

SOM: [Number + $ Value]

Market Growth:

Current annual growth: [%]

Projected 5-year CAGR: [%]

Key trends and drivers

Customer Acquisition:

Estimated CAC: [$]

CAC:LTV ratio: [Value]

Acquisition strategy overview

Revenue Potential:

Recommended model: [Chosen model]

Expected pricing: [e.g., $49/mo, $0.01/API call]

ARPU: [$]

LTV: [$]

6. Metric Scoring (0–10 with justification)
TAM Score – [0–10]

SAM Score – [0–10]

Market Growth Score – [0–10]

CAC Potential Score – [0–10]

Revenue Potential Score – [0–10]
Average Score: [Calculate average]
Threshold to proceed: 6.5
Decision: [Proceed / Pivot / Abandon]

7. Key Insights & Next Steps
List 3–5 key insights gained during this analysis

Recommend next logical step (e.g., Competitor Analysis, MVP Planning)`;
    
    // Construct the competitor analysis prompt (Prompt 3)
    const competitorAnalysisPrompt = `I am validating a software/AI startup and need to conduct a full competitor assessment for my solution:

${input.solution}

The problem it addresses is:
${input.problemStatement}

Please perform a comprehensive competitor analysis across the following dimensions:

1. Top Competitors
Identify 3-5 direct competitors that solve the same problem
For each competitor, provide:

Company name and website
Year founded and funding (if available)
Key product features and differentiators
Strengths and weaknesses
Target audience and market focus
Pricing model (if available)

2. Website Analysis
Review competitors' websites for:

Key messaging and positioning
Visual design and user experience
Content strategy and resources
Social proof (testimonials, case studies, etc.)
Call-to-action effectiveness
SEO strategy (keywords, meta descriptions)

3. User Reviews & Feedback
Summarize user sentiment from review sites, forums, social media
Highlight common praise points
Identify recurring complaints or pain points
Note any feature requests or unmet needs
Assess overall customer satisfaction

4. Competitive Advantages
Identify potential gaps or unmet needs in the market
Determine unique value propositions our solution could offer
Analyze key differentiators we could leverage
Explore potential partnerships or integrations that could provide an edge
Consider technological advantages we might develop

5. Final Report
Competitive Landscape Overview
Key Competitors Summary
Strength/Weakness Analysis
Market Gap Assessment
Competitive Advantage Recommendations

6. Metric Scoring (0–10 with justification)
Competitor Saturation Score – [0–10]
Differentiation Potential Score – [0–10]
Market Gap Score – [0–10]
Competitive Advantage Score – [0–10]
Overall Viability Score – [0–10]
Average Score: [Calculate average]
Threshold to proceed: 6.0
Decision: [Proceed / Pivot / Abandon]

7. Key Insights & Next Steps
List 3–5 key insights gained during this analysis`;

    // Make three API calls in parallel for efficiency
    const [validationResponse, marketSizeResponse, competitorAnalysisResponse] = await Promise.all([
      // Call the Perplexity API for validation report
      axios.post(
        `${API_URL}/chat/completions`,
        {
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'You are a business analyst and startup consultant who helps validate startup ideas.' },
            { role: 'user', content: validationPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      ),
      
      // Call the Perplexity API for market size report
      axios.post(
        `${API_URL}/chat/completions`,
        {
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'You are a business analyst and market research specialist who helps analyze market opportunities for startups.' },
            { role: 'user', content: marketSizePrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      ),
      
      // Call the Perplexity API for competitor analysis report
      axios.post(
        `${API_URL}/chat/completions`,
        {
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: 'You are a business analyst and market research specialist who helps analyze competitive landscapes for startups.' },
            { role: 'user', content: competitorAnalysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      )
    ]);

    // Return all three reports
    return {
      validationReport: {
        rawReportData: JSON.stringify(validationResponse.data)
      },
      marketSizeReport: {
        rawReportData: JSON.stringify(marketSizeResponse.data)
      },
      competitorAnalysisReport: {
        rawReportData: JSON.stringify(competitorAnalysisResponse.data)
      }
    };
  } catch (error) {
    console.error('Error in validateStartupIdea:', error);
    return {
      validationReport: createDefaultReport(),
      marketSizeReport: { rawReportData: JSON.stringify({}) },
      competitorAnalysisReport: { rawReportData: JSON.stringify({}) }
    };
  }
};
