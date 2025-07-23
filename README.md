# @asafarim/complete-md-viewer

A flexible markdown viewer component for React applications with support for both standalone and integrated use cases.

## Features

- 📁 File tree navigation for browsing markdown files
- 📝 Markdown rendering with syntax highlighting
- 🔍 YAML front matter support
- 🌗 Light and dark theme support
- 🔄 Flexible integration options:
  - Standalone mode with its own router
  - Integrated mode that works with your existing router

## Installation

```bash
npm install @asafarim/complete-md-viewer
# or
yarn add @asafarim/complete-md-viewer
# or
pnpm add @asafarim/complete-md-viewer
```

## Usage

### Standalone Mode

Use the `StandaloneMarkdownViewer` component when you want to use the viewer as a standalone application with its own router:

```tsx
import { StandaloneMarkdownViewer } from '@asafarim/complete-md-viewer';
import '@asafarim/complete-md-viewer/dist/style.css';

function App() {
  return (
    <StandaloneMarkdownViewer 
      apiBaseUrl="http://localhost:3300"
      showHomePage={true}
      hideFileTree={false}
    />
  );
}
```

### Integrated Mode

Use the `IntegratedMarkdownViewer` component when you want to embed the viewer in an existing React application that already uses React Router:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IntegratedMarkdownViewer } from '@asafarim/complete-md-viewer';
import '@asafarim/complete-md-viewer/dist/style.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs/*" element={
          <IntegratedMarkdownViewer 
            apiBaseUrl="http://localhost:3300"
            showHomePage={true}
            hideFileTree={false}
            basePath="/docs"
          />
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

### Basic Components

You can also use the individual components for more customization:

```tsx
import { MarkdownContent, FileTree } from '@asafarim/complete-md-viewer';
import '@asafarim/complete-md-viewer/dist/style.css';

function CustomMarkdownViewer() {
  const [content, setContent] = useState('');
  const [frontMatter, setFrontMatter] = useState({});
  
  return (
    <div className="custom-viewer">
      <MarkdownContent 
        content={content}
        frontMatter={frontMatter}
      />
    </div>
  );
}
```

## API Reference

### StandaloneMarkdownViewer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| apiBaseUrl | string | - | API base URL for fetching markdown content |
| showHomePage | boolean | true | Whether to show the home page |
| hideFileTree | boolean | false | Whether to hide the file tree |
| className | string | - | Custom CSS class name |
| style | object | - | Custom styles |
| basePath | string | '/' | Base path for routing |

### IntegratedMarkdownViewer

Same props as `StandaloneMarkdownViewer`.

### MarkdownViewer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| apiBaseUrl | string | - | API base URL for fetching markdown content |
| showHomePage | boolean | true | Whether to show the home page |
| hideFileTree | boolean | false | Whether to hide the file tree |
| useExternalRouter | boolean | false | Whether to use external router for navigation |
| className | string | - | Custom CSS class name |
| style | object | - | Custom styles |
| basePath | string | '/' | Base path for routing |

### MarkdownContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | string | - | Markdown content to render |
| frontMatter | object | - | Front matter data |
| className | string | - | Custom CSS class name |

### FileTree

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | TreeNode[] | - | Tree data |
| selectedPath | string | - | Currently selected file path |
| onFileSelect | function | - | Callback when a file is selected |
| className | string | - | Custom CSS class name |

## API Server Requirements

The package expects the following API endpoints:

- `GET /api/files` - Returns the file tree structure
- `GET /api/content/:path` - Returns the content of a file at the specified path

## License

MIT
