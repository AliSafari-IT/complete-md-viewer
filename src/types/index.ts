// File and directory structure types
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file';
  content?: string;
  frontMatter?: Record<string, any>;
}

export interface DirectoryNode {
  id: string;
  name: string;
  path: string;
  type: 'directory';
  children: (FileNode | DirectoryNode)[];
}

export type TreeNode = FileNode | DirectoryNode;

// Theme type
export type ThemeType = 'light' | 'dark';

// Component props types
export interface MarkdownViewerProps {
  /**
   * API base URL for fetching markdown content
   */
  apiBaseUrl: string;
  
  /**
   * Whether to show the home page
   * @default true
   */
  showHomePage?: boolean;
  
  /**
   * Whether to hide the file tree
   * @default false
   */
  hideFileTree?: boolean;
  
  /**
   * Whether to use external router for navigation
   * If true, the component will use the parent application's router
   * If false, it will create its own router (for standalone use)
   * @default false
   */
  useExternalRouter?: boolean;
  
  /**
   * Initial file path to load when component mounts
   * Used for direct navigation to specific files
   */
  initialFilePath?: string | null;
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Custom inline styles
   */
  style?: React.CSSProperties;
  
  /**
   * Base path for routing
   * @default '/'
   */
  basePath?: string;
  
  /**
   * Theme for rendering
   * @default 'dark'
   */
  theme?: ThemeType;
}

export interface MarkdownContentProps {
  /**
   * Markdown content to render
   */
  content: string;
  
  /**
   * Front matter data
   */
  frontMatter: Record<string, any> | null;
  
  /**
   * Custom CSS class name
   */
  className?: string;
  
  /**
   * Theme for rendering
   * @default 'dark'
   */
  theme?: ThemeType;
}

export interface FileTreeProps {
  /**
   * Tree data
   */
  data: TreeNode[];
  
  /**
   * Currently selected file path
   */
  selectedPath?: string;
  
  /**
   * Callback when a file is selected
   */
  onFileSelect: (file: FileNode) => void;
  
  /**
   * Custom CSS class name
   */
  className?: string;
}
