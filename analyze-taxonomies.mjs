import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const dir = path.join(process.cwd(), 'src/content/posts');

// 扫描所有文件以了解目前的分布
let currentCategories = {};
let currentTags = {};

function traverse(currentDir) {
  const items = fs.readdirSync(currentDir);
  for (const item of items) {
    const fullPath = path.join(currentDir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      try {
        const parsed = matter(content);
        const { category, tags } = parsed.data;
        if (category) {
          currentCategories[category] = (currentCategories[category] || 0) + 1;
        }
        if (tags && Array.isArray(tags)) {
          tags.forEach(t => {
            currentTags[t] = (currentTags[t] || 0) + 1;
          });
        }
      } catch (e) {
        // Skip unparseable
      }
    }
  }
}

traverse(dir);

console.log("Current Categories:", Object.entries(currentCategories).sort((a, b) => b[1] - a[1]));
console.log("Current Tags (Top 20):", Object.entries(currentTags).sort((a, b) => b[1] - a[1]).slice(0, 20));
