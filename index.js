// csvQA.js
import fs from 'fs';
import path from 'path';
import readline from 'readline-sync';
import csv from 'csv-parser';
import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function csvToText(data) {
  const keys = Object.keys(data[0]);
  const header = keys.join(', ');
  const rows = data.map(row => keys.map(k => row[k]).join(', '));
  return [header, ...rows].join('\n');
}

async function askQuestion(csvText, question) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant answering questions based on CSV data.' },
      { role: 'user', content: `CSV Content:\n${csvText}` },
      { role: 'user', content: `Question: ${question}` }
    ],
  });

  console.log('\n🧠 Answer:\n', response.choices[0].message.content);
}

async function main() {
  const filePath = './data.csv'; 

  if (!fs.existsSync(filePath)) {
    console.error('❌ File not found:', filePath);
    return;
  }

  console.log('📊 Reading CSV file...');

  let csvData;
  try {
    csvData = await readCSV(filePath);
  } catch (err) {
    console.error('❌ Failed to read CSV:', err.message);
    return;
  }

  if (csvData.length === 0) {
    console.log('⚠️ CSV is empty.');
    return;
  }

  const csvText = csvToText(csvData);

  console.log('✅ CSV loaded. You can now ask questions.\n');

  while (true) {
    const question = readline.question('❓ Ask a question (or type "exit" to quit): ');
    if (question.toLowerCase() === 'exit') break;
    await askQuestion(csvText, question);
  }

  console.log('\n👋 Exiting. Thanks for using CSV Q&A!');
}

main();
