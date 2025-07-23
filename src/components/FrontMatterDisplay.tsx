import React, { useState } from 'react';
import './FrontMatterDisplay.css';

interface FrontMatterDisplayProps {
  frontMatter: Record<string, any> | null;
  theme?: 'light' | 'dark';
}

/**
 * Component for displaying front matter with theme support and toggle functionality
 */
const FrontMatterDisplay: React.FC<FrontMatterDisplayProps> = ({
  frontMatter,
  theme = 'dark'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!frontMatter || Object.keys(frontMatter).length === 0) {
    return null;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`front-matter ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      <div className="front-matter-header" onClick={toggleExpand}>
        <h2>Front Matter</h2>
        <button className="front-matter-toggle">
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded && (
        <div className="front-matter-content">
          {Object.entries(frontMatter).map(([key, value]) => (
            <div key={key} className="front-matter-item">
              <span className="front-matter-key">{key}:</span>
              <span className="front-matter-value">
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2) 
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FrontMatterDisplay;
