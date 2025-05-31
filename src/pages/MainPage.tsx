import React, { useState } from 'react';
import Header from '../components/Header';
import ApiKeyInput from '../components/ApiKeyInput';
import IdeaInputForm from '../components/IdeaInputForm';
import ValidationReport from '../components/ValidationReport';
import MarketSizeReport from '../components/MarketSizeReport';
import CompetitorAnalysisReport from '../components/CompetitorAnalysisReport';
import { useApiKey } from '../context/ApiKeyContext';
import { ValidationReport as ValidationReportType, MarketSizeReport as MarketSizeReportType, CompetitorAnalysisReport as CompetitorAnalysisReportType } from '../services/api';

const MainPage: React.FC = () => {
  const { isKeySet } = useApiKey();
  const [validationReport, setValidationReport] = useState<ValidationReportType | null>(null);
  const [marketSizeReport, setMarketSizeReport] = useState<MarketSizeReportType | null>(null);
  const [competitorAnalysisReport, setCompetitorAnalysisReport] = useState<CompetitorAnalysisReportType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidationComplete = (result: { validationReport: ValidationReportType; marketSizeReport: MarketSizeReportType; competitorAnalysisReport: CompetitorAnalysisReportType }) => {
    console.log('API Response received:', result);
    // Log each report to see what's being returned
    console.log('Validation Report:', result.validationReport);
    console.log('Market Size Report:', result.marketSizeReport);
    console.log('Competitor Analysis Report:', result.competitorAnalysisReport);
    
    setValidationReport(result.validationReport);
    setMarketSizeReport(result.marketSizeReport);
    setCompetitorAnalysisReport(result.competitorAnalysisReport);
    
    // Log state after setting
    console.log('State after setting - Market Size Report:', marketSizeReport);
    
    // Scroll to the report section
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  return (
    <div className="page-container">
      <Header />
      
      <div className="container">
        <div className="content-stack">
          <div className="text-center" style={{marginBottom: '2rem'}}>
            <h1 className="heading-xl" style={{marginBottom: '0.75rem'}}>
              Validate Your Startup Idea
            </h1>
            <p className="text-lg text-gray-600">
              Get an AI-powered analysis of your startup idea with market insights, competitor analysis, and recommendations
            </p>
          </div>
          
          {!isKeySet ? (
            <div className="card">
              <h2 className="heading-md text-center" style={{marginBottom: '1rem'}}>
                First, Let's Set Up Your API Key
              </h2>
              <ApiKeyInput />
            </div>
          ) : (
            <>
              {!validationReport && !marketSizeReport && !isLoading && (
                <IdeaInputForm 
                  onValidationComplete={handleValidationComplete} 
                  setIsLoading={setIsLoading}
                />
              )}
              
              {isLoading && (
                <div className="center-content" style={{padding: '2.5rem'}}>
                  <div className="text-center">
                    <div className="spinner-large"></div>
                    <p className="text-lg" style={{marginTop: '1rem'}}>
                      Analyzing your startup idea...
                    </p>
                    <p className="text-sm text-gray-500" style={{marginTop: '0.5rem', maxWidth: '28rem', margin: '0.5rem auto 0'}}>
                      This may take a minute or two as we perform a comprehensive analysis.
                    </p>
                  </div>
                </div>
              )}
              
              {validationReport && !isLoading && (
                <div>
                  {/* Validation Report */}
                  <div className="report-container">
                    <h2 className="heading-md text-center" style={{marginBottom: '1rem'}}>
                      Problem Validation Report
                    </h2>
                    <ValidationReport report={validationReport} />
                  </div>
                  
                  {/* Market Size Report - only render if available */}
                  {marketSizeReport && (
                    <div className="report-container" style={{marginTop: '3rem'}}>
                      <h2 className="heading-md text-center" style={{marginBottom: '1rem'}}>
                        Market Size Analysis
                      </h2>
                      <MarketSizeReport report={marketSizeReport} />
                    </div>
                  )}
                  
                  {/* Competitor Analysis Report - only render if available */}
                  {competitorAnalysisReport && (
                    <div className="report-container" style={{marginTop: '3rem'}}>
                      <h2 className="heading-md text-center" style={{marginBottom: '1rem'}}>
                        Competitor Analysis
                      </h2>
                      <CompetitorAnalysisReport report={competitorAnalysisReport} />
                    </div>
                  )}
                  
                  <div className="actions" style={{marginTop: '2rem', textAlign: 'center'}}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setValidationReport(null);
                        setMarketSizeReport(null);
                        setCompetitorAnalysisReport(null);
                      }}
                    >
                      Start a New Analysis
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
