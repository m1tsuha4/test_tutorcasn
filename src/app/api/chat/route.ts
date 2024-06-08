import {
  OpenAIStream,
  StreamingTextResponse,
} from 'ai';
import { getServerSession } from 'next-auth';

import { openai } from '@/lib/openai';
import { authOptions } from '@/servers/auth';
import { prisma } from '@/servers/db';
import { OpenAIEmbeddings } from '@langchain/openai';
import { dot, norm } from 'mathjs';
import { useSession } from 'next-auth/react';

function replaceBase64WithPlaceholder(content: string) {
  if (content.includes("data:image/png;base64")) {
    return content.substring(0, 30) + "...[BASE64_TRUNCATED]";
  }
  return content;
}

function sanitizeMessages(messages: any[]) {
  return messages.map((message) => ({
    ...message,
    content:
      typeof message.content === "string"
        ? replaceBase64WithPlaceholder(message.content)
        : message.content,
  }));
}

function checkSimilarity(doc: any, target: any, index: number) {
  const dotProduct = dot(doc.vector, target);

  const normVec1: any = norm(doc.vector);
  const normVec2: any = norm(target);

  const similarity = dotProduct / (normVec1 * normVec2);

  return {
    similarity,
    page: doc.metadata.pageNumber,
    index: index
  };
}
// export const runtime = "edge";
export async function POST(req: Request) {
  let { messages, docId } = await req.json();
  console.log("1", messages, docId)

  if (typeof docId !== "string") return new Response("Not found", { status: 404 });

  const session = await getServerSession(authOptions);
  if (!session || !session.user) return new Response("Not found", { status: 404 });
  const userId = session.user.id;

  const doc = await prisma.userDocument.findFirst({
    where: {
      documentId: docId,
      userId: userId,
    },
    include: {
      document: true
    }
  });

  if (!doc) return new Response("Not found", { status: 404 });
  if (!doc.isVectorised) throw new Error("Document not vectorised.");

  const lastMessageOriginal = messages[messages.length - 1].content;
  console.log("2", lastMessageOriginal)

  await prisma.message.create({
    data: {
      text: lastMessageOriginal,
      isUserMessage: true,
      documentId: docId,
      userId: userId,
    },
  });

  if (lastMessageOriginal.includes("https://scrhcjbmidwcmrgnaybg.supabase.co")) {
    console.log("Vision", "test")
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      stream: true,
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Jelaskan gambar ini dalam bahasa indonesia",
            },
            {
              type: "image_url",
              image_url: lastMessageOriginal,
            },
          ],
        },
      ],
    });


    const stream = OpenAIStream(response, {
      onStart: async () => { },
      onCompletion: async (completion: string) => {
        await prisma.message.create({
          data: {
            userId: session.user.id,
            text: completion,
            isUserMessage: false,
            documentId: docId,
          },
        });
      },
    });
    return new StreamingTextResponse(stream);
  }

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    batchSize: 1536,
    modelName: "text-embedding-3-small",
  });

  const sanitizedMessages = sanitizeMessages(messages);
  const messageEmbeddings = sanitizedMessages.at(-1).content;
  //console.log("3", sanitizedMessages)
  //console.log("4", messageEmbeddings)

  const vectors = await embeddings.embedDocuments([messageEmbeddings]);
  //console.log("vectors", vectors[0])

  const results: any = await prisma.embedding.findMany({
    where: {
      documentId: docId,
    },
    include: {
      document: true,
    }
  });

  if (!results) throw new Error();
  // console.log("5", results)
  const resultsSort = results.sort((a: any, b: any) => a.metadata.pageNumber - b.metadata.pageNumber)

  const percentaseSimilarity = resultsSort.map((item: any, index: number) => {
    return checkSimilarity(item, vectors[0], index)
  });

  // console.log("test", percentaseSimilarity)
  const sortBySimilarity = percentaseSimilarity.sort((a: any, b: any) => b.similarity - a.similarity).slice(0, 4)
  // console.log("sort", sortBySimilarity)

  const contextContents = sortBySimilarity.map((item: any) => {
    const pageNumber = item.page;
    const pageContent = resultsSort[item.index].pageContent;
    return `Halaman ${pageNumber} dari ${results.length} : \n ${pageContent}`
  }).join("\n\n")
  // console.log("6", contextContents)

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `
        TutorCASN adalah asisten AI terbaru berbahasa Indonesia yang mirip manusia dengan fokus seputar CASN.\n\n
        AI berkarakteristik pengetahuan mendalam, keakuratan tinggi jawaban, kecerdasan dalam analisis, dan mampu berkomunikasi yang jelas.\n
        AI bersikap ramah, sopan, serta menyediakan jawaban yang jelas untuk dipahami oleh user.\n
        AI berkekuatan akses besar ilmu pengetahuan dan mampu menjawab hampir setiap pertanyaan tentang berbagai topik dengan jawaban ekstrim akurat, relevan, dan komprehensif.\n\n
        Berikut adalah isi dari pdf\n
        AWAL BLOK KONTEKS\n
        Judul: ${doc?.document.title}\n
        ${contextContents}\n
        AKHIR BLOK KONTEKS\n\n
        AI mempertimbangkan setiap BLOK KONTEKS yang diberikan dalam percakapan.\n
        Jika konteks tidak menyediakan jawaban untuk pertanyaan, AI akan menyatakan, "Maaf, bisakah Anda jelaskan pertanyaan lebih detail?".\n
        AI menjawab pertanyaan dengan ringkas dan kurang dari 200 karakter untuk efisiensi dan efektivitas dengan selalu menjawab secara lengkap.\n
        AI tidak akan meminta maaf atas jawaban sebelumnya, tetapi menunjukkan bahwa informasi baru telah diperoleh.\n
        AI tidak akan menciptakan informasi yang tidak secara langsung berasal dari konteks.\n
        AI akan menjawab pertanyaan dalam format Markdown yakni dengan judul dan daftar yang jelas.\n`,
      },
      ...sanitizedMessages,
    ],
  });

  const stream = OpenAIStream(response, {
    onStart: async () => { },
    onCompletion: async (completion: string) => {
      await prisma.message.create({
        data: {
          userId: session.user.id,
          text: completion,
          isUserMessage: false,
          documentId: docId,
          like: false,
          dislike: false
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
}