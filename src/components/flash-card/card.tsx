import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { IconCheckList, IconInfo, IconSend, IconSuccess, IconTailedArrowNext, IconTailedArrowPrev, IconWrong } from "@/pages/_assest/icon/icon";
import { RequestOptions } from "ai";
import { useCompletion } from "ai/react";
import {
  BugIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  RefreshCwIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Spinner } from "../ui/Loading-Page";
import { AppContexs } from "@/pages/_app";

interface FlashcardAttemptType {
  userResponse: string;
  correctResponse: string | null;
  incorrectResponse: string | null;
  moreInfo: string | null;
}

const IndividualFlashcard = ({
  question,
  answer,
  total,
  current,
  setCurrent,
  id,
  attempts,
  data
}: {
  question: string;
  answer: string;
  total: number;
  current: number;
  setCurrent: React.Dispatch<React.SetStateAction<number>>;
  id: string;
  attempts: FlashcardAttemptType[];
  data: any
}) => {
  const [hasAttempted, setHasAttempted] = useState(false);

  const { query } = useRouter();
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const documentId = pathnameArray && pathnameArray[pathnameArray?.length - 1];
  const utils = api.useContext();

  const { complete, completion, isLoading, setCompletion } = useCompletion({
    body: {
      flashcardId: id,
      docId: documentId,
    },

    onFinish: (_prompt, completion) => {
      utils.flashcard.getFlashcards.setData({ documentId: `${documentId}` }, (prev) => {
        if (!prev) return prev;
        return prev.map((flashcard) => {
          if (flashcard.id === id) {
            return {
              ...flashcard,
              flashcardAttempts: [
                ...flashcard.flashcardAttempts,
                {
                  userResponse,
                  correctResponse: completion.split("||")[0] ?? null,
                  incorrectResponse: completion.split("||")[1] ?? null,
                  moreInfo: completion.split("||")[2] ?? null,
                  createdAt: new Date(),
                },
              ],
            };
          }
          return flashcard;
        });
      });
    },

    onError: (err: any) => {
      console.log(err.message);
      toast({
        title: "Error",
        description: "Something went wrong with text generation",
        variant: "destructive",
        duration: 3000,
      });
    },
    api: "/api/evaluate",
  });

  const toggleAttempt = () => {
    setHasAttempted((prev) => !prev);
  };

  const [userResponse, setUserResponse] = useState("");

  const [flashcardDone, setFlashcardDone] = useState<any>({
    done: false,
    show: false
  })

  const [numberArray, setNumberArray] = useState<any>([])
  const { setShowSidebar } = useContext(AppContexs)

  const handleFinishFlashcard = () => {
    try {
      setShowSidebar(false)
      setNumberArray([])
      data.forEach((item: any, i: number) => {
        if (item.flashcardAttempts.length === 0) {
          setFlashcardDone((prev: any) => ({ ...prev, show: true, done: false }))
          setNumberArray((prev: any) => ([...prev, { number: i + 1 }]))
        } else {
          setFlashcardDone({ done: true, show: true })
          setNumberArray([])
        }
      });
    } catch (error) {
      console.log("Failed to finish Flashcard:", error)
      return error;
    }
  }

  // console.log("====", flashcardDone, numberArray)

  return (
    <div className="flex h-full flex-col justify-between ">

      <FlashcardFinish finish={flashcardDone} setFinish={setFlashcardDone} number={numberArray} />

      <div className="flex px-[1rem] pb-[1rem] pt-[.5rem] justify-start items-center gap-[.5rem]">
        {Array.from({ length: total }).map((_, i) => (
          <p key={i} className={` px-[.5rem] rounded-[.3rem] text-[.9rem] cursor-pointer hover:bg-main-hover hover:text-white duration-200 active:bg-white ${i + 1 === current ? "text-white bg-main" : "bg-white"}`}
            onClick={() => {
              setCurrent(i)
              if (hasAttempted) {
                toggleAttempt();
              }
              setUserResponse("");
              setCompletion("");
            }}
          >
            {i + 1}
          </p>
        ))}
      </div>
      <div className="flex-grow overflow-scroll">
        {hasAttempted ? (
          <IndividualFlashcardReport
            question={question}
            answer={answer}
            total={total}
            current={current}
            //   think whether or not to show previous attempts in the current report. also think whether to add along w. the question screen
            completion={completion}
            isLoading={isLoading}
            toggleAttempt={toggleAttempt}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        ) : (
          <IndividualFlashcardQuestion
            attempts={attempts}
            current={current}
            setCurrent={setCurrent}
            setCompletion={setCompletion}
            complete={complete}
            question={question}
            total={total}
            answer={answer}
            toggleAttempt={toggleAttempt}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
          />
        )}
      </div>

      {/* bottom navigation */}
      <div className="flex h-8 items-center justify-between border-t border-gray-100 p-[1.5rem] mb-[1rem]">
        <Button
          className="flex items-center text-main-gray-text"
          variant="ghost"
          disabled={current === 1}
          onClick={() => {
            if (hasAttempted) {
              toggleAttempt();
            }
            setUserResponse("");
            setCompletion("");
            setCurrent((prev) => prev - 1);
          }}
        >
          {/* <ChevronLeftIcon className="h-6 w-6 text-gray-600" /> */}
          <IconTailedArrowPrev w={15} className="text-black" />
          <span className="ml-2">Sebelumnya</span>
        </Button>

        <span className="text-gray-500">
          {current} / {total}
        </span>

        {current !== total ?
          <Button
            className="flex items-center text-main-gray-text"
            variant="ghost"
            disabled={current === total}
            onClick={() => {
              if (hasAttempted) {
                toggleAttempt();
              }
              setUserResponse("");
              setCompletion("");
              setCurrent((prev) => prev + 1);
            }}
          >
            <span className="mr-2">Berikutnya</span>
            {/* <ChevronRightIcon className="h-6 w-6 text-black" /> */}
            <IconTailedArrowNext className="text-black" w={15} />
          </Button>
          :
          <button className="bg-main flex gap-[.5rem] items-center rounded-[.8rem] text-white py-[.7rem] px-[1rem] text-[.9rem] hover:bg-main-hover duration-200"
            onClick={() => handleFinishFlashcard()}
          >
            Selesai
            <IconCheckList w={15} />
          </button>
        }
      </div>
    </div>
  );
};
export default IndividualFlashcard;

const IndividualFlashcardQuestion = ({
  question,
  answer,
  complete,
  toggleAttempt,
  userResponse,
  setUserResponse,
  setCompletion,
  attempts,
  total,
  current,
  setCurrent
}: {
  question: string;
  answer: string;
  complete: (
    prompt: string,
    options?: RequestOptions | undefined
  ) => Promise<string | null | undefined>;
  toggleAttempt: () => void;
  userResponse: string;
  setUserResponse: React.Dispatch<React.SetStateAction<string>>;
  setCompletion: (completion: string) => void;
  attempts: FlashcardAttemptType[];
  total: number,
  current: number,
  setCurrent: any,
}) => {
  return (
    <div className="flex h-full flex-grow flex-col justify-between">
      <div>
        <div className="mb-4">
          <div className="rounded-t-lg bg-gray-100 p-4">
            <h1 className="text-lg font-semibold text-main-gray-text">
              {question}
            </h1>
          </div>
          <div className="p-4">
            <div className="relative">
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                className="h-24 w-full p-4 border-2 border-main focus:border-main rounded-[1rem]"
                placeholder="Enter your answer..."
              />
              <Button
                onClick={() => {
                  toggleAttempt();
                  complete(userResponse);
                }}
                className="w-fit h-fit p-0 bg-transparent absolute right-4 bottom-4 cursor-pointer hover:bg-transparent"
              >
                <IconSend className="text-main hover:text-main-hover duration-200" />
              </Button>
            </div>
            <button className="text-[.9rem] mx-[.5rem]  my-[.5rem] text-main-gray-text font-[500] hover:text-black"
              onClick={() => setUserResponse("")}
            >
              Kosongkan jawaban
            </button>
          </div>
        </div>

        {/* <div className="mb-8 flex items-center justify-between px-2">
          <Button
            onClick={() => {
              toggleAttempt();
              setCompletion("");
            }}
            variant="ghost"
          >
            Don&apos;t know
          </Button>
        </div> */}
      </div>

      <div>
        {attempts.length > 0 && (
          <>
            <h2 className="mb-2 font-semibold text-gray-600">
              Previous attempts
            </h2>

            <Accordion type="single" collapsible>
              {attempts.map((attempt, index) => (
                <AccordionItem value={index.toString()} key={index}>
                  <AccordionTrigger className="px-2 font-semibold">
                    {index + 1}
                  </AccordionTrigger>
                  <AccordionContent className="rounded-md bg-gray-50 p-4">
                    <div className="mb-4 rounded-md bg-[#F7F5FB] p-4">
                      <h4 className="mb-2 flex items-center text-sm font-semibold text-[#5937AB]">
                        Your Response
                      </h4>
                      <p className="text-sm">{attempt.userResponse}</p>
                    </div>
                    <Feedback
                      correctResponse={attempt.correctResponse}
                      wrongResponse={attempt.incorrectResponse}
                      moreInfo={attempt.moreInfo}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        )}
      </div>
    </div>
  );
};

const IndividualFlashcardReport = ({
  question,
  answer,
  total,
  current,
  toggleAttempt,
  completion,
  isLoading,
  userResponse,
  setUserResponse,
}: {
  question: string;
  answer: string;
  total: number;
  current: number;
  toggleAttempt: () => void;
  completion: string;
  isLoading: boolean;
  userResponse: string;
  setUserResponse: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const splitResponse = completion.split("||");
  return (
    <>
      <div className=" px-[1rem]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-main-gray-text">{question}</h3>
          <Button
            title="Try again"
            variant="ghost"
            onClick={() => {
              toggleAttempt();
              setUserResponse("");
            }}
          >
            <RefreshCwIcon className="h-5 w-5" />
          </Button>
        </div>
        {/* <p className="mb-4 text-sm text-gray-500">From page 7</p> */}
        {userResponse && (
          // <div className="mb-6 rounded-md bg-[#f7fafc] p-4">
          //   <p className="mb-2 font-semibold">Your answer</p>
          //   <p className="text-sm">{userResponse}</p>
          // </div>
          <div className="bg-white py-[.8rem] px-[1rem] rounded-[.8rem] border-main-gray-input border mt-[1rem] mb-[2rem]">
            {userResponse}
          </div>
        )}
        {(isLoading || completion) && (
          <>
            <h2 className="mb-2 text-lg font-semibold text-main-gray-text">Feedback:</h2>
            <Feedback
              correctResponse={splitResponse[0]}
              wrongResponse={splitResponse[1]}
              moreInfo={splitResponse[2]}
            />
          </>
        )}
        <Accordion
          type="single"
          collapsible
          defaultValue={isLoading || completion ? undefined : "answer"}
        >
          <AccordionItem value="answer">
            <AccordionTrigger className="px-2 font-semibold text-main-gray-text text-lg">
              Answer
            </AccordionTrigger>
            <AccordionContent className="rounded-md bg-[#E1F2FF] text-black p-4">
              {answer}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};

const Feedback = ({
  correctResponse,
  wrongResponse,
  moreInfo,
}: {
  correctResponse?: string | null;
  wrongResponse?: string | null;
  moreInfo?: string | null;
}) => {
  return (
    <div className="space-y-4">
      {correctResponse && (
        <div className="rounded-md bg-[#E1F7EB] p-4">
          <h4 className="mb-2 flex items-center text-sm font-semibold text-[#006426]">
            <IconSuccess className="mr-2 text-[#00A853]" />
            Jawaban Benar
          </h4>
          <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
            {correctResponse}
          </ReactMarkdown>
        </div>
      )}
      {wrongResponse && (
        <div className="rounded-md bg-[#FEE4E9] p-4">
          <h4 className="mb-2 flex items-center text-sm font-semibold text-[#8D1145]">
            <IconWrong className="mr-2 text-[#DA2850]" />
            Jawaban Salah
          </h4>
          <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
            {wrongResponse}
          </ReactMarkdown>
        </div>
      )}
      {moreInfo && (
        <div className="rounded-md bg-[#E1F2FF] p-4">
          <h4 className="mb-2 flex items-center text-sm font-semibold text-[#2236D1]">
            <IconInfo className="mr-2 text-[#0091FF]" />
            More info
          </h4>
          <ReactMarkdown className="prose" remarkPlugins={[remarkGfm]}>
            {moreInfo}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};


const FlashcardFinish = ({ finish, setFinish, number }: { finish: any, setFinish: any, number: any }) => {

  const { setShowSidebar } = useContext(AppContexs)
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const documentId = `${pathnameArray && pathnameArray[pathnameArray?.length - 1]
    }`;

  const trpc = api.useUtils()
  const { mutate: generateFlashcards, isLoading: isGeneratingFlashcards } =
    api.flashcard.generateFlashcards.useMutation({
      onSuccess: async () => {
        await trpc.flashcard.getFlashcards.invalidate();
        setFinish((prev: any) => ({ done: false, show: false }))
        setShowSidebar(true)
        toast({
          title: "Succed to generate flashcard",
          description: "",
          variant: "default",
          duration: 3000,
        });
      },
      onError: (err: any) => {
        setShowSidebar(true)
        toast({
          title: "Uh-oh",
          description: err?.message ?? "Something went wrong",
          variant: "destructive",
          duration: 3000,
        });
      },
    });

  if (isGeneratingFlashcards) {
    return (
      <div className="fixed top-0 left-0 w-full h-full z-[9999999999] bg-[#00000077] flex justify-center items-center">
        <div className="flex flex-col items-center gap-[.5rem]">
          <Spinner />
          <p className="font-[600]">Generating Flashcard...</p>
        </div>
      </div>
    )
  }
  return (
    <>
      {finish.show && finish.done ?
        <div className="fixed top-0 left-0 w-full h-full z-[9999999999] bg-[#00000077] flex justify-center items-center">
          <div className="bg-white p-[2rem] rounded-[2rem] flex flex-col gap-[1rem] text-center">
            <p>Kamu telah menyelesaikan seluruh soal. <br />Apakah kamu ingin buat flash card baru?</p>
            <div className="flex items-center gap-[1rem]">
              <button className="w-full bg-transparent hover:text-gray-800 text-main-gray-text py-[.7rem] rounded-[1rem] cursor-default">
                <p className="cursor-pointer"
                  onClick={() => { setFinish({ show: false, done: false }); setShowSidebar(true) }}
                >Batalkan</p>
              </button>
              <button className="w-full bg-main hover:bg-main-hover active:bg-main duration-200 text-white py-[.7rem] rounded-[1rem]"
                onClick={() => {
                  generateFlashcards(
                    { documentId }
                  );
                }}
              >
                Buat baru
              </button>
            </div>
          </div>
        </div>
        : finish.show && !finish.done ?
          <div className="fixed top-0 left-0 w-full h-full z-[9999999999] bg-[#00000077] flex justify-center items-center">
            <div className="bg-white p-[2rem] rounded-[2rem] flex flex-col gap-[1rem]">
              <div className="text-center flex flex-col gap-[1rem]">
                <p>Kamu belum menyelesaikan seluruh soal <br /> flash card berikut:</p>
                <p className="text-main">
                  {number?.map((item: any, i: number) => (
                    <span key={i}>
                      {item.number}{i + 1 !== number.length && ","}
                    </span>
                  ))}
                </p>
                <p className=" text-main-gray-text2">
                  Tetap buat flash card baru?
                </p>
              </div>
              <div className="flex items-center gap-[1rem]">
                <button className="w-full bg-transparent hover:text-gray-800 text-main-gray-text py-[.7rem] rounded-[1rem] cursor-default">
                  <p className="cursor-pointer"
                    onClick={() => {
                      generateFlashcards(
                        { documentId }
                      );
                    }}
                  >Buat baru</p>
                </button>
                <button className="w-full bg-main hover:bg-main-hover active:bg-main duration-200 text-white py-[.7rem] rounded-[1rem]"
                  onClick={() => { setFinish({ show: false, done: false }); setShowSidebar(true) }}
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
          : null}

    </>
  )
}

// TPol