// Simplified Arabic font support for jsPDF
// This approach avoids font embedding issues while providing RTL support

export const addArabicFont = (doc: any): boolean => {
  try {
    // Use Times font which has better Unicode support than helvetica
    doc.setFont('times', 'normal');
    return true;
  } catch (error) {
    console.warn('Failed to set Times font, using helvetica:', error);
    try {
      doc.setFont('helvetica', 'normal');
      return false;
    } catch (fallbackError) {
      console.error('Font setup failed completely:', fallbackError);
      return false;
    }
  }
};

// Improved RTL text preparation without complex font requirements
export const prepareRTLText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Check if text contains RTL characters (Arabic, Kurdish, Persian)
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  
  if (rtlRegex.test(text)) {
    // Simple word-level reversal for RTL display
    // This handles basic RTL layout without requiring special fonts
    const parts = text.split(/(\s+)/);
    const words: string[] = [];
    const numbers: string[] = [];
    
    // Separate words and numbers
    parts.forEach(part => {
      if (/^\d+$/.test(part.trim())) {
        numbers.push(part);
      } else if (part.trim()) {
        words.push(part);
      }
    });
    
    // Reverse word order but keep numbers in logical order
    const reversedWords = words.reverse();
    let result = reversedWords.join(' ');
    
    // Add numbers back in their original positions
    numbers.forEach(num => {
      result = result.replace(/\d+/, num);
    });
    
    return result;
  }
  
  return text;
};

// Helper function to clean text for PDF compatibility
export const cleanTextForPDF = (text: string): string => {
  if (!text) return '';
  
  // Remove or replace problematic characters that might cause PDF issues
  return text
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '') // Remove bidirectional control characters
    .replace(/[\uFEFF]/g, '') // Remove zero-width no-break space
    .trim();
};
