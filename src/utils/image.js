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
