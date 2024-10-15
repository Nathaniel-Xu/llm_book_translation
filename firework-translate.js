import fs from 'fs';

const reqNum = 2;

async function main() {
  let chapterNum = 1393;

  while (chapterNum <= 1394) {
    const startTime = new Date().getTime();

    let promises = [];
    for (let i = 0; i < reqNum; i++) {
      promises.push(getOpenRouterChatCompletion(chapterNum, 1));
      await new Promise(resolve => setTimeout(resolve, 1000));
      promises.push(getOpenRouterChatCompletion(chapterNum, 2));
      console.log(`${chapterNum} in queue`)
      chapterNum++
    }

    let results = await Promise.allSettled(promises);

    for (let i = 0; i < reqNum; i++) {
      let text1 = results[i * 2].status === 'fulfilled' ? results[i * 2].value?.choices[0]?.message?.content : 'Error in translation';
      let text2 = results[i * 2 + 1].status === 'fulfilled' ? results[i * 2 + 1].value?.choices[0]?.message?.content : 'Error in translation';
      let text = text1 + '\n' + text2;
      fs.writeFileSync(`split-translated-chapters/${chapterNum - (reqNum - i)}.md`, text);
    }

    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000;
    console.log(`${chapterNum - reqNum}-${chapterNum - 1} processed! Time: ${executionTime}s`)
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

async function getOpenRouterChatCompletion(chapterNum, partNum) {
    let part_chapter = fs.readFileSync(`split-raw-chapters/${chapterNum}_part${partNum}.md`, 'utf8'); 

    try {
        const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer INSERT-API-KEY"
            },
            body: JSON.stringify({
                model: "accounts/fireworks/models/llama-v3p1-70b-instruct",
                max_tokens: 16384,
                top_p: 1,
                top_k: 40,
                presence_penalty: 0,
                frequency_penalty: 0,
                temperature: 0.6,
                messages: [{
                "role": "user",
                "content": [
                {
                    "type": "text",
                    "text": "Translate the following xianxia chapter into english. Names should be translated as pinyin with normal proper noun capitalization, e.g Han Li. Only include the translated text. DO NOT include any text other than the translated text. \nChapter:\n" + part_chapter,
                }
                ]
            }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error in API call for chapter ${chapterNum} part ${partNum}:`, error);
    }
}

main().catch(error => console.error('An error occurred in the main function:', error));