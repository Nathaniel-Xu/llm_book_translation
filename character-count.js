import fs from 'fs';
import path from 'path';

const directoryPath = './raw-chapters'; // replace with your directory path
let totalCharacters = 0;

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Count the total number of characters
    const fileCharacters = fileContent.replace(/\s+/g, '').length;
    totalCharacters += fileCharacters;

    console.log(`File: ${file}, Characters: ${fileCharacters}`);
  });

  console.log(`Total characters: ${totalCharacters}`);
});