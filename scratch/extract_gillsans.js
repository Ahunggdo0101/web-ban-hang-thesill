const fs = require('fs');
const path = require('path');
const ttc2ttf = require('ttc2ttf').default;
const wawoff2 = require('wawoff2');
const opentype = require('opentype.js');

const TTC_PATH = '/System/Library/Fonts/Supplemental/GillSans.ttc';
const TEMP_DIR = path.join(__dirname, 'ttf_temp');
const OUTPUT_DIR = path.join(__dirname, '../public/fonts');

async function main() {
  console.log('--- Bắt đầu trích xuất font Gill Sans ---');

  if (!fs.existsSync(TTC_PATH)) {
    console.error(`Không tìm thấy file TTC tại đường dẫn: ${TTC_PATH}`);
    process.exit(1);
  }

  // 1. Tạo thư mục tạm và thư mục đích
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. Chuyển TTC sang các file TTF tạm
  console.log('1. Giải nén file TrueType Collection (TTC) thành các file TTF...');
  ttc2ttf(TTC_PATH, TEMP_DIR);

  // 3. Quét các file TTF tạm để phân tích thông tin
  console.log('2. Đọc thông tin và convert các file TTF sang WOFF2...');
  const files = fs.readdirSync(TEMP_DIR).filter(file => file.endsWith('.ttf'));

  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);
    
    try {
      // Đọc font bằng opentype.js
      const font = opentype.loadSync(filePath);
      const names = font.names;
      
      // Lấy tên sub-family (Regular, Bold, Italic, v.v.)
      // 2: Font Subfamily name (ví dụ: Regular, Bold)
      // 16: Preferred Family hoặc 17: Preferred Subfamily
      const subfamily = names.fontSubfamily?.en || 'Regular';
      const fullName = names.fullName?.en || 'Gill Sans';
      const postScriptName = names.postScriptName?.en || 'GillSans';

      console.log(`Đang xử lý font: "${fullName}" (${subfamily}) - PostScript: ${postScriptName}`);

      // Xác định tên file đầu ra dựa trên subfamily hoặc postScriptName
      let outputFileName = '';
      const lowerPost = postScriptName.toLowerCase();

      if (lowerPost.includes('bolditalic')) {
        outputFileName = 'GillSans-BoldItalic.woff2';
      } else if (lowerPost.includes('bold')) {
        outputFileName = 'GillSans-Bold.woff2';
      } else if (lowerPost.includes('italic')) {
        outputFileName = 'GillSans-Italic.woff2';
      } else if (lowerPost.includes('lightitalic')) {
        outputFileName = 'GillSans-LightItalic.woff2';
      } else if (lowerPost.includes('light')) {
        outputFileName = 'GillSans-Light.woff2';
      } else if (lowerPost.includes('semibold')) {
        outputFileName = 'GillSans-SemiBold.woff2';
      } else if (lowerPost.includes('regular') || lowerPost === 'gillsans') {
        outputFileName = 'GillSans-Regular.woff2';
      } else {
        // Tên file mặc định theo subfamily nếu không nhận dạng được
        outputFileName = `GillSans-${subfamily.replace(/\s+/g, '')}.woff2`;
      }

      const outputFilePath = path.join(OUTPUT_DIR, outputFileName);

      // Đọc buffer ttf
      const ttfBuffer = fs.readFileSync(filePath);
      
      // Convert sang woff2
      console.log(`   -> Đang nén thành WOFF2: ${outputFileName}...`);
      const woff2Buffer = await wawoff2.compress(ttfBuffer);
      
      // Ghi ra file
      fs.writeFileSync(outputFilePath, woff2Buffer);
      console.log(`   ✅ Đã ghi thành công: public/fonts/${outputFileName}`);

    } catch (err) {
      console.error(`Lỗi khi xử lý file ${file}:`, err);
    }
  }

  // 4. Dọn dẹp thư mục tạm
  console.log('3. Đang dọn dẹp các file TTF tạm thời...');
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('✅ Hoàn thành trích xuất và tối ưu hóa font Gill Sans!');
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
});
