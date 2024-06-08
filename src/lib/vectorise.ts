import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

import { prisma } from '@/servers/db';
import { OpenAIEmbeddings } from '@langchain/openai';

export const vectorizePDF = async (fileUrl: any, docId: any, userId: any) => {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  const loader = new PDFLoader(blob);

  // Convert Ke Text
  const pageLevelDocs = await loader.load();
  // Banyak Page
  const pageCount = pageLevelDocs.length;
  if (pageCount > 10) {
    throw new Error(
      "Document to be vectorised can have at max 10 pages for now."
    );
  }

  // Atur Data Document yg sudah di convert
  const settingDocs = pageLevelDocs.map((document, index) => {
    return {
      ...document,
      metaData: {
        fileId: docId,
        pageNumber: index + 1,
      },
      dataset: "pdf",
    };
  });
  // console.log("vectorizeOld2:", settingDocs)

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    batchSize: 1536,
    modelName: "text-embedding-3-small",
  });
  // console.log("vectorizeOld3:", embeddings)

  // Vectorize Document
  const vectors = await embeddings.embedDocuments(
    settingDocs.map((doc: any) => doc.pageContent)
  );
  // console.log("vectorizeOld4:", vectors)
  // console.log("vectorizeOld5:", vectors.length)

  // Simpan vectors
  vectors.forEach(async (item: any, i: number) => {
    const vector = item
    const metadata = settingDocs[i].metaData
    const pageContent = settingDocs[i].pageContent
    const add = await prisma.embedding.create({
      data: {
        vector,
        metadata,
        documentId: docId,
        pageContent
      }
    })
    if (add) {
      console.log("vector:", + (i + 1))
    }
  })
}