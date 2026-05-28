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
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. Chuyển TTC sang các file TTF tạm
  console.log('1. Giải nén file TrueType Collection (TTC) thành các file TTF...');
  ttc2ttf(TTC_PATH, TEMP_DIR);

  // 3. Quét các file TTF tạm để phân tích thông tin
  const files = fs.readdirSync(TEMP_DIR).filter(file => file.endsWith('.ttf'));
  console.log(`   Tổng số font trong TTC: ${files.length}`);

  console.log('\n2. Đọc thông tin và convert các file TTF sang WOFF2...');
  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);

    try {
      // Đọc buffer ttf
      const ttfBuffer = fs.readFileSync(filePath);

      // Dùng API opentype.parse thay vì loadSync (đã deprecated)
      const font = opentype.parse(ttfBuffer.buffer);
      const names = font.names;

      const postScriptName = names.postScriptName?.en || names.fontFamily?.en || 'GillSans';
      const fullName = names.fullName?.en || postScriptName;

      console.log(`\n   Đang xử lý: "${fullName}" | PostScript: ${postScriptName}`);

      // Xác định tên file đầu ra dựa trên postScriptName
      let outputFileName = '';
      const lowerPost = postScriptName.toLowerCase().replace(/[^a-z]/g, '');

      if (lowerPost.includes('bolditalic') || lowerPost.includes('boldobliqueitalic')) {
        outputFileName = 'GillSans-BoldItalic.woff2';
      } else if (lowerPost.includes('bold')) {
        outputFileName = 'GillSans-Bold.woff2';
      } else if (lowerPost.includes('lightitalic') || lowerPost.includes('lightoblique')) {
        outputFileName = 'GillSans-LightItalic.woff2';
      } else if (lowerPost.includes('light')) {
        outputFileName = 'GillSans-Light.woff2';
      } else if (lowerPost.includes('semibold') || lowerPost.includes('medium')) {
        outputFileName = 'GillSans-SemiBold.woff2';
      } else if (lowerPost.includes('italic') || lowerPost.includes('oblique')) {
        outputFileName = 'GillSans-Italic.woff2';
      } else if (lowerPost.includes('condensed')) {
        outputFileName = 'GillSans-Condensed.woff2';
      } else if (lowerPost === 'gillsans' || lowerPost.includes('regular')) {
        outputFileName = 'GillSans-Regular.woff2';
      } else {
        // Tên file mặc định theo postScriptName nếu không nhận dạng được
        outputFileName = `GillSans-${postScriptName.replace(/[^a-zA-Z0-9]/g, '')}.woff2`;
      }

      // Kiểm tra xem đã có file trùng tên chưa
      const outputFilePath = path.join(OUTPUT_DIR, outputFileName);
      if (fs.existsSync(outputFilePath)) {
        console.log(`   ⚠️  Bỏ qua (đã tồn tại): ${outputFileName}`);
        continue;
      }

      // Convert sang woff2
      console.log(`   -> Đang nén thành WOFF2: ${outputFileName}...`);
      const woff2Buffer = await wawoff2.compress(ttfBuffer);

      // Ghi ra file
      fs.writeFileSync(outputFilePath, woff2Buffer);
      console.log(`   ✅ Đã ghi thành công: public/fonts/${outputFileName} (${Math.round(woff2Buffer.length / 1024)} KB)`);

    } catch (err) {
      console.error(`   ❌ Lỗi khi xử lý file ${file}:`, err.message);
    }
  }

  // 4. Dọn dẹp thư mục tạm
  console.log('\n3. Đang dọn dẹp các file TTF tạm thời...');
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  // 5. Liệt kê kết quả
  console.log('\n--- Các file font đã tạo trong public/fonts/ ---');
  const outputFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('GillSans'));
  outputFiles.forEach(f => {
    const size = Math.round(fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024);
    console.log(`  ${f} (${size} KB)`);
  });
  console.log('\n✅ Hoàn thành trích xuất và tối ưu hóa font Gill Sans!');
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
