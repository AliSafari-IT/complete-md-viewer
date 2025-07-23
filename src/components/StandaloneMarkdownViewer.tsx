import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MarkdownViewer from './MarkdownViewer';
import { MarkdownViewerProps } from '../types';

/**
 * Standalone version of the MarkdownViewer that includes its own Router
 * Use this when you want to use the viewer as a standalone application
 */
const StandaloneMarkdownViewer: React.FC<Omit<MarkdownViewerProps, 'useExternalRouter'>> = (props) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="*" 
          element={<MarkdownViewer {...props} useExternalRouter={false} />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default StandaloneMarkdownViewer;
