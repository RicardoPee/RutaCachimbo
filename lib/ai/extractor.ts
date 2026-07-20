import _pdfParse from "pdf-parse";
const pdfParse = _pdfParse as any;

/**
 * Descarga un PDF desde una URL pública y extrae su texto.
 * Usado para procesar archivos subidos a Cloudinary/S3.
 */
export async function extractTextFromPdfUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF buffer
    const data = await pdfParse(buffer);
    
    // Basic cleanup: remove excessive newlines and weird spaces
    let cleanText = data.text;
    cleanText = cleanText.replace(/\r\n/g, '\n');
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n'); // Max 2 newlines
    
    return cleanText.trim();
  } catch (error) {
    console.error("[EXTRACT_PDF_ERROR]", error);
    throw new Error("No se pudo extraer el texto del PDF proporcionado.");
  }
}
