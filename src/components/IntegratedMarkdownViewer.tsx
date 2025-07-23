import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MarkdownViewer from './MarkdownViewer';
import { MarkdownViewerProps } from '../types';

/**
 * Integrated version of the MarkdownViewer that works with an existing Router
 * Use this when you want to embed the viewer in an existing React application
 */
const IntegratedMarkdownViewer: React.FC<Omit<MarkdownViewerProps, 'useExternalRouter'>> = (props) => {
  const location = useLocation();
  
  // Example of how to integrate with the parent application's router
  useEffect(() => {
    // You could do something with the location here if needed
    console.log('Current path:', location.pathname);
  }, [location]);

  return <MarkdownViewer {...props} useExternalRouter={true} />;
};

export default IntegratedMarkdownViewer;
