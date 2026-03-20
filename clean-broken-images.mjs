import fs from 'fs';
import path from 'path';

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (file.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Clean up the javascriptcript warning
      content = content.replace(/javascriptcript/g, 'javascript');

      // Match markdown images: ![alt](url)
      const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      content = content.replace(mdRegex, (match, alt, url) => {
        // Skip http/https
        if (url.startsWith('http')) return match;
        
        // Resolve local path relative to this md file
        const resolvedPath = path.resolve(path.dirname(fullPath), url.replace(/^\.\//, ''));
        if (!fs.existsSync(resolvedPath)) {
          changed = true;
          return `*[Image missing: ${alt || url}]*`;
        }
        
        if (!url.startsWith('.') && !url.startsWith('/')) {
           changed = true;
           return `![${alt}](./${url})`;
        }
        
        return match;
      });

      // Match HTML images: <img src="url" ...>
      const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
      content = content.replace(htmlRegex, (match, url) => {
        if (url.startsWith('http')) return match;
        const resolvedPath = path.resolve(path.dirname(fullPath), url.replace(/^\.\//, ''));
        if (!fs.existsSync(resolvedPath)) {
          changed = true;
          return `*[Image missing: ${url}]*`;
        }
        if (!url.startsWith('.') && !url.startsWith('/')) {
           changed = true;
           return match.replace(url, `./${url}`);
        }
        return match;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

traverse(path.join(process.cwd(), 'src/content/posts'));
