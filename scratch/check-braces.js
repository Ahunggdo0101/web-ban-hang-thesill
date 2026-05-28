const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/ProductDetailPage.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

let openBraces = 0;
let closeBraces = 0;
let inString = null; // ' or " or `
let inComment = false;
let inSlashComment = false;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const nextChar = content[i + 1];

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
    openBraces++;
  } else if (char === '}') {
    closeBraces++;
  }
}

console.log(`Số dấu mở ngoặc nhọn { : ${openBraces}`);
console.log(`Số dấu đóng ngoặc nhọn } : ${closeBraces}`);
console.log(`Lệch ngoặc (Mở - Đóng): ${openBraces - closeBraces}`);
