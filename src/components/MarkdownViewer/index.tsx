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
  initialFilePath = null,
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
        
        // If using external router, extract file path from current URL
        let targetFilePath = initialFilePath;
        if (useExternalRouter && !targetFilePath) {
          const currentPath = window.location.pathname;
          console.log('MarkdownViewer - Current URL path:', currentPath);
          console.log('MarkdownViewer - Base path:', basePath);
          
          // Extract file path from URL by removing the base path
          if (currentPath.startsWith(basePath)) {
            const extractedPath = currentPath.substring(basePath.length);
            const cleanPath = extractedPath.startsWith('/') ? extractedPath.substring(1) : extractedPath;
            if (cleanPath && cleanPath.endsWith('.md')) {
              targetFilePath = cleanPath;
              console.log('MarkdownViewer - Extracted file path from URL:', targetFilePath);
            }
          }
        }
        
        // If we have a target file path (from initialFilePath or URL), try to load that file first
        if (targetFilePath && tree.length > 0) {
          console.log('MarkdownViewer - Looking for target file:', targetFilePath);
          const findFileByPath = (nodes: TreeNode[], targetPath: string): FileNode | null => {
            for (const node of nodes) {
              if (node.type === 'file' && node.path === targetPath) {
                return node;
              } else if (node.type === 'directory') {
                const found = findFileByPath(node.children, targetPath);
                if (found) return found;
              }
            }
            return null;
          };
          
          const targetFile = findFileByPath(tree, targetFilePath);
          if (targetFile) {
            console.log('MarkdownViewer - Found target file, loading:', targetFile);
            await handleFileSelect(targetFile);
            setIsLoading(false);
            return;
          } else {
            console.log('MarkdownViewer - Target file not found:', targetFilePath);
          }
        }
        
        // If showHomePage is true and no initial file, try to load README.md or index.md as default
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
            await handleFileSelect(homeFile);
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
  }, [apiBaseUrl, showHomePage, initialFilePath]);

  // Handle browser back/forward navigation when using external router
  useEffect(() => {
    if (!useExternalRouter) return;

    const handlePopState = async () => {
      const currentPath = window.location.pathname;
      console.log('MarkdownViewer - PopState event, path:', currentPath);
      
      // Extract file path from URL
      if (currentPath.startsWith(basePath)) {
        const extractedPath = currentPath.substring(basePath.length);
        const cleanPath = extractedPath.startsWith('/') ? extractedPath.substring(1) : extractedPath;
        
        if (cleanPath && cleanPath.endsWith('.md') && fileTree.length > 0) {
          console.log('MarkdownViewer - Loading file from navigation:', cleanPath);
          
          const findFileByPath = (nodes: TreeNode[], targetPath: string): FileNode | null => {
            for (const node of nodes) {
              if (node.type === 'file' && node.path === targetPath) {
                return node;
              } else if (node.type === 'directory') {
                const found = findFileByPath(node.children, targetPath);
                if (found) return found;
              }
            }
            return null;
          };
          
          const targetFile = findFileByPath(fileTree, cleanPath);
          if (targetFile) {
            setSelectedFile(targetFile);
            const { content, frontMatter } = await fetchFileContent(apiBaseUrl, targetFile.path);
            setContent(content);
            setFrontMatter(frontMatter || {});
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [useExternalRouter, basePath, fileTree, apiBaseUrl]);

  // Handle file selection
  const handleFileSelect = async (file: FileNode) => {
    try {
      setIsLoading(true);
      setSelectedFile(file);
      
      // If using external router, update the URL (only if it's different from current URL)
      if (useExternalRouter && window.history) {
        const filePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        const newPath = `${basePath}${basePath.endsWith('/') ? '' : '/'}${filePath}`;
        const currentPath = window.location.pathname;
        
        if (currentPath !== newPath) {
          console.log('MarkdownViewer - Updating URL from', currentPath, 'to', newPath);
          window.history.pushState({}, '', newPath);
        }
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
