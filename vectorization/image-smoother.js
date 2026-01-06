/**
 * Image Smoother - Smooth PNG images before vectorization
 * Uses StackBlur to reduce jagged edges and noise
 */

class ImageSmoother {
    constructor() {
        this.defaultBlurRadius = 3; // Default blur radius
    }

    /**
     * Smooth ImageData using Gaussian Blur
     * @param {ImageData} imageData - Original image data
     * @param {number} radius - Blur radius (1-10, recommended 2-4)
     * @returns {Promise<ImageData>} - Smoothed ImageData
     */
    async smoothImageData(imageData, radius = this.defaultBlurRadius) {
        try {
            // Create temporary canvas
            const canvas = document.createElement('canvas');
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext('2d');
            
            // Draw imageData to canvas
            ctx.putImageData(imageData, 0, 0);
            
            // Apply StackBlur if available
            if (window.StackBlur) {
                StackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, radius);
            } else {
                // Fallback: Use canvas filter
                ctx.filter = `blur(${radius}px)`;
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(canvas, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(tempCanvas, 0, 0);
                ctx.filter = 'none';
            }
            
            // Get smoothed ImageData
            const smoothedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            return smoothedImageData;
            
        } catch (error) {
            return imageData; // Return original image on error
        }
    }

    /**
     * Smooth image with multiple light blur passes (better than one strong blur)
     * @param {ImageData} imageData - Original image data
     * @param {number} iterations - Number of blur passes (default: 2)
     * @param {number} radius - Radius for each blur pass (default: 2)
     * @returns {Promise<ImageData>}
     */
    async smoothImageDataMultiple(imageData, iterations = 2, radius = 2) {
        let result = imageData;
        
        for (let i = 0; i < iterations; i++) {
            result = await this.smoothImageData(result, radius);
        }
        
        return result;
    }

    /**
     * Selective smoothing - only blur edges
     * @param {ImageData} imageData - Original image data
     * @param {number} edgeThreshold - Edge detection threshold (0-255)
     * @param {number} blurRadius - Blur radius for edges
     * @returns {Promise<ImageData>}
     */
    async smoothEdgesOnly(imageData, edgeThreshold = 30, blurRadius = 3) {
        try {
            const width = imageData.width;
            const height = imageData.height;
            const data = imageData.data;
            
            // Create edge map
            const edgeMap = new Uint8Array(width * height);
            
            // Detect edges using simple Sobel operator
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Get grayscale value
                    const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    
                    // Compare with surrounding pixels
                    const left = (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3;
                    const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
                    const top = (data[idx - width * 4] + data[idx - width * 4 + 1] + data[idx - width * 4 + 2]) / 3;
                    const bottom = (data[idx + width * 4] + data[idx + width * 4 + 1] + data[idx + width * 4 + 2]) / 3;
                    
                    const gradientX = Math.abs(right - left);
                    const gradientY = Math.abs(bottom - top);
                    const gradient = Math.sqrt(gradientX * gradientX + gradientY * gradientY);
                    
                    edgeMap[y * width + x] = gradient > edgeThreshold ? 1 : 0;
                }
            }
            
            // Smooth entire image
            const smoothed = await this.smoothImageData(imageData, blurRadius);
            
            // Blend: Use smoothed image for edges, keep original for other areas
            const result = new ImageData(width, height);
            const resultData = result.data;
            const smoothedData = smoothed.data;
            
            for (let i = 0; i < width * height; i++) {
                const isEdge = edgeMap[i];
                const idx = i * 4;
                
                if (isEdge) {
                    // Edge: use smoothed image
                    resultData[idx] = smoothedData[idx];
                    resultData[idx + 1] = smoothedData[idx + 1];
                    resultData[idx + 2] = smoothedData[idx + 2];
                    resultData[idx + 3] = smoothedData[idx + 3];
                } else {
                    // Not edge: keep original
                    resultData[idx] = data[idx];
                    resultData[idx + 1] = data[idx + 1];
                    resultData[idx + 2] = data[idx + 2];
                    resultData[idx + 3] = data[idx + 3];
                }
            }
            
            return result;
            
        } catch (error) {
            return imageData;
        }
    }

    /**
     * Simple anti-aliasing using downscale + upscale
     * @param {ImageData} imageData - Original image data
     * @param {number} scaleFactor - Scale factor (default: 2)
     * @returns {Promise<ImageData>}
     */
    async antiAlias(imageData, scaleFactor = 2) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            const ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            
            // Downscale
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = canvas.width / scaleFactor;
            smallCanvas.height = canvas.height / scaleFactor;
            const smallCtx = smallCanvas.getContext('2d');
            smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            
            // Upscale with smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(smallCanvas, 0, 0, canvas.width, canvas.height);
            
            const result = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return result;
            
        } catch (error) {
            return imageData;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageSmoother;
}
