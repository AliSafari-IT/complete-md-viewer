import yaml from 'js-yaml';

/**
 * Parse front matter from markdown content
 * @param content The markdown content
 * @returns The parsed content and front matter
 */
export const parseFrontMatter = (
  content: string
): { content: string; frontMatter: Record<string, any> | null } => {
  // Check if the content starts with front matter delimiter
  if (!content.startsWith('---')) {
    return { content, frontMatter: null };
  }

  try {
    // Find the second front matter delimiter
    const endDelimiterIndex = content.indexOf('---', 3);
    if (endDelimiterIndex === -1) {
      return { content, frontMatter: null };
    }

    // Extract front matter and parse it
    const frontMatterRaw = content.substring(3, endDelimiterIndex).trim();
    const frontMatter = yaml.load(frontMatterRaw) as Record<string, any>;

    // Extract content without front matter
    const contentWithoutFrontMatter = content.substring(endDelimiterIndex + 3).trim();

    return {
      content: contentWithoutFrontMatter,
      frontMatter,
    };
  } catch (error) {
    console.error('Error parsing front matter:', error);
    return { content, frontMatter: null };
  }
};
