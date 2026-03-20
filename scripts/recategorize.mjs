import fs from 'fs/promises';
import path from 'path';

const postsDir = '/Users/wengkaimin/Desktop/repos/NollieLeo.github.io/src/content/posts';

// 定义精简后的 5 大核心分类映射
const categoryMap = {
  'JavaScript 核心': '前端开发',
  '前端框架与源码': '前端开发',
  'CSS 与 UI': '前端开发',
  '网络与浏览器': '前端开发',
  'Node.js 与后端': '前端开发',
  '工程化与基建': '工程化与架构',
  '架构与实战': '工程化与架构',
  '进阶与性能优化': '工程化与架构',
  '数据结构与算法': '算法与基础',
  '计算机基础': '算法与基础',
  '设计模式': '算法与基础',
  '效率与工具': '效率与工具',
  '踩坑与解决方案': '复盘与随笔',
  '面试与复盘': '复盘与随笔',
  '杂谈与随笔': '复盘与随笔',
};

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function run() {
  const files = await getFiles(postsDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const stats = {};

  for (const file of mdFiles) {
    let content = await fs.readFile(file, 'utf8');
    const catMatch = content.match(/^category:\s*"(.*?)"/m) || content.match(/^category:\s*(.*?)$/m);

    if (catMatch) {
      let oldCat = catMatch[1].replace(/['"]/g, '').trim();
      let newCat = categoryMap[oldCat];

      // 如果已经是新的分类名，就不动
      if (!newCat) {
         if (Object.values(categoryMap).includes(oldCat)) {
             newCat = oldCat;
         } else {
             newCat = '前端开发'; // 兜底
         }
      }

      stats[newCat] = (stats[newCat] || 0) + 1;
      content = content.replace(/^category:.*$/m, `category: "${newCat}"`);
      await fs.writeFile(file, content, 'utf8');
    }
  }

  console.log('Recategorization complete. Stats:');
  console.table(stats);
}

run().catch(console.error);
