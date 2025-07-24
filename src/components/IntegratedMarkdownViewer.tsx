import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import MarkdownViewer from './MarkdownViewer';
import { MarkdownViewerProps } from '../types';

/**
 * Integrated version of the MarkdownViewer that works with an existing Router
 * Use this when you want to embed the viewer in an existing React application
 */
const IntegratedMarkdownViewer: React.FC<Omit<MarkdownViewerProps, 'useExternalRouter'>> = (props) => {
  const location = useLocation();
  const params = useParams();
  const [initialFilePath, setInitialFilePath] = useState<string | null>(null);
  
  // Handle URL-based file navigation on mount and route changes
  useEffect(() => {
    console.log('IntegratedMarkdownViewer - Current path:', location.pathname);
    console.log('IntegratedMarkdownViewer - Params:', params);
    
    // Extract file path from URL
    const { basePath = '/' } = props;
    let filePath: string | null = null;
    
    if (location.pathname && location.pathname !== basePath) {
      // Remove the basePath from the current path to get the file path
      const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
      const pathAfterBase = location.pathname.startsWith(normalizedBasePath) 
        ? location.pathname.substring(normalizedBasePath.length)
        : location.pathname;
      
      // Remove leading slash if present
      filePath = pathAfterBase.startsWith('/') ? pathAfterBase.substring(1) : pathAfterBase;
      
      // If we have a file path, set it as initial
      if (filePath && filePath.length > 0) {
        console.log('IntegratedMarkdownViewer - Extracted file path:', filePath);
        setInitialFilePath(filePath);
      }
    }
    
    // Handle wildcard params (for React Router v6 catch-all routes)
    if (params['*']) {
      const wildcardPath = params['*'];
      console.log('IntegratedMarkdownViewer - Wildcard path:', wildcardPath);
      setInitialFilePath(wildcardPath);
    }
  }, [location, params, props.basePath]);

  return (
    <MarkdownViewer 
      {...props} 
      useExternalRouter={true}
      initialFilePath={initialFilePath}
    />
  );
};

export default IntegratedMarkdownViewer;
