import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/**
 * PDF dan barcha matni olish
 */
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}

/**
 * Matndan savollarni ajratib olish.
 * 
 * PDF quyidagi FORMATDA bo'lishi kerak:
 * 
 * 1. Savol matni?
 * A) Variant 1
 * B) Variant 2
 * C) Variant 3
 * D) Variant 4
 * Javob: A
 * 
 * 2. Keyingi savol?
 * ...
 */
function parseQuestions(text) {
  const questions = [];

  // Matnni tozalash
  const cleanText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  // Savollarni raqam bilan aniqlash: "1.", "1)", "1-"
  const questionBlocks = cleanText.split(/(?=\n?\s*\d+[.)•\-]\s)/);

  for (const block of questionBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Savol raqamini olib tashlaymiz
    const withoutNumber = trimmed.replace(/^\d+[.)•\-]\s*/, "").trim();
    if (!withoutNumber) continue;

    // Variantlarni topamiz: A) yoki A. yoki a)
    const optionRegex = /([A-Da-d])[.)]\s*([^\n]+)/g;
    const options = [];
    let optionMatch;
    while ((optionMatch = optionRegex.exec(withoutNumber)) !== null) {
      options.push(optionMatch[2].trim());
    }

    if (options.length < 2) continue; // Variantsiz savollarni o'tkazib yuborish

    // Savolni ajratamiz (birinchi variant boshlanishidan oldin)
    const firstOptionIdx = withoutNumber.search(/[A-Da-d][.)]\s/);
    const questionText =
      firstOptionIdx > 0
        ? withoutNumber.slice(0, firstOptionIdx).trim()
        : withoutNumber.split("\n")[0].trim();

    if (!questionText || questionText.length < 3) continue;

    // Javobni topamiz
    const answerMatch = block.match(
      /[Jj]avob\s*[:\-]?\s*([A-Da-d])|[Aa]nswer\s*[:\-]?\s*([A-Da-d])|[Тт]o['']g['']ri\s*[:\-]?\s*([A-Da-d])/
    );

    let answer = null;
    if (answerMatch) {
      const letter = (
        answerMatch[1] ||
        answerMatch[2] ||
        answerMatch[3]
      ).toUpperCase();
      const idx = ["A", "B", "C", "D"].indexOf(letter);
      if (idx !== -1 && options[idx]) {
        answer = options[idx];
      }
    }

    // Javob topilmasa, A ni standart qilamiz (lekin noto'g'ri bo'lishi mumkin)
    if (!answer && options.length > 0) {
      answer = options[0];
    }

    questions.push({
      id: questions.length + 1,
      question: questionText,
      options: options.slice(0, 4), // Max 4 ta variant
      answer: answer,
    });
  }

  return questions;
}

/**
 * Asosiy funksiya: PDF fayldan savollarni o'qish
 */
export async function parsePDFQuestions(file) {
  try {
    const text = await extractTextFromPDF(file);
    const questions = parseQuestions(text);

    if (questions.length === 0) {
      throw new Error(
        "PDF dan savollar topilmadi. Iltimos, to'g'ri formatda fayl yuklang."
      );
    }

    return { success: true, questions, total: questions.length };
  } catch (err) {
    return { success: false, error: err.message, questions: [] };
  }
}

/**
 * Random N ta savol olish
 */
export function getRandomFromPool(questions, count = 30) {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  // Variantlarni ham random aralashtirish
  return selected.map((q) => ({
    ...q,
    options: [...q.options].sort(() => Math.random() - 0.5),
  }));
}
