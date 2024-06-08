import { openai } from "@/lib/openai";
import { authOptions } from "@/servers/auth";
import { prisma } from "@/servers/db";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  const { flashcardId, docId, prompt } = await req.json();
  console.log("answer1:", flashcardId, docId, prompt)

  // return NextResponse.json("awdad")

  // if (typeof flashcardId !== "string" || typeof prompt !== "string")
  //   return new Response("Not found", { status: 404 });

  const session = await getServerSession(authOptions);
  console.log("answer2:", session)
  if (!session) return new Response("Not found", { status: 404 });

  const doc = await prisma.document.findFirst({
    where: {
      id: docId,
    },
  });
  console.log("answer3:", doc)

  if (!doc) return new Response("Not found", { status: 404 });

  const flashcard = await prisma.flashcard.findFirst({
    where: {
      id: flashcardId,
      userId: session.user.id
    },
  });
  console.log("answer4:", flashcard)

  if (!flashcard) return new Response("Not found", { status: 404 });

  const reqPrompt = `Your task is to provide feedback on the user's response. Please format the information as follows:
  - In the first section, mention the aspects the user accurately identified, followed by the delimiter "||".
  - Then, the second section, where you highlight any mistakes or inaccuracies made by the user, followed by the delimiter "||".
  - Then provide additional relevant information regarding the question and the correct answer.

  Ensure that the data is presented in plain text and adheres to this specific format consistently.

  User response: ${prompt}
  Question: ${flashcard.question}
  Correct answer: ${flashcard.answer}
  \n Wajib Berikan jawaban dalam bahasa indonesia
  
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 600,
    stream: true,
    messages: [
      {
        role: "system",
        content: reqPrompt,
      },
    ],
  });
  console.log("answer5:", response)

  const stream = OpenAIStream(response, {
    onCompletion: async (completion: string) => {
      const feedback = completion.split("||");
      const correctResponse = feedback[0];
      const incorrectResponse = feedback[1];
      const moreInfo = feedback[2];

      await prisma.flashcardAttempt.create({
        data: {
          userResponse: prompt,
          ...(correctResponse ? { correctResponse: correctResponse } : {}),
          ...(incorrectResponse
            ? { incorrectResponse: incorrectResponse }
            : {}),
          ...(moreInfo ? { moreInfo: moreInfo } : {}),
          flashcard: {
            connect: {
              id: flashcardId,
            },
          },
          user: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
    },
  });
  return new StreamingTextResponse(stream);
}
