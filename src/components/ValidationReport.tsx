import React, { useState, useEffect } from 'react';
import { ValidationReport as ValidationReportType } from '../services/api';

interface ValidationReportProps {
  report: ValidationReportType;
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

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    search_context_size: string;
  };
  citations: string[];
  search_results: Array<{
    title: string;
    url: string;
    date: string | null;
  }>;
  object: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }>;
}

interface ReportContent {
  problem_statement?: string;
  evidence_collection_summary?: {
    complaints?: Array<{
      quote: string;
      source: string;
    }>;
    themes?: string[];
  };
  complaint_analysis?: Array<{
    pattern: string;
    pain_level: number;
    description: string;
    current_workarounds: string;
    willingness_to_pay: string;
  }>;
  complaint_patterns_summary?: {
    average_pain_level: number;
    most_frequent_limitations: string[];
    signs_of_willingness_to_pay: string;
  };
  google_trends_analysis?: {
    search_terms: string[];
    volume: string;
    seasonality: string;
    geographic_distribution: string;
    trend_direction: string;
    localization: string;
  };
  metric_scoring?: {
    problem_evidence_score?: number;
    pain_level_score?: number;
    current_solutions_score?: number;
    problem_persistence_score?: number;
    willingness_to_pay_score?: number;
    overall_score?: number;
    [key: string]: number | undefined;
  };
  key_insights?: string[];
  next_steps?: string[];
  final_decision?: string;
}

const ValidationReport: React.FC<ValidationReportProps> = ({ report }) => {
  // Parse the JSON response
  let parsedResponse: PerplexityResponse | null = null;
  let reportContent: ReportContent | null = null;
  
  try {
    if (report.rawReportData) {
      parsedResponse = JSON.parse(report.rawReportData);
      
      // Try to parse the content from the response
      if (parsedResponse?.choices && parsedResponse.choices.length > 0) {
        const content = parsedResponse.choices[0].message.content;
        try {
          // Extract JSON from markdown code blocks if needed
          let jsonContent = content;
          if (content.includes('```json')) {
            jsonContent = content.replace(/```json\n|```/g, '');
          }
          reportContent = JSON.parse(jsonContent.trim());
          console.log('Parsed report content:', reportContent);
        } catch (e) {
          console.error('Error parsing content JSON:', e);
          // If content isn't valid JSON, just use it as a string
          reportContent = null;
        }
      }
    }
  } catch (error) {
    console.error('Error parsing API response:', error);
  }
  
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div>
      <h2 style={{fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 700}}>
        Startup Idea Validation Report
      </h2>
      
      {/* Report metadata */}
      {parsedResponse && (
        <div className="metadata">
          <div><strong>Model:</strong> {parsedResponse.model}</div>
          <div><strong>Created:</strong> {formatDate(parsedResponse.created)}</div>
          <div><strong>Tokens:</strong> {parsedResponse.usage?.total_tokens || 'N/A'}</div>
          <div><strong>ID:</strong> {parsedResponse.id}</div>
        </div>
      )}
      
      {/* Refined Report Content - Display the full content in a structured way */}
      {parsedResponse?.choices && parsedResponse.choices.length > 0 && parsedResponse.choices[0].message.content && (
        <div className="card">
          <div className="report-heading">
            <span className="list-icon">📈</span>
            Comprehensive Analysis
          </div>
          
          <div className="section-bg">
            <div className="report-content">
              {(() => {
                // Clean up markdown code blocks and extract content
                let content = parsedResponse.choices[0].message.content;
                content = content.replace(/```json\n|```/g, '');
                
                try {
                  // Try to parse and display as formatted JSON with styling
                  const contentObj = JSON.parse(content.trim());
                  
                  return (
                    <div className="structured-report" style={{
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
                          <div key={key} className="report-section">
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
                  // If not valid JSON, display as formatted text
                  return (
                    <div className="formatted-text" style={{ lineHeight: 1.6 }}>
                      {content.split('\n').map((line, i) => (
                        <p key={i} style={{ marginBottom: '0.75rem' }}>{line}</p>
                      ))}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Content Section */}
      {reportContent && (
        <div className="card">
          <div className="report-heading">
            <span className="list-icon">📝</span>
            Problem Validation Report
          </div>
          
          <div className="section-bg">
            <div className="report-subheading">Problem Statement</div>
            <p>{reportContent.problem_statement || 'Not available'}</p>
          </div>
          
          {reportContent.evidence_collection_summary && (
            <div className="section-bg">
              <div className="report-subheading">Evidence Summary</div>
              
              {reportContent.evidence_collection_summary.themes && (
                <div className="subsection">
                  <h4>Key Themes</h4>
                  <ul>
                    {reportContent.evidence_collection_summary.themes.map((theme: string, index: number) => (
                      <li key={index}>{theme}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {reportContent.evidence_collection_summary.complaints && (
                <div className="subsection">
                  <h4>User Complaints</h4>
                  {reportContent.evidence_collection_summary.complaints.map((complaint, index: number) => (
                    <div key={index} className="complaint-item">
                      <blockquote>"{complaint.quote}"</blockquote>
                      <div className="complaint-source">Source: {complaint.source}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {reportContent.metric_scoring && (
            <div className="section-bg">
              <div className="report-subheading">Validation Scores</div>
              <div className="scores-grid">
                {Object.entries(reportContent.metric_scoring).map(([key, value]) => {
                  if (typeof value === 'number') {
                    return (
                      <div key={key} className="score-item">
                        <div className="score-label">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</div>
                        <div className="score-value">{value}</div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
          
          {reportContent.final_decision && (
            <div className="section-bg">
              <div className="report-subheading">Final Decision</div>
              <div className={`decision ${reportContent.final_decision.toLowerCase() === "proceed" ? 'positive' : 'negative'}`}>
                {reportContent.final_decision}
              </div>
            </div>
          )}
          
          {reportContent.key_insights && reportContent.key_insights.length > 0 && (
            <div className="section-bg">
              <div className="report-subheading">Key Insights</div>
              <ul>
                {reportContent.key_insights.map((insight: string, index: number) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
          
          {reportContent.next_steps && reportContent.next_steps.length > 0 && (
            <div className="section-bg">
              <div className="report-subheading">Next Steps</div>
              <ul>
                {reportContent.next_steps.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Citations Section */}
      {parsedResponse?.citations && (
        <div className="card">
          <div className="report-heading">
            <span className="list-icon">🔗</span>
            Citations
          </div>
          
          <div className="section-bg">
            <ul className="citations-list">
              {parsedResponse.citations.map((citation, index) => (
                <li key={index}>
                  <a href={citation} target="_blank" rel="noopener noreferrer">{citation}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Search Results Section */}
      {parsedResponse?.search_results && (
        <div className="card">
          <div className="report-heading">
            <span className="list-icon">🔍</span>
            Search Results
          </div>
          
          <div className="section-bg">
            {parsedResponse.search_results.map((result, index) => (
              <div key={index} className="search-result">
                <h4>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                </h4>
                <div className="search-meta">
                  <span className="search-url">{result.url}</span>
                  {result.date && <span className="search-date">{result.date}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        .card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          overflow: hidden;
        }
        
        .report-heading {
          background: #4a6cf7;
          color: white;
          padding: 1rem;
          font-weight: 600;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
        }
        
        .report-subheading {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .section-bg {
          padding: 1.25rem;
          border-bottom: 1px solid #eee;
        }
        
        .section-bg:last-child {
          border-bottom: none;
        }
        
        .list-icon {
          margin-right: 0.75rem;
          font-size: 1.2rem;
        }
        
        .metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding: 0.75rem 1rem;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .score-item {
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
          text-align: center;
        }
        
        .score-label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;
          text-transform: capitalize;
        }
        
        .score-value {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }
        
        .decision {
          display: inline-block;
          padding: 0.5rem 1rem;
          font-weight: 600;
          border-radius: 4px;
          margin-top: 0.5rem;
        }
        
        .decision.positive {
          background: #d4edda;
          color: #155724;
        }
        
        .decision.negative {
          background: #f8d7da;
          color: #721c24;
        }
        
        .subsection {
          margin-bottom: 1.5rem;
        }
        
        .subsection h4 {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          color: #555;
        }
        
        .complaint-item {
          margin-bottom: 1.5rem;
          padding-left: 1rem;
          border-left: 3px solid #e0e0e0;
        }
        
        .complaint-item blockquote {
          margin: 0 0 0.5rem 0;
          font-style: italic;
          color: #555;
        }
        
        .complaint-source {
          font-size: 0.85rem;
          color: #666;
          margin-top: 0.5rem;
        }
        
        .citations-list li {
          margin-bottom: 0.75rem;
        }
        
        .citations-list a {
          color: #4a6cf7;
          word-break: break-all;
        }
        
        .search-result {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .search-result:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .search-result h4 {
          margin: 0 0 0.5rem 0;
        }
        
        .search-result a {
          color: #1a0dab;
          text-decoration: none;
        }
        
        .search-result a:hover {
          text-decoration: underline;
        }
        
        .search-meta {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          color: #666;
        }
        
        .search-url {
          color: #006621;
          margin-bottom: 0.25rem;
        }
        
        ul {
          padding-left: 1.5rem;
        }
        
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default ValidationReport;
