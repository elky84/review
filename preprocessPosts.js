const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'public', 'posts');

function getAllMarkdownFiles(dir) {
  let files = [];

  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getAllMarkdownFiles(fullPath)); // 재귀적으로 하위 폴더 순회
    } else if (file.endsWith('.md')) {
      files.push(fullPath);
    }
  });

  return files;
}

function getAllPosts() {
  const filePaths = getAllMarkdownFiles(postsDirectory);
  const postsData = filePaths.map(fullPath => {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    
    if (data.date) {
      const date = new Date(data.date);
      const formattedDate = date.toISOString().split('T')[0];
      data.date = formattedDate;
    }

    return {
      ...data,
      slug: path.relative(postsDirectory, fullPath).replace(/\.md$/, '') // 상대 경로 기반 슬러그 생성
    };
  });

  return postsData.reverse();
}

const postsData = getAllPosts();
fs.writeFileSync('./public/postsData.json', JSON.stringify(postsData, null, 2), 'utf8');
