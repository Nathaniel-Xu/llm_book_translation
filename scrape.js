import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function main() {
    let chapterNum = 975;
  
    while (chapterNum <= 1394) {
      let url = `https://lnmtl.com/chapter/record-of-mortal-s-journey-to-immortality-immortal-world-chapter-${chapterNum}`;
      try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const sentences = [];
  
        $('sentence.original').each((index, element) => {
          let sentenceText = '';
          $(element).contents().each((i, node) => {
            if (node.type === 'text') {
              sentenceText += node.data;
            } else if (node.name === 't') {
              sentenceText += $(node).text();
            }
          });
          sentences.push(sentenceText);
        });
  
        const markdownText = sentences.join('\n');
  
        fs.writeFileSync(`raw-chapters/${chapterNum}.md`, markdownText);
      } catch (error) {
        console.error(error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`${chapterNum} downloaded!`)
      
      chapterNum++;
    }
}

main()