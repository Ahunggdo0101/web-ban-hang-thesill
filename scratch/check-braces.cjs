const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/ProductDetailPage.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

let stack = [];
let inString = null; // ' or " or `
let inComment = false;
let inSlashComment = false;
let currentLine = 1;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const nextChar = content[i + 1];

  if (char === '\n') {
    currentLine++;
  }

  // Xử lý comment
  if (inComment) {
    if (char === '*' && nextChar === '/') {
      inComment = false;
      i++;
    }
    continue;
  }
  if (inSlashComment) {
    if (char === '\n') {
      inSlashComment = false;
    }
    continue;
  }
  if (char === '/' && nextChar === '*') {
    inComment = true;
    i++;
    continue;
  }
  if (char === '/' && nextChar === '/') {
    inSlashComment = true;
    i++;
    continue;
  }

  // Xử lý chuỗi ký tự
  if (inString) {
    if (char === '\\') {
      i++; // Bỏ qua ký tự escape
    } else if (char === inString) {
      inString = null;
    }
    continue;
  }

  if (char === "'" || char === '"' || char === '`') {
    inString = char;
    continue;
  }

  // Đếm ngoặc
  if (char === '{') {
    stack.push({ type: '{', line: currentLine });
  } else if (char === '}') {
    if (stack.length === 0) {
      console.log(`LỖI: Dấu đóng } thừa ở dòng ${currentLine}`);
    } else {
      const popped = stack.pop();
      if (popped.line < 100 || currentLine > 880) {
        console.log(`Pop: } ở dòng ${currentLine} đóng cho { ở dòng ${popped.line}`);
      }
    }
  }
}
