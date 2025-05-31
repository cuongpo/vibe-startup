import React from 'react';
import { MarketSizeReport as MarketSizeReportType } from '../services/api';

interface MarketSizeReportProps {
  report: MarketSizeReportType;
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

const MarketSizeReport: React.FC<MarketSizeReportProps> = ({ report }) => {
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
          console.log('Successfully parsed Market Size Report as JSON:', parsedContent);
        } catch (jsonError) {
          console.log('Could not parse Market Size Report as direct JSON, trying code blocks');
          
          // Second try: Extract JSON from markdown code blocks
          const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            try {
              const extractedJson = JSON.parse(jsonMatch[1]);
              setParsedReport({
                ...extractedJson,
                _raw_content: rawContent
              });
              console.log('Successfully parsed Market Size Report from code block:', extractedJson);
            } catch (extractError) {
              console.log('Could not parse Market Size Report from code blocks, using raw content');
              // Third try: If we can't parse JSON, just use the raw content
              setParsedReport({ 
                raw_content: rawContent,
                _raw_content: rawContent
              });
            }
          } else {
            // If no code blocks found, use the raw content
            console.log('No code blocks found in Market Size Report, using raw content');
            setParsedReport({ 
              raw_content: rawContent,
              _raw_content: rawContent
            });
          }
        }
      } catch (error) {
        console.error('Error parsing market size report:', error);
        setError('Failed to parse the market size report data.');
      }
    } else {
      console.log('No raw report data available for Market Size Report');
    }
  }, [report]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!parsedReport) {
    return <div className="loading">Loading market size analysis...</div>;
  }

  // Check if we're using raw content (non-JSON response)
  if (parsedReport.raw_content) {
    // Parse the content into sections
    const content = parsedReport.raw_content;
    
    // Extract main sections using regex
    const marketSizeEstimatesMatch = content.match(/## 1\. Market Size Estimates([\s\S]*?)(?=## 2\.)/i);
    const marketGrowthMatch = content.match(/## 2\. Market Growth & Trend Analysis([\s\S]*?)(?=## 3\.)/i);
    const customerAcquisitionMatch = content.match(/## 3\. Customer Acquisition Analysis([\s\S]*?)(?=## 4\.)/i);
    const revenueModelMatch = content.match(/## 4\. Revenue Model & Monetization Strategy([\s\S]*?)(?=## 5\.)/i);
    const finalReportMatch = content.match(/## 5\. Final Report: Market Size Analysis([\s\S]*?)(?=## 6\.)/i);
    const metricScoringMatch = content.match(/## 6\. Metric Scoring([\s\S]*?)(?=## 7\.)/i);
    const keyInsightsMatch = content.match(/## 7\. Key Insights & Next Steps([\s\S]*?)(?=$)/i);
    
    return (
      <div className="market-size-report">
        <h2 style={{fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700}}>Market Size Analysis</h2>
        
        {marketSizeEstimatesMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>📊</span>
                <span>1. Market Size Estimates</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: marketSizeEstimatesMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {marketGrowthMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>📈</span>
                <span>2. Market Growth & Trend Analysis</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: marketGrowthMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {customerAcquisitionMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>💰</span>
                <span>3. Customer Acquisition Analysis</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: customerAcquisitionMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {revenueModelMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>💸</span>
                <span>4. Revenue Model & Monetization Strategy</span>
              </div>
              <div style={cardContentStyle}>
                <div className="section-content" style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }} dangerouslySetInnerHTML={{ 
                  __html: revenueModelMatch[1].replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2c3e50">$1</strong>')
                    .replace(/- /g, '<span style="color:#3498db;margin-right:5px;">•</span> ')
                    .replace(/\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|/g, 
                      '<table style="width:100%;border-collapse:collapse;margin:15px 0;" border="1"><tr style="background-color:#e9f3ff;"><th style="padding:8px;text-align:left;">$1</th><th style="padding:8px;text-align:left;">$2</th><th style="padding:8px;text-align:left;">$3</th><th style="padding:8px;text-align:left;">$4</th><th style="padding:8px;text-align:left;">$5</th><th style="padding:8px;text-align:left;">$6</th><th style="padding:8px;text-align:left;">$7</th></tr>')
                    .replace(/\n\|---/g, '')
                }} />
              </div>
            </div>
          </div>
        )}
        
        {finalReportMatch && (
          <div className="report-section">
            <div style={cardStyle}>
              <div style={cardHeadingStyle}>
                <span style={iconStyle}>📑</span>
                <span>5. Final Report: Market Size Analysis</span>
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
                <span style={iconStyle}>📊</span>
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

  // Render structured report
  return (
    <div className="market-size-report">
      <h2 style={{fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700}}>Market Size Analysis</h2>
      
      {/* Market Overview Section */}
      {parsedReport.market_overview && (
        <div className="report-section">
          <h3>Market Overview</h3>
          <p>{parsedReport.market_overview}</p>
        </div>
      )}
      
      {/* Market Size Estimates */}
      {parsedReport.market_size_estimates && (
        <div className="report-section">
          <h3>Market Size Estimates</h3>
          <div className="metric-card">
            <div className="metric-item">
              <h4>TAM (Total Addressable Market)</h4>
              <p>{parsedReport.market_size_estimates.tam}</p>
            </div>
            <div className="metric-item">
              <h4>SAM (Serviceable Addressable Market)</h4>
              <p>{parsedReport.market_size_estimates.sam}</p>
            </div>
            <div className="metric-item">
              <h4>SOM (Serviceable Obtainable Market)</h4>
              <p>{parsedReport.market_size_estimates.som}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Market Growth */}
      {parsedReport.market_growth && (
        <div className="report-section">
          <h3>Market Growth & Trends</h3>
          <div className="metric-item">
            <h4>Annual Growth Rate</h4>
            <p>{parsedReport.market_growth.annual_growth}</p>
          </div>
          <div className="metric-item">
            <h4>Projected 5-Year CAGR</h4>
            <p>{parsedReport.market_growth.cagr}</p>
          </div>
          
          {parsedReport.market_growth.key_trends && (
            <div className="metric-item">
              <h4>Key Trends</h4>
              <ul>
                {Array.isArray(parsedReport.market_growth.key_trends) 
                  ? parsedReport.market_growth.key_trends.map((trend: string, index: number) => (
                      <li key={index}>{trend}</li>
                    ))
                  : <li>{parsedReport.market_growth.key_trends}</li>
                }
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Formatted Raw Content Display */}
      {parsedReport?._raw_content && (
        <div style={cardStyle}>
          <div style={cardHeadingStyle}>
            <span style={iconStyle}>📊</span>
            <span>Market Size Analysis</span>
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
      
      {/* Customer Acquisition */}
      {parsedReport.customer_acquisition && (
        <div className="report-section">
          <h3>Customer Acquisition</h3>
          <div className="metric-item">
            <h4>Estimated CAC</h4>
            <p>{parsedReport.customer_acquisition.cac}</p>
          </div>
          <div className="metric-item">
            <h4>CAC:LTV Ratio</h4>
            <p>{parsedReport.customer_acquisition.cac_ltv_ratio}</p>
          </div>
          
          {parsedReport.customer_acquisition.strategy && (
            <div className="metric-item">
              <h4>Acquisition Strategy</h4>
              <p>{parsedReport.customer_acquisition.strategy}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Revenue Potential */}
      {parsedReport.revenue_potential && (
        <div className="report-section">
          <h3>Revenue Potential</h3>
          <div className="metric-item">
            <h4>Recommended Model</h4>
            <p>{parsedReport.revenue_potential.model}</p>
          </div>
          <div className="metric-item">
            <h4>Expected Pricing</h4>
            <p>{parsedReport.revenue_potential.pricing}</p>
          </div>
          <div className="metric-item">
            <h4>ARPU (Average Revenue Per User)</h4>
            <p>{parsedReport.revenue_potential.arpu}</p>
          </div>
          <div className="metric-item">
            <h4>LTV (Lifetime Value)</h4>
            <p>{parsedReport.revenue_potential.ltv}</p>
          </div>
        </div>
      )}
      
      {/* Metric Scoring */}
      {parsedReport.metric_scoring && (
        <div className="report-section">
          <h3>Market Opportunity Score</h3>
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
              <p>(Threshold to proceed: 6.5)</p>
            </div>
          )}
          
          {parsedReport.metric_scoring.decision && (
            <div className="final-decision">
              <h4>Decision</h4>
              <div className={`decision-badge ${parsedReport.metric_scoring.decision.toLowerCase()}`}>
                {parsedReport.metric_scoring.decision}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Key Insights and Next Steps */}
      {parsedReport.key_insights && (
        <div className="report-section">
          <h3>Key Insights & Next Steps</h3>
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
      )}
      
      {/* For any fields that don't match our expected structure */}
      <div className="report-section">
        {Object.entries(parsedReport).map(([key, value]: [string, any]) => {
          // Skip fields we've already rendered specifically above
          const alreadyRendered = [
            'market_overview', 'market_size_estimates', 'market_growth', 
            'customer_acquisition', 'revenue_potential', 'metric_scoring',
            'key_insights', 'next_steps', 'raw_content'
          ];
          
          if (alreadyRendered.includes(key)) return null;
          
          return (
            <div key={key} className="additional-section">
              <h3>{key.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h3>
              {typeof value === 'object' ? (
                <pre>{JSON.stringify(value, null, 2)}</pre>
              ) : (
                <p>{String(value)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketSizeReport;
