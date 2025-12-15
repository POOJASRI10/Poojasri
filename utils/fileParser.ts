
export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    // Dynamically import pdfjs-dist to avoid top-level import errors
    // @ts-ignore
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
       pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // @ts-ignore
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += `\n--- Page ${i} ---\n${pageText}`;
    }
    return fullText;
  } catch (error) {
    console.error("PDF Parse Error", error);
    throw new Error("Failed to parse PDF. Please ensure it is a valid PDF file.");
  }
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    // Dynamically import mammoth
    // @ts-ignore
    const mammoth = (await import('mammoth')).default || await import('mammoth');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("DOCX Parse Error", error);
    throw new Error("Failed to parse Word document.");
  }
};