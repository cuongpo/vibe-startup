import React from 'react';
import { CompetitorAnalysisReport as CompetitorAnalysisReportType } from '../services/api';

interface CompetitorAnalysisReportProps {
  report: CompetitorAnalysisReportType;
}

// Helper function to render different value types
function renderValue(value: any): React.ReactNode {
  // Common styles
  const valueContentStyle = {
    padding: '0.5rem',
    background: '#f9fafc',
    borderRadius: '4px',
    marginBottom: '1rem'
  };
  
  const listItemStyle = {
    marginBottom: '0.5rem',
    position: 'relative' as const,
    paddingLeft: '1.5rem',
    display: 'flex' as const,
    alignItems: 'flex-start' as const
  };
  
  if (typeof value === 'string') {
    return <div style={valueContentStyle}>{value}</div>;
  } else if (Array.isArray(value)) {
    return (
      <ul style={{listStyle: 'none', padding: 0}}>
        {value.map((item, idx) => {
          if (typeof item === 'object' && item !== null) {
            return (
              <li key={idx} style={listItemStyle}>
                <span style={{ 
                  position: 'absolute' as const, 
                  left: '0.5rem', 
                  color: '#2557a7',
                  fontWeight: 'bold' as const
                }}>•</span>
                <div>
                  {Object.entries(item).map(([subKey, subValue]) => (
                    <div key={subKey} style={{marginBottom: '0.25rem'}}>
                      <strong>{subKey.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:</strong> {' '}
                      {typeof subValue === 'string' ? subValue : JSON.stringify(subValue)}
                    </div>
                  ))}
                </div>
              </li>
            );
          } else {
            return (
              <li key={idx} style={listItemStyle}>
                <span style={{ 
                  position: 'absolute' as const, 
                  left: '0.5rem', 
                  color: '#2557a7',
                  fontWeight: 'bold' as const
                }}>•</span>
                <span>{String(item)}</span>
              </li>
            );
          }
        })}
      </ul>
    );
  } else if (typeof value === 'object' && value !== null) {
    return (
      <div style={{padding: '0.5rem', background: '#f9fafc', borderRadius: '4px', marginBottom: '1rem'}}>
        {Object.entries(value).map(([subKey, subValue]) => {
          const formattedSubKey = subKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          return (
            <div key={subKey} style={{marginBottom: '1rem'}}>
              <h4 style={{marginBottom: '0.5rem', color: '#333', fontWeight: 600}}>{formattedSubKey}</h4>
              {renderValue(subValue)}
            </div>
          );
        })}
      </div>
    );
  } else {
    return <div style={valueContentStyle}>{String(value)}</div>;
  }
}

const CompetitorAnalysisReport: React.FC<CompetitorAnalysisReportProps> = ({ report }) => {
  // Define card styles to be reused
  const cardStyle = {
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
    overflow: 'hidden' as const,
    border: '1px solid #e1e4e8'
  };
  
  const cardHeadingStyle = {
    backgroundColor: '#f1f8ff',
    padding: '12px 16px',
    borderBottom: '1px solid #e1e4e8',
    fontWeight: 600 as const,
    display: 'flex' as const,
    alignItems: 'center' as const
  };
  
  const iconStyle = {
    marginRight: '10px',
    fontSize: '18px'
  };
  
  const cardContentStyle = {
    padding: '16px',
    backgroundColor: '#fff'
  };
  
  const [parsedReport, setParsedReport] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (report?.rawReportData) {
      try {
        // Parse the raw report data
        const rawData = JSON.parse(report.rawReportData);
        
        // Store the raw content for display
        const rawContent = rawData.choices[0].message.content;
        
        // Try to parse JSON from the content
        try {
          // First try: Direct JSON parse if the content is already in JSON format
          const parsedContent = JSON.parse(rawContent);
          setParsedReport({
            ...parsedContent,
            _raw_content: rawContent // Keep the raw content for reference
          });
          console.log('Successfully parsed Competitor Analysis Report as JSON:', parsedContent);
        } catch (jsonError) {
          console.log('Could not parse Competitor Analysis Report as direct JSON, trying code blocks');
          
          // Second try: Extract JSON from markdown code blocks
          const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              const extractedJson = JSON.parse(jsonMatch[1]);
              setParsedReport({
                ...extractedJson,
                _raw_content: rawContent
              });
              console.log('Successfully parsed Competitor Analysis Report from code block:', extractedJson);
            } catch (extractError) {
              console.log('Could not parse Competitor Analysis Report from code blocks, using raw content');
              // Third try: If we can't parse JSON, just use the raw content
              setParsedReport({ 
                raw_content: rawContent,
                _raw_content: rawContent
              });
            }
          } else {
            // If no code blocks found, use the raw content
            console.log('No code blocks found in Competitor Analysis Report, using raw content');
            setParsedReport({ 
              raw_content: rawContent,
              _raw_content: rawContent
            });
          }
        }
      } catch (error) {
        console.error('Error parsing competitor analysis report:', error);
        setError('Failed to parse the competitor analysis report data.');
      }
    } else {
      console.log('No raw report data available for Competitor Analysis Report');
    }
  }, [report]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!parsedReport) {
    return <div className="loading">Loading competitor analysis...</div>;
  }

  // Check if we're using raw content (non-JSON response)
  if (parsedReport.raw_content) {
    // Parse the content into sections
    const content = parsedReport.raw_content;
    
    // Extract main sections using regex (based on the competitor analysis prompt structure)
    const topCompetitorsMatch = content.match(/## 1\. Top Competitors([\s\S]*?)(?=## 2\.)/i);
    const websiteAnalysisMatch = content.match(/## 2\. Website Analysis([\s\S]*?)(?=## 3\.)/i);
    const userReviewsMatch = content.match(/## 3\. User Reviews & Feedback([\s\S]*?)(?=## 4\.)/i);
    const competitiveAdvantageMatch = content.match(/## 4\. Competitive Advantages([\s\S]*?)(?=## 5\.)/i);
    const finalReportMatch = content.match(/## 5\. Final Report([\s\S]*?)(?=## 6\.)/i);
    const metricScoringMatch = content.match(/## 6\. Metric Scoring([\s\S]*?)(?=## 7\.)/i);
    const keyInsightsMatch = content.match(/## 7\. Key Insights & Next Steps([\s\S]*?)(?=$)/i);
    
    return (
      <div className="competitor-analysis-report">
        <h2 style={{fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700}}>Competitor Analysis</h2>
        
        {topCompetitorsMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>🏢</span>
                <span>1. Top Competitors</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: topCompetitorsMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {websiteAnalysisMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>🌐</span>
                <span>2. Website Analysis</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: websiteAnalysisMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {userReviewsMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>⭐</span>
                <span>3. User Reviews & Feedback</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: userReviewsMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {competitiveAdvantageMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>🏆</span>
                <span>4. Competitive Advantages</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: competitiveAdvantageMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {finalReportMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>📊</span>
                <span>5. Final Report</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: finalReportMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {metricScoringMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>📈</span>
                <span>6. Metric Scoring</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: metricScoringMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {keyInsightsMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>💡</span>
                <span>7. Key Insights & Next Steps</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: keyInsightsMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render structured report (if JSON format is provided directly)
  return (
    <div className="competitor-analysis-report">
      <h2 style={{fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700}}>Competitor Analysis</h2>
      
      {/* Top Competitors Section */}
      {parsedReport.top_competitors && (
        <div className="report-section">
          <div style={cardStyle}>
            <div style={cardHeadingStyle}>
              <span style={iconStyle}>🏢</span>
              <span>Top Competitors</span>
            </div>
            <div style={cardContentStyle}>
              {Array.isArray(parsedReport.top_competitors) ? (
                <ul className="competitors-list">
                  {parsedReport.top_competitors.map((competitor: any, index: number) => (
                    <li key={index}>
                      <h4>{competitor.name}</h4>
                      <p>{competitor.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{parsedReport.top_competitors}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Website Analysis */}
      {parsedReport.website_analysis && (
        <div className="report-section">
          <div style={cardStyle}>
            <div style={cardHeadingStyle}>
              <span style={iconStyle}>🌐</span>
              <span>Website Analysis</span>
            </div>
            <div style={cardContentStyle}>
              {typeof parsedReport.website_analysis === 'object' ? (
                Object.entries(parsedReport.website_analysis).map(([key, value]: [string, any]) => (
                  <div key={key} className="analysis-item">
                    <h4>{key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h4>
                    <p>{value}</p>
                  </div>
                ))
              ) : (
                <p>{parsedReport.website_analysis}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* User Reviews */}
      {parsedReport.user_reviews && (
        <div className="report-section">
          <div style={cardStyle}>
            <div style={cardHeadingStyle}>
              <span style={iconStyle}>⭐</span>
              <span>User Reviews & Feedback</span>
            </div>
            <div style={cardContentStyle}>
              {Array.isArray(parsedReport.user_reviews) ? (
                <ul className="reviews-list">
                  {parsedReport.user_reviews.map((review: any, index: number) => (
                    <li key={index}>
                      <p>{review}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{parsedReport.user_reviews}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Competitive Advantages */}
      {parsedReport.competitive_advantages && (
        <div className="report-section">
          <div style={cardStyle}>
            <div style={cardHeadingStyle}>
              <span style={iconStyle}>🏆</span>
              <span>Competitive Advantages</span>
            </div>
            <div style={cardContentStyle}>
              {Array.isArray(parsedReport.competitive_advantages) ? (
                <ul className="advantages-list">
                  {parsedReport.competitive_advantages.map((advantage: any, index: number) => (
                    <li key={index}>
                      <p>{advantage}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{parsedReport.competitive_advantages}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Final Report */}
      {parsedReport.final_report && (
        <div className="report-section">
          <div style={cardStyle}>
            <div style={cardHeadingStyle}>
              <span style={iconStyle}>📊</span>
              <span>Final Report</span>
            </div>
            <div style={cardContentStyle}>
              {typeof parsedReport.final_report === 'object' ? (
                Object.entries(parsedReport.final_report).map(([key, value]: [string, any]) => (
                  <div key={key} className="final-report-item">
                    <h4>{key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h4>
                    <p>{value}</p>
                  </div>
                ))
              ) : (
                <p>{parsedReport.final_report}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Formatted Raw Content Display */}
      {parsedReport?._raw_content && (
        <div style={cardStyle}>
          <div style={cardHeadingStyle}>
            <span style={iconStyle}>📊</span>
            <span>Competitor Analysis</span>
          </div>
          <div style={cardContentStyle}>
            {(() => {
              // Clean up markdown code blocks and extract content
              let content = parsedReport._raw_content;
              content = content.replace(/```json\n|```/g, '');
              
              try {
                // Try to parse and display as formatted JSON with styling
                const contentObj = JSON.parse(content.trim());
                
                return (
                  <div style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", sans-serif'
                  }}>
                    {Object.entries(contentObj).map(([key, value]) => {
                      // Skip rendering if the value is null or undefined
                      if (value === null || value === undefined) return null;
                      
                      // Format the key for display
                      const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                      
                      return (
                        <div key={key} style={{marginBottom: '1.5rem'}}>
                          <h3 style={{
                            color: '#2557a7',
                            borderBottom: '1px solid #eaeaea',
                            paddingBottom: '0.5rem',
                            marginTop: '1.5rem',
                            marginBottom: '1rem',
                            fontWeight: 600
                          }}>{formattedKey}</h3>
                          {renderValue(value)}
                        </div>
                      );
                    })}
                  </div>
                );
              } catch (e) {
                // If not valid JSON, display as formatted text with proper styling
                return (
                  <div style={{lineHeight: 1.6}}>
                    {content.split('\n').map((line: string, i: number) => (
                      <p key={i} style={{marginBottom: '0.75rem'}}>{line}</p>
                    ))}
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
      
      {/* Metric Scoring */}
      {parsedReport.metric_scoring && (
        <div className="report-section">
          <div style={cardStyle}>
            <div style={cardHeadingStyle}>
              <span style={iconStyle}>📈</span>
              <span>Metric Scoring</span>
            </div>
            <div style={cardContentStyle}>
              <div className="score-grid">
                {Object.entries(parsedReport.metric_scoring).map(([key, value]: [string, any]) => {
                  if (key === 'average' || key === 'decision') return null;
                  return (
                    <div key={key} className="score-item">
                      <h4>{key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h4>
                      <div className="score-value">
                        <span className="score-number">{value.score || value}</span>
                        {value.justification && <p className="score-justification">{value.justification}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {parsedReport.metric_scoring.average && (
                <div className="average-score">
                  <h4>Average Score</h4>
                  <div className="score-number highlight">{parsedReport.metric_scoring.average}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Key Insights and Next Steps */}
      {parsedReport.key_insights && (
        <div className="report-section">
          <div style={cardStyle}>
            <div style={cardHeadingStyle}>
              <span style={iconStyle}>💡</span>
              <span>Key Insights & Next Steps</span>
            </div>
            <div style={cardContentStyle}>
              <div className="insights-container">
                <h4>Key Insights</h4>
                <ul className="insights-list">
                  {Array.isArray(parsedReport.key_insights) 
                    ? parsedReport.key_insights.map((insight: string, index: number) => (
                        <li key={index}>{insight}</li>
                      ))
                    : <li>{parsedReport.key_insights}</li>
                  }
                </ul>
              </div>
              
              {parsedReport.next_steps && (
                <div className="next-steps-container">
                  <h4>Recommended Next Steps</h4>
                  <p>{parsedReport.next_steps}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* For any fields that don't match our expected structure */}
      <div className="report-section">
        {Object.entries(parsedReport).map(([key, value]: [string, any]) => {
          // Skip fields we've already rendered specifically above
          const alreadyRendered = [
            'top_competitors', 'website_analysis', 'user_reviews', 
            'competitive_advantages', 'final_report', 'metric_scoring',
            'key_insights', 'next_steps', 'raw_content'
          ];
          
          if (alreadyRendered.includes(key)) return null;
          
          return (
            <div key={key} className="additional-section">
              <div style={cardStyle}>
                <div style={cardHeadingStyle}>
                  <span style={iconStyle}>📝</span>
                  <span>{key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                </div>
                <div style={cardContentStyle}>
                  {typeof value === 'object' ? (
                    <pre>{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    <p>{String(value)}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompetitorAnalysisReport;
