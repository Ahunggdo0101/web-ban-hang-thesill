const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/ProductDetailPage.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

let divStack = [];
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

  // Kiểm tra thẻ div
  if (char === '<' && content.slice(i, i + 4) === '<div') {
    divStack.push({ type: 'div', line: currentLine });
  } else if (char === '<' && content.slice(i, i + 6) === '</div') {
    if (divStack.length === 0) {
      console.log(`LỖI: Gặp thẻ đóng </div> thừa ở dòng ${currentLine}`);
    } else {
      const popped = divStack.pop();
      console.log(`Dòng ${currentLine}: </div> đóng cho <div ở dòng ${popped.line}`);
    }
  }
}

if (divStack.length > 0) {
  console.log('Các thẻ <div chưa được đóng:');
  divStack.forEach(item => {
    console.log(`- <div ở dòng ${item.line}`);
  });
} else {
  console.log('Tất cả các thẻ <div đều đã được đóng đầy đủ!');
}
