import fs from 'fs';
import parser from '@babel/parser';

try {
  const code = fs.readFileSync('src/pages/ProductDetailPage.jsx', 'utf-8');
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Parse SUCCESS!');
} catch (e) {
  console.error('Parse FAILED:', e.message);
  if (e.loc) {
    console.error(`Lỗi tại Dòng ${e.loc.line}, Cột ${e.loc.column}`);
  }
}
