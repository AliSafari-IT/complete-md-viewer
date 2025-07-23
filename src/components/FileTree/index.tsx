import React, { useState } from 'react';
import { TreeNode, FileTreeProps } from '../../types';
import './FileTree.css';

/**
 * Component for rendering a file tree with expandable directories
 */
const FileTree: React.FC<FileTreeProps> = ({
  data,
  selectedPath,
  onFileSelect,
  className = '',
}) => {
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});

  const toggleDirectory = (dirPath: string) => {
    setExpandedDirs(prev => ({
      ...prev,
      [dirPath]: !prev[dirPath]
    }));
  };

  const renderTreeNode = (node: TreeNode) => {
    const isSelected = node.path === selectedPath;
    
    if (node.type === 'file') {
      return (
        <li 
          key={node.id} 
          className={`file-node ${isSelected ? 'selected' : ''}`}
          onClick={() => onFileSelect(node)}
        >
          <span className="file-icon">📄</span>
          <span className="file-name">{node.name}</span>
        </li>
      );
    } else {
      const isExpanded = expandedDirs[node.path] || false;
      
      return (
        <li key={node.id} className="directory-node">
          <div 
            className="directory-header"
            onClick={() => toggleDirectory(node.path)}
          >
            <span className="directory-icon">{isExpanded ? '📂' : '📁'}</span>
            <span className="directory-name">{node.name}</span>
          </div>
          
          {isExpanded && node.children.length > 0 && (
            <ul className="directory-children">
              {node.children.map(child => renderTreeNode(child))}
            </ul>
          )}
        </li>
      );
    }
  };

  return (
    <div className={`file-tree ${className}`}>
      <ul className="tree-root">
        {data.map(node => renderTreeNode(node))}
      </ul>
    </div>
  );
};

export default FileTree;
