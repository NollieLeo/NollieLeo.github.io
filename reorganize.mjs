import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Rules for mapping old categories to new categories
const categoryMap = {
  // Front-End Basics
  'Javascript': '前端开发',
  'Css': '前端开发',
  'Html': '前端开发',
  'Typescript': '前端开发',
  
  // Frameworks
  'React': '前端框架',
  'Vue': '前端框架',
  'React-router': '前端框架',
  
  // Engineering & Tooling
  'webpack': '工程化',
  'webpack-loader': '工程化',
  'webpack-plugins': '工程化',
  'Vite': '工程化',
  'Babel': '工程化',
  'Eslint': '工程化',
  'Npm': '工程化',
  'git': '工程化',
  '规范': '工程化',
  
  // CS Basics
  '算法': '计算机基础',
  '设计模式': '计算机基础',
  '浏览器': '计算机基础',
  'http': '计算机基础',
  'fetch': '计算机基础',
  '后端': '计算机基础',
  'nodeJS': '计算机基础',
  
  // Career
  '面试': '面试与总结',
  '面试经历': '面试与总结',
  '面试题': '面试与总结',
  
  // Others
  'Bug': '踩坑记录',
  '书籍': '资源分享',
  '未分类': '未分类'
};

// Rules to clean up and normalize tags
// lowercase everything, replace space with hyphen
const normalizeTag = (t) => {
  if (!t) return t;
  let normalized = t.trim();
  // We can choose to keep PascalCase or not, let's just trim and replace some known variants
  const tagMap = {
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'css': 'CSS',
    'html': 'HTML',
    'react': 'React',
    'vue': 'Vue',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'webpack': 'Webpack',
    'vite': 'Vite',
    '面试题': '面试题',
    '算法': '算法',
    '设计模式': '设计模式'
  };
  return tagMap[normalized.toLowerCase()] || normalized;
};

const dir = path.join(process.cwd(), 'src/content/posts');

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
        const { data } = parsed;
        let modified = false;

        // 1. Remap Category
        if (data.category && categoryMap[data.category]) {
          // If the current category matches one of the granular ones, add it to tags!
          const oldCat = data.category;
          data.category = categoryMap[oldCat];
          
          if (!data.tags) data.tags = [];
          if (oldCat !== '未分类' && !data.tags.includes(oldCat)) {
            data.tags.push(oldCat);
          }
          modified = true;
        } else if (!data.category) {
          data.category = '未分类';
          modified = true;
        }

        // 2. Normalize and Deduplicate Tags
        if (data.tags) {
          let tagsArray = Array.isArray(data.tags) ? data.tags : [data.tags];
          tagsArray = tagsArray.map(normalizeTag);
          // deduplicate
          tagsArray = [...new Set(tagsArray)];
          data.tags = tagsArray;
          modified = true;
        }

        if (modified) {
          const newContent = matter.stringify(parsed.content, data);
          fs.writeFileSync(fullPath, newContent, 'utf8');
        }
      } catch (e) {
        console.error(`Failed to parse ${fullPath}:`, e.message);
      }
    }
  }
}

traverse(dir);
console.log("Taxonomy reorganization complete.");
