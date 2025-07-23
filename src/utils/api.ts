import { TreeNode } from '../types';
import { parseFrontMatter } from '../utils/markdown';

/**
 * Fetch the file tree from the API
 * @param apiBaseUrl The base URL of the API
 * @returns Promise resolving to the file tree
 */
export const fetchFileTree = async (apiBaseUrl: string): Promise<TreeNode[]> => {
  try {
    const url = `${apiBaseUrl}/api/files`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file tree: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching file tree:', error);
    throw error;
  }
};

/**
 * Fetch the content of a file from the API
 * @param apiBaseUrl The base URL of the API
 * @param filePath The path of the file to fetch
 * @returns Promise resolving to the file content and front matter
 */
export const fetchFileContent = async (
  apiBaseUrl: string, 
  filePath: string
): Promise<{ content: string; frontMatter: Record<string, any> | null }> => {
  try {
    // Ensure filePath starts with a slash
    if (!filePath.startsWith('/')) {
      filePath = `/${filePath}`;
    }
    
    const url = `${apiBaseUrl}/api/content${filePath}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    const { content, frontMatter } = parseFrontMatter(text);
    
    return { content, frontMatter };
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
};
