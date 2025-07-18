// index.js
import fs from 'fs';
import readline from 'readline-sync';
import OpenAI from 'openai';
import 'dotenv/config';

// Init OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Read text file
const filePath = './news.txt'; 
const fileContent = fs.readFileSync(filePath, 'utf-8');

async function askQuestion(question) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // or 'gpt-4' if available
    messages: [
      { role: 'system', content: 'You are an assistant answering questions based on the given file.' },
      { role: 'user', content: `File content:\n${fileContent}` },
      { role: 'user', content: `Question: ${question}` }
    ],
  });

  console.log('\nAnswer:\n', response.choices[0].message.content);
}

// Q&A loop
while (true) {
  const question = readline.question('\nAsk a question about the file (or type "exit"): ');
  if (question.toLowerCase() === 'exit') break;
  await askQuestion(question);
}
