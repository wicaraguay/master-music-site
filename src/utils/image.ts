/**
 * Compresses an image file using a canvas-based approach.
 * Reduces dimensions to a maximum width/height and lowers JPEG quality.
 * 
 * @param file - The original image File object
 * @param maxWidth - Maximum width of the compressed image (default: 1920)
 * @param maxHeight - Maximum height of the compressed image (default: 1080)
 * @param quality - JPEG quality from 0.0 to 1.0 (default: 0.8)
 * @returns A Promise that resolves to the compressed File object (or original if compression is not needed/fails)
 */
export const compressImage = async (
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
): Promise<File | Blob> => {
    // Only process images
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Skip very small files (less than 50KB)
    if (file.size < 50 * 1024) {
        return file;
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

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

                // Create canvas and draw image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(file);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas back to Blob/File
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Create a new File from blob to preserve original name (mostly)
                            // Change extension to .webp
                            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                            const compressedFile = new File([blob], newFileName, {
                                type: 'image/webp',
                                lastModified: Date.now(),
                            });

                            // Only return compressed if it's actually smaller or if we want to force webp
                            if (compressedFile.size < file.size) {
                                console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`);
                                resolve(compressedFile);
                            } else {
                                // Even if not smaller, webp is often better for the browser
                                resolve(compressedFile);
                            }
                        } else {
                            resolve(file);
                        }
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};
