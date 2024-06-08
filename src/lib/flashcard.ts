import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { openai } from './openai';
import { OpenAIStream } from 'ai';
import { getError } from '@/servers/api/routers/help';
import { TRPCError } from '@trpc/server';

export const generateFlashcards = async (fileUrl: string) => {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const loader = new PDFLoader(blob);

  const pageLevelDocs = await loader.load();
  console.log("FC1:", pageLevelDocs)


  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(pageLevelDocs);
  const docContents = splitDocs.map((doc) => {
    return doc.pageContent.replace(/\n/g, " ");
  });
  console.log("FC2:", docContents)

  // const res = await Promise.allSettled(
  //   docContents.map(async (doc) => {
  //     return openai.chat.completions.create({
  //       model: "gpt-3.5-turbo",
  //       max_tokens: 2048,

  //       messages: [
  //         {
  //           role: "system",
  //           content: `You're using an advanced AI assistant capable of creating flashcards efficiently. Your task is to generate clear and concise question-answer pairs based on provided text, adhering to SuperMemo principles.
  //         Each question should have a straightforward answer and be self-contained. Limit your questions to a maximum of two per text segment. Avoid adding explanations or apologies. If you encounter difficulty creating a question, you can skip it.
  //         Please provide the output in JSON Array format, with each question as a key and its corresponding answer as the value. Strictly adhere to this format to ensure successful completion of the task.`,
  //         },
  //         // AI assistant is a brand new, powerful, human-like artificial intelligence, you are an expert in creating flashcards.
  //         // You will create flashcards with a question and answer based on text that I provide, Using the SuperMemo principles.
  //         // Create questions that have clear and unambiguous answers and must be self-contained. Only create at max 2 question.
  //         // Note: Do not include any explanations or apologies in your responses.  If you are unable to create a question, you can skip it, don't ask for any clarifications, and don't include any "Notes", and don't include any text except the generated questions and answers. These is very important if you want to get paid.
  //         // The output should be in JSON Array format with the question as key and answer as the value for each question-answer pair.
  //         // RESPOND WITH JSON ONLY OR YOU WILL BE SHUT DOWN. DO NOT UNDER ANY CIRCUMSTANCES RETURN ANY CONVERSATIONAL TEXT.`,
  //         {
  //           role: "user",
  //           content: `Create question-answer pairs for the following text:\n\n ${doc}`,
  //         },
  //       ],
  //     });
  //   }),
  // );
  const res = await Promise.allSettled(
    docContents.map(async (doc) => {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        max_tokens: 2048,
        messages: [
          {
            role: "system",
            content: `You're using an advanced AI assistant capable of creating flashcards efficiently. Your task is to generate clear and concise question-answer pairs based on provided text, adhering to SuperMemo principles.
            Each question should have a straightforward answer and be self-contained. Limit your questions to a maximum of two per text segment. Avoid adding explanations or apologies. If you encounter difficulty creating a question, you can skip it.
            Please provide the output in JSON Array format, with each question as a key and its corresponding answer as the value. Strictly adhere to this format to ensure successful completion of the task.\n Berikan flashcard dalam bahasa indonesia beserta jawaban dari setiap pertanyaan!\n`,
          },
          {
            role: "user",
            content: `Create question-answer pairs for the following text:\n\n${doc}`,
          },
        ],
      });
      // return response.data.choices[0]?.message.content?.replace(/\n/g, "");
      return response;
    })
  );


  console.log("FC3:", res);

  const flashcards = res.map((item: any) => {
    try {
      if (item.status === "fulfilled" && item.value.choices) {
        try {
          const parse = JSON.parse(item.value.choices[0].message.content)
          const data = parse.map((item: any) => {
            const string = JSON.stringify(item)
            const data = string.replace(/{/g, "").replace(/}/g, "").replace(/"/g, '').split(":")
            return data;
          })
          const cleanedData = data.map((item: any, i: any) => {
            return {
              question: item[0],
              answer: item[1]
            }
          })
          return cleanedData
        } catch (error: any) {
          console.error("Failed Parse Flashcard!!")
          return []
        }
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed Generate Flashcard!"
        })
      }
    } catch (error) {
      getError(error, "Failed Parse Flashcard!!")
    }
  }).flat()

  console.log("Generated flashcards:", flashcards);
  return flashcards

};

interface FlashcardType {
  question: string;
  answer: string;
}


// content: `You're using an advanced AI assistant capable of creating flashcards efficiently. Your task is to generate clear and concise question-answer pairs based on provided text, adhering to SuperMemo principles.
// Each question should have a straightforward answer and be self-contained. Limit your questions to a maximum of two per text segment. Avoid adding explanations or apologies. If you encounter difficulty creating a question, you can skip it.
// Please provide the output in JSON Array format, with each question as a key and its corresponding answer as the value. Strictly adhere to this format to ensure successful completion of the task.\n Berikan flashcard dalam bahasa indonesia beserta jawaban dari setiap pertanyaan!`,