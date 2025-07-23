import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Fix for TypeScript type issue with react-syntax-highlighter
const darkCodeStyle = vscDarkPlus as any;
const lightCodeStyle = vs as any;
import { MarkdownContentProps } from '../types';
import FrontMatterDisplay from './FrontMatterDisplay';

/**
 * Component for rendering markdown content with syntax highlighting
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  frontMatter,
  className = '',
  theme = 'dark'
}) => {
  // Determine which code style to use based on theme
  const codeStyle = theme === 'light' ? lightCodeStyle : darkCodeStyle;

  return (
    <div className={`markdown-content ${className} ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
      {/* Use our new FrontMatterDisplay component */}
      <FrontMatterDisplay frontMatter={frontMatter} theme={theme as 'light' | 'dark'} />
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={codeStyle}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
