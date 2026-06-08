export const optimizeUnsplashImage = (url, width = 400) => {
  if (!url || !url.includes('images.unsplash.com')) return url;
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', '75'); // Đặt chất lượng ảnh 75% để cân bằng dung lượng và chất lượng
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

/**
 * Nén hình ảnh từ phía Client bằng HTML5 Canvas trước khi upload lên máy chủ.
 * Hỗ trợ nhận ảnh dung lượng cực lớn (lên tới 100MB) và nén xuống còn khoảng 1MB - 2MB
 * mà vẫn giữ được độ sắc nét cao (tối đa 2560px), mắt thường không phân biệt được.
 */
export function compressImage(file, maxWidth = 2560, maxHeight = 2560, quality = 0.88) {
  return new Promise((resolve) => {
    // Chỉ nén nếu là file ảnh và dung lượng lớn hơn 1MB
    if (!file || !file.type.startsWith('image/') || file.size < 1.0 * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán lại kích thước nếu vượt quá giới hạn tối đa
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Vẽ ảnh lên canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Nén sang chất lượng JPEG
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Tạo file mới cùng tên nhưng dung lượng đã nén
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

