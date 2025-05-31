import React, { useState } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { validateStartupIdea, StartupIdeaInput } from '../services/api';

interface IdeaInputFormProps {
  onValidationComplete: (report: any) => void;
  setIsLoading: (loading: boolean) => void;
}

const IdeaInputForm: React.FC<IdeaInputFormProps> = ({ onValidationComplete, setIsLoading }) => {
  const { apiKey } = useApiKey();
  
  const [formData, setFormData] = useState<StartupIdeaInput>({
    idea: '',
    problem: '',
    problemStatement: '',
    solution: '',
    targetAudience: '',
    additionalContext: '',
  });
  
  const [validationError, setValidationError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idea.trim() || !formData.problem.trim()) {
      setValidationError('Please provide both your idea and the problem it solves.');
      return;
    }
    
    // Map the idea to solution and problem to problemStatement for the API
    formData.problemStatement = formData.problem;
    formData.solution = formData.idea;
    
    setIsLoading(true);
    
    try {
      console.log('Sending data to API:', formData);
      const result = await validateStartupIdea(formData, apiKey);
      console.log('Raw API result received:', result);
      onValidationComplete(result);
      
      // Success message could be displayed here if needed
    } catch (error) {
      console.error('Error validating idea:', error);
      setValidationError('There was an error analyzing your startup idea. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 600}}>Describe Your Startup Idea</h2>
      <p style={{marginBottom: '1.5rem', color: 'var(--gray-600)'}}>
        Fill in the details about your startup idea, and we'll analyze it using AI to provide valuable insights.
      </p>
      
      {validationError && (
        <div className="alert alert-error" style={{marginBottom: '1rem'}}>
          {validationError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="idea">
            Startup Idea <span style={{color: 'red'}}>*</span>
          </label>
          <textarea
            id="idea"
            className="form-textarea"
            name="idea"
            placeholder="Describe your startup idea in a few sentences..."
            value={formData.idea}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="problem">
            Problem to Solve <span style={{color: 'red'}}>*</span>
          </label>
          <textarea
            id="problem"
            className="form-textarea"
            name="problem"
            placeholder="What problem does your idea solve? Be specific about the pain points..."
            value={formData.problem}
            onChange={handleChange}
            rows={3}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="targetAudience">
            Target Audience
          </label>
          <input
            id="targetAudience"
            className="form-input"
            name="targetAudience"
            placeholder="Who is your target audience? (e.g., 'Small business owners', 'College students')"
            value={formData.targetAudience}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="additionalContext">
            Additional Context (Optional)
          </label>
          <textarea
            id="additionalContext"
            className="form-textarea"
            name="additionalContext"
            placeholder="Any other relevant information about your idea, market, or unique value proposition..."
            value={formData.additionalContext}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <button
          type="submit"
          className="btn btn-primary btn-full"
          style={{marginTop: '1rem'}}
        >
          Validate My Idea
        </button>
      </form>
    </div>
  );
};

export default IdeaInputForm;
