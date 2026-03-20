import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const sourceDir = path.join(process.cwd(), '_hexo_backup/source/_posts');
const targetDir = path.join(process.cwd(), 'src/content/posts');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// 1. Gather all files and directories
const items = fs.readdirSync(sourceDir);
const markdownFiles = items.filter(i => i.endsWith('.md'));
const directories = items.filter(i => fs.statSync(path.join(sourceDir, i)).isDirectory());

markdownFiles.forEach(mdFile => {
  const mdPath = path.join(sourceDir, mdFile);
  const baseName = mdFile.replace('.md', '');
  const isDirExists = directories.includes(baseName);
  
  const destDir = path.join(targetDir, baseName);
  const destMdPath = isDirExists ? path.join(destDir, 'index.md') : path.join(targetDir, mdFile);
  
  if (isDirExists) {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    // Copy all assets from the directory
    const assetsDir = path.join(sourceDir, baseName);
    const assets = fs.readdirSync(assetsDir);
    assets.forEach(asset => {
      fs.copyFileSync(path.join(assetsDir, asset), path.join(destDir, asset));
    });
  }

  // Read and transform frontmatter
  let contentStr = fs.readFileSync(mdPath, 'utf8');
  let parsed;
  try {
    parsed = matter(contentStr);
  } catch(e) {
    console.error(`Failed to parse ${mdFile}`);
    parsed = { data: {}, content: contentStr };
  }

  const { data, content } = parsed;
  const newData = {};

  newData.title = data.title || baseName;
  
  // Date logic
  newData.published = data.date ? new Date(data.date) : new Date(fs.statSync(mdPath).birthtime);
  if (data.updated) newData.updated = new Date(data.updated);
  
  // Description
  newData.description = data.description || '';
  if (!newData.description) {
     const plainText = content.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[.*?\]\(.*?\)/g, '').replace(/[#*`>~]/g, '').trim();
     newData.description = plainText.substring(0, 150).replace(/\n/g, ' ') + '...';
  }

  // Tags
  let tags = data.tags || [];
  if (!Array.isArray(tags)) tags = [tags];
  newData.tags = tags;
  
  // Category (Fuwari uses a single string)
  let category = '未分类';
  if (data.categories) {
    category = Array.isArray(data.categories) ? data.categories[0] : data.categories;
  }
  newData.category = category;

  // Cleanup Hexo specific path references
  let fixedContent = content;
  const winPathRegex = /D:\\Blogs\\NollieLeo.github.io\\source\\_posts\\[^\\]+\\([^)]+)/g;
  if (winPathRegex.test(fixedContent)) {
    fixedContent = fixedContent.replace(winPathRegex, '$1');
  }

  // Also replace some absolute Hexo paths and Windows local paths to relative
  // `![alt](C:\Users\...)` -> just the filename since it's copied to same dir
  fixedContent = fixedContent.replace(/!\[(.*?)\]\([^)]+\\([^)\\]+)\)/g, '![$1]($2)');
  fixedContent = fixedContent.replace(/<img[^>]+src=["']?[^"'>]+\/([^/"'>]+)["']?[^>]*>/g, '<img src="$1">');


  try {
    const finalOutput = matter.stringify(fixedContent, newData);
    fs.writeFileSync(destMdPath, finalOutput);
    console.log(`Migrated ${mdFile}`);
  } catch(e) {
    console.error(`Failed to write ${mdFile}`, e);
  }
});
