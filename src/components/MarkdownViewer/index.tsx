import React, { useState, useEffect } from 'react';
import { MarkdownViewerProps, FileNode, TreeNode } from '../../types';
import FileTree from '../FileTree';
import MarkdownContent from '../MarkdownContent';
import { fetchFileTree, fetchFileContent } from '../../utils/api';
import './MarkdownViewer.css';

/**
 * Main MarkdownViewer component that can work in both standalone and integrated modes
 */
const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  apiBaseUrl,
  showHomePage = true,
  hideFileTree = false,
  useExternalRouter = false,
  className = '',
  style = {},
  basePath = '/',
  theme = 'dark',
}) => {
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [content, setContent] = useState<string>('');
  const [frontMatter, setFrontMatter] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);

  // Load file tree on component mount
  useEffect(() => {
    const loadFileTree = async () => {
      try {
        setIsLoading(true);
        const tree = await fetchFileTree(apiBaseUrl);
        setFileTree(tree);
        
        // If showHomePage is true, try to load README.md or index.md as default
        if (showHomePage && tree.length > 0) {
          const findHomeFile = (nodes: TreeNode[]): FileNode | null => {
            for (const node of nodes) {
              if (node.type === 'file' && 
                  (node.name.toLowerCase() === 'readme.md' || 
                   node.name.toLowerCase() === 'index.md')) {
                return node;
              } else if (node.type === 'directory') {
                const found = findHomeFile(node.children);
                if (found) return found;
              }
            }
            return null;
          };
          
          const homeFile = findHomeFile(tree);
          if (homeFile) {
            handleFileSelect(homeFile);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load file tree');
        setIsLoading(false);
        console.error('Error loading file tree:', err);
      }
    };
    
    loadFileTree();
  }, [apiBaseUrl, showHomePage]);

  // Handle file selection
  const handleFileSelect = async (file: FileNode) => {
    try {
      setIsLoading(true);
      setSelectedFile(file);
      
      // If using external router, update the URL
      if (useExternalRouter && window.history) {
        const filePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        const newPath = `${basePath}${basePath.endsWith('/') ? '' : '/'}${filePath}`;
        window.history.pushState({}, '', newPath);
      }
      
      const { content, frontMatter } = await fetchFileContent(apiBaseUrl, file.path);
      setContent(content);
      setFrontMatter(frontMatter || {});
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load file content');
      setIsLoading(false);
      console.error('Error loading file content:', err);
    }
  };

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`markdown-viewer ${theme} ${className}`} style={style}>
      <div className={`markdown-viewer-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {!hideFileTree && (
          <div className={`file-tree-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-toggle" onClick={toggleSidebar}>
              <div className="toggle-icon">{sidebarCollapsed ? '›' : '‹'}</div>
            </div>
            <div className="file-tree-wrapper">
              <FileTree 
                data={fileTree} 
                selectedPath={selectedFile?.path}
                onFileSelect={handleFileSelect}
              />
            </div>
          </div>
        )}
        
        <div className="content-container">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : selectedFile ? (
            <MarkdownContent 
              content={content}
              frontMatter={frontMatter}
              theme={theme}
            />
          ) : (
            <div className="no-selection">
              <p>Select a file from the tree to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownViewer;
