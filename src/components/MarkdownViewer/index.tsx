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
        
        // Check for URL-specified file path (works for both external and internal router modes)
        let urlFilePath: string | null = null;
        
        if (useExternalRouter) {
          // For external router mode, extract from window.location.pathname
          const currentPath = window.location.pathname;
          if (currentPath && currentPath !== '/' && basePath) {
            // Remove basePath from the beginning to get the file path
            const basePathNormalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
            if (currentPath.startsWith(basePathNormalized)) {
              urlFilePath = currentPath.substring(basePathNormalized.length);
              if (urlFilePath.startsWith('/')) {
                urlFilePath = urlFilePath.substring(1);
              }
            }
          }
        } else {
          // For standalone mode (internal router), extract from hash or pathname
          const currentPath = window.location.hash ? window.location.hash.substring(1) : window.location.pathname;
          if (currentPath && currentPath !== '/') {
            urlFilePath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
          }
        }
        
        // Priority: URL file path > initialFilePath > default home file
        const targetFilePath = urlFilePath || initialFilePath;
        
        if (targetFilePath && tree.length > 0) {
          console.log('MarkdownViewer - Looking for file from URL/initial:', targetFilePath);
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
        
        // If showHomePage is true and no target file found, try to load README.md or index.md as default
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
  }, [apiBaseUrl, showHomePage, initialFilePath, basePath, useExternalRouter]);

  // Handle browser navigation (back/forward buttons) for both router modes
  useEffect(() => {
    const handlePopState = () => {
      // Re-parse URL and load the appropriate file
      let urlFilePath: string | null = null;
      
      if (useExternalRouter) {
        // For external router mode, extract from window.location.pathname
        const currentPath = window.location.pathname;
        if (currentPath && currentPath !== '/' && basePath) {
          const basePathNormalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
          if (currentPath.startsWith(basePathNormalized)) {
            urlFilePath = currentPath.substring(basePathNormalized.length);
            if (urlFilePath.startsWith('/')) {
              urlFilePath = urlFilePath.substring(1);
            }
          }
        }
      } else {
        // For standalone mode (internal router), extract from hash or pathname
        const currentPath = window.location.hash ? window.location.hash.substring(1) : window.location.pathname;
        if (currentPath && currentPath !== '/') {
          urlFilePath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
        }
      }
      
      if (urlFilePath && fileTree.length > 0) {
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
        
        const targetFile = findFileByPath(fileTree, urlFilePath);
        if (targetFile) {
          handleFileSelect(targetFile);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fileTree, basePath, useExternalRouter]);

  // Handle file selection
  const handleFileSelect = async (file: FileNode) => {
    try {
      setIsLoading(true);
      setSelectedFile(file);
      
      // Update the URL based on router mode
      if (useExternalRouter && window.history) {
        // For external router mode, update pathname
        const filePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        const newPath = `${basePath}${basePath.endsWith('/') ? '' : '/'}${filePath}`;
        window.history.pushState({}, '', newPath);
      } else if (!useExternalRouter && window.history) {
        // For standalone mode, update hash
        const filePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        window.history.pushState({}, '', `#/${filePath}`);
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
