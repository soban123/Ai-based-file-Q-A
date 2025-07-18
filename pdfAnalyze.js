// pdfQAwithPdfjs.js
import fs from 'fs';
import path from 'path';
import readline from 'readline-sync';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function extractTextFromPDF(filePath) {
  const rawData = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data: rawData }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    fullText += `\n\n--- Page ${i} ---\n${text}`;
  }

  return fullText;
}

async function askQuestion(pdfText, question) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are an assistant answering questions based on the following PDF content.' },
      { role: 'user', content: `PDF Content:\n${pdfText}` },
      { role: 'user', content: `Question: ${question}` }
    ],
  });

  console.log('\n🧠 Answer:\n', response.choices[0].message.content);
}

async function main() {
  const filePath = './resume.pdf';

  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    return;
  }

  console.log('📚 Reading and parsing PDF file...');

  let pdfText;
  try {
    pdfText = await extractTextFromPDF(filePath);
  } catch (err) {
    console.error('❌ Error extracting PDF:', err.message);
    return;
  }

  console.log('✅ PDF loaded. You can now ask questions.\n');

  while (true) {
    const question = readline.question('❓ Ask a question (or type "exit" to quit): ');
    if (question.toLowerCase() === 'exit') break;
    await askQuestion(pdfText, question);
  }

  console.log('\n👋 Exiting. Thanks for using PDF Q&A!');
}

main();
