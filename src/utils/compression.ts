// ======================================
// COMPRESSION UTILITIES FOR 3G NETWORKS
// Optimized for Nigerian Mobile Users
// ======================================

// ======================================
// TYPES AND INTERFACES
// ======================================

interface CompressionOptions {
  level?: 'low' | 'medium' | 'high';
  format?: 'gzip' | 'brotli' | 'deflate';
  threshold?: number; // Minimum size in bytes to compress
}

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  ratio: number;
  format: string;
  data: ArrayBuffer | string;
}

interface NetworkConditions {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

// ======================================
// COMPRESSION ALGORITHMS
// ======================================

/**
 * Compress text data using various algorithms
 * Automatically selects best compression based on network conditions
 */
export const compressText = async (
  text: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const {
    level = 'medium',
    format = 'gzip',
    threshold = 1024 // 1KB minimum
  } = options;

  const originalSize = new TextEncoder().encode(text).length;

  // Skip compression for small data
  if (originalSize < threshold) {
    return {
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      format: 'none',
      data: text
    };
  }

  try {
    let compressedData: ArrayBuffer;
    let compressionFormat: string;

    // Use CompressionStream API if available (modern browsers)
    if ('CompressionStream' in window) {
      const stream = new CompressionStream(format);
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      // Write data to compression stream
      writer.write(new TextEncoder().encode(text));
      writer.close();

      // Read compressed data
      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      compressedData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        compressedData.set(chunk, offset);
        offset += chunk.length;
      }

      compressionFormat = format;
    } else {
      // Fallback: Use pako or similar library for older browsers
      // For now, we'll use a simple LZ-string compression
      const compressed = await compressWithLZString(text, level);
      compressedData = new TextEncoder().encode(compressed);
      compressionFormat = 'lz-string';
    }

    const compressedSize = compressedData.byteLength;
    const ratio = compressedSize / originalSize;

    return {
      originalSize,
      compressedSize,
      ratio,
      format: compressionFormat,
      data: compressedData
    };

  } catch (error) {
    console.error('Compression failed:', error);
    
    // Return uncompressed data on failure
    return {
      originalSize,
      compressedSize: originalSize,
      ratio: 1,
      format: 'none',
      data: text
    };
  }
};

/**
 * Decompress text data
 */
export const decompressText = async (
  data: ArrayBuffer | string,
  format: string
): Promise<string> => {
  if (format === 'none') {
    return typeof data === 'string' ? data : new TextDecoder().decode(data);
  }

  try {
    if (format === 'lz-string' && typeof data === 'string') {
      return await decompressWithLZString(data);
    }

    if ('DecompressionStream' in window && data instanceof ArrayBuffer) {
      const stream = new DecompressionStream(format as any);
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      // Write compressed data
      writer.write(data);
      writer.close();

      // Read decompressed data
      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      // Combine and decode
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      return new TextDecoder().decode(combined);
    }

    throw new Error(`Unsupported decompression format: ${format}`);

  } catch (error) {
    console.error('Decompression failed:', error);
    return typeof data === 'string' ? data : new TextDecoder().decode(data);
  }
};

// ======================================
// FALLBACK COMPRESSION (LZ-STRING)
// ======================================

/**
 * Simple LZ-string compression for older browsers
 */
const compressWithLZString = async (
  text: string,
  level: 'low' | 'medium' | 'high'
): Promise<string> => {
  // Simple run-length encoding for demo
  // In production, you'd use a proper library like lz-string
  
  let compressed = '';
  let i = 0;
  
  while (i < text.length) {
    let char = text[i];
    let count = 1;
    
    // Count consecutive characters
    while (i + count < text.length && text[i + count] === char && count < 255) {
      count++;
    }
    
    if (count > 3 || (level === 'high' && count > 1)) {
      // Use run-length encoding
      compressed += `${String.fromCharCode(0)}${char}${String.fromCharCode(count)}`;
    } else {
      // Use original characters
      compressed += text.substr(i, count);
    }
    
    i += count;
  }
  
  return compressed;
};

/**
 * Decompress LZ-string data
 */
const decompressWithLZString = async (compressed: string): Promise<string> => {
  let decompressed = '';
  let i = 0;
  
  while (i < compressed.length) {
    if (compressed.charCodeAt(i) === 0) {
      // Run-length encoded sequence
      const char = compressed[i + 1];
      const count = compressed.charCodeAt(i + 2);
      decompressed += char.repeat(count);
      i += 3;
    } else {
      // Regular character
      decompressed += compressed[i];
      i++;
    }
  }
  
  return decompressed;
};

// ======================================
// IMAGE COMPRESSION
// ======================================

/**
 * Compress images for 3G networks
 */
export const compressImage = async (
  file: File,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'webp' | 'png';
  } = {}
): Promise<File> => {
  const {
    quality = 0.7,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// ======================================
// NETWORK-AWARE COMPRESSION
// ======================================

/**
 * Get optimal compression settings based on network conditions
 */
export const getOptimalCompressionSettings = (
  networkConditions: Partial<NetworkConditions>
): CompressionOptions => {
  const {
    effectiveType = '3g',
    downlink = 1.5,
    rtt = 300,
    saveData = false
  } = networkConditions;

  // High compression for slow networks
  if (effectiveType === 'slow-2g' || effectiveType === '2g' || saveData) {
    return {
      level: 'high',
      format: 'gzip',
      threshold: 512 // Compress even small data
    };
  }

  // Medium compression for 3G
  if (effectiveType === '3g' || downlink < 2) {
    return {
      level: 'medium',
      format: 'gzip',
      threshold: 1024
    };
  }

  // Light compression for faster networks
  return {
    level: 'low',
    format: 'gzip',
    threshold: 2048
  };
};

/**
 * Compress API response data based on network conditions
 */
export const compressAPIResponse = async (
  data: any,
  networkConditions?: Partial<NetworkConditions>
): Promise<CompressionResult> => {
  const jsonString = JSON.stringify(data);
  const compressionOptions = networkConditions 
    ? getOptimalCompressionSettings(networkConditions)
    : { level: 'medium' as const };

  return await compressText(jsonString, compressionOptions);
};

/**
 * Decompress API response data
 */
export const decompressAPIResponse = async (
  compressedData: ArrayBuffer | string,
  format: string
): Promise<any> => {
  const jsonString = await decompressText(compressedData, format);
  return JSON.parse(jsonString);
};

// ======================================
// STORAGE COMPRESSION
// ======================================

/**
 * Compress data before storing in localStorage/IndexedDB
 */
export const compressForStorage = async (
  data: any,
  key: string
): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data);
    const networkInfo = getNetworkInfo();
    const compressionOptions = getOptimalCompressionSettings(networkInfo);
    
    const compressed = await compressText(jsonString, compressionOptions);
    
    // Store compression metadata
    const storageData = {
      compressed: true,
      format: compressed.format,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      data: compressed.format === 'none' ? compressed.data : Array.from(new Uint8Array(compressed.data as ArrayBuffer))
    };
    
    localStorage.setItem(key, JSON.stringify(storageData));
    localStorage.setItem(`${key}_meta`, JSON.stringify({
      compressed: true,
      format: compressed.format,
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      timestamp: Date.now()
    }));
    
  } catch (error) {
    console.error('Storage compression failed:', error);
    // Fallback to uncompressed storage
    localStorage.setItem(key, JSON.stringify(data));
  }
};

/**
 * Decompress data from storage
 */
export const decompressFromStorage = async (key: string): Promise<any> => {
  try {
    const storageData = localStorage.getItem(key);
    if (!storageData) return null;
    
    const parsed = JSON.parse(storageData);
    
    if (parsed.compressed) {
      let compressedData: ArrayBuffer | string;
      
      if (parsed.format === 'none') {
        compressedData = parsed.data;
      } else {
        compressedData = new Uint8Array(parsed.data).buffer;
      }
      
      const decompressed = await decompressText(compressedData, parsed.format);
      return JSON.parse(decompressed);
    } else {
      return parsed;
    }
    
  } catch (error) {
    console.error('Storage decompression failed:', error);
    return null;
  }
};

// ======================================
// UTILITY FUNCTIONS
// ======================================

/**
 * Get current network information
 */
const getNetworkInfo = (): Partial<NetworkConditions> => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  
  return {
    effectiveType: '3g', // Default assumption for Nigerian networks
    downlink: 1.5,
    rtt: 300,
    saveData: false
  };
};

/**
 * Calculate compression savings
 */
export const calculateCompressionSavings = (
  originalSize: number,
  compressedSize: number
): {
  savings: number;
  percentage: number;
  worthwhile: boolean;
} => {
  const savings = originalSize - compressedSize;
  const percentage = (savings / originalSize) * 100;
  const worthwhile = percentage > 10; // Worth compressing if >10% savings
  
  return {
    savings,
    percentage,
    worthwhile
  };
};

/**
 * Estimate compression time based on data size and network
 */
export const estimateCompressionTime = (
  dataSize: number,
  networkConditions: Partial<NetworkConditions>
): number => {
  const { effectiveType = '3g', rtt = 300 } = networkConditions;
  
  // Base compression time (ms per KB)
  const baseTimePerKB = {
    'slow-2g': 50,
    '2g': 30,
    '3g': 15,
    '4g': 5
  };
  
  const dataSizeKB = dataSize / 1024;
  const baseTime = dataSizeKB * baseTimePerKB[effectiveType];
  
  // Add network latency factor
  const latencyFactor = rtt / 100;
  
  return Math.max(100, baseTime * latencyFactor); // Minimum 100ms
};

// Export all utilities
export default {
  compressText,
  decompressText,
  compressImage,
  compressAPIResponse,
  decompressAPIResponse,
  compressForStorage,
  decompressFromStorage,
  getOptimalCompressionSettings,
  calculateCompressionSavings,
  estimateCompressionTime
};