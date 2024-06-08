import { useContext, useEffect, useRef, useState } from "react";

import { useChat } from "ai/react";
import { BanIcon, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TextareaAutosize from "react-textarea-autosize";

import FeatureCard from "@/components/other/feature-card";
import { SpinnerCentered } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Api_Url, getDate, getHours } from "../../pages/help/index";
import LoadingMessage from "../ui/loading-message";
import { AppContexs } from "@/pages/_app";
import { IconCopy, IconDislike, IconEdit, IconLike, IconRegenerateMessage, IconSettingMessage } from "@/pages/_assest/icon/icon";
import axios from 'axios';
export default function Chat() {
  const router = useRouter();
  const { data: session } = useSession();
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const docId = pathnameArray && pathnameArray[pathnameArray?.length - 1];
  const userId = session?.user?.id;


  const { imageMessageLoading, setImageMessageLoading, messageData, setMessageData } = useContext(AppContexs)

  const [editMessage, setEditMessage] = useState<any>({
    bool: false,
    index: 99999,
    value: "111",
    executeMessage: ""
  })
  const [tempData, setTempData] = useState<any>([
    {
      id: "id",
      content:
        "Welcome to **TutorCASN**! I'm here to assist you. Feel free to ask questions or discuss topics based on the data provided. Whether it's clarifying information, diving deeper into a subject, or exploring related topics, I'm ready to help. Let's make the most out of your learning!",
      role: "assistant",
      createAt: null,
      like: false,
      dislike: false
    },])

  const [onLike, setOnlike] = useState<boolean>(false)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
    append
  } = useChat({
    body: {
      docId: docId as string,
    },

    onError: (err: any) => {
      toast({
        title: "Error",
        description: error?.message ?? "Something went wrong",
        variant: "destructive",
        duration: 3000,
      });
    },
    onFinish(message) {
      console.log("finish", message)
      setTempData([
        ...tempData,
        {
          id: crypto.randomUUID(),
          content: input,
          role: "user",
          createdAt: new Date(),
          like: false,
          dislike: false
        },
        message
      ])
    },

  });


  const {
    messages: messageEdit,
    input: edit,
    handleInputChange: editOnChange,
    handleSubmit: submitEdit,
    isLoading: isLoadingEditMessage
  } = useChat({
    body: {
      docId: docId as string,
    },

    onError: (err: any) => {
      toast({
        title: "Error",
        description: error?.message ?? "Something went wrong",
        variant: "destructive",
        duration: 3000,
      });
    },
    onFinish(message) {
      console.log("finish EDIT", message)
      const data = tempData.slice(0, -2)
      setTempData([
        ...data,
        {
          id: crypto.randomUUID(),
          content: edit,
          role: "user",
          createdAt: new Date(),
        },
        message
      ])
    },
  });

  useEffect(() => {
    const input = document.getElementById("editInput");

    const handleInputChange = (e: any) => {
      console.log("Input event: ", e.target.value);
      setEditMessage((prev: any) => ({ ...prev, value: e.target.value }));
      // e.target.value = editMessage.value
    };

    if (input) {
      input.addEventListener('input', handleInputChange);
    }

    return () => {
      if (input) {
        input.removeEventListener('input', handleInputChange);
      }
    };
  }, []);

  // Mengecek apakah input adalah base64
  const { setSendMessage } = useChatStore();
  useEffect(() => {
    const sendMessage = (message: string) => {
      append({
        id: crypto.randomUUID(),
        content: message,
        role: "user",
        createdAt: new Date(),
      });
    };
    setSendMessage(sendMessage);
  }, []);

  //implement autoscrolling, and infinite loading => also fetch the messages from prev session and display
  const { data: prevChatMessages, isLoading: isChatsLoading } =
    api.message.getAllByDocIdAndUserId.useQuery(
      {
        documentId: docId as string,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  const messageWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageWindowRef.current?.scrollTo(
      0,
      messageWindowRef.current.scrollHeight
    );
  }, [])

  const trpc = api.useUtils()
  const editMessageApi = api.message.editMessages.useMutation({
    onSettled: async (data, error, variables, context) => {
    },
    onMutate(variables) {
    },
  })
  useEffect(() => {
    if (prevChatMessages?.length > 0) {
      setTempData([
        {
          id: "id",
          content:
            "Welcome to **TutorCASN**! I'm here to assist you. Feel free to ask questions or discuss topics based on the data provided. Whether it's clarifying information, diving deeper into a subject, or exploring related topics, I'm ready to help. Let's make the most out of your learning!",
          role: "assistant",
          createAt: null,
          like: false,
          dislike: false
        },
        ...prevChatMessages]
      )
      setMessageData([
        {
          id: "id",
          content:
            "Welcome to **TutorCASN**! I'm here to assist you. Feel free to ask questions or discuss topics based on the data provided. Whether it's clarifying information, diving deeper into a subject, or exploring related topics, I'm ready to help. Let's make the most out of your learning!",
          role: "assistant",
          createAt: null,
          like: false,
          dislike: false
        },
        ...prevChatMessages,
        ...messages,
        ...messageEdit
      ])
    }
  }, [prevChatMessages])

  useEffect(() => {
    setOnlike(false)
    if (isLoading) {
      if (messages.length % 2 == 0) {
        console.log("1")
        const data = [
          ...tempData,
          ...messages.slice(-2),
        ]
        setMessageData((prev: any) => ([
          ...data
        ]))
      }
      if (messages.length % 2 !== 0) {
        console.log("2", tempData)
        const data = [
          ...tempData,
          ...messages.slice(-1),
        ]
        setMessageData((prev: any) => ([
          ...data
        ]))
      }
    }
    console.log("no edit", messageData)
  }, [messages])

  useEffect(() => {
    setOnlike(false)
    if (isLoadingEditMessage) {
      if (messageEdit.length % 2 == 0) {
        console.log("1")
        const data = [
          ...tempData,
          ...messageEdit.slice(-2),
        ]
        setMessageData((prev: any) => ([
          ...data
        ]))
      }
      if (messageEdit.length % 2 !== 0) {
        console.log("2")
        const data = [
          ...tempData,
          ...messageEdit.slice(-1),
        ]
        setMessageData((prev: any) => ([
          ...data
        ]))
      }
    }
    console.log("edit", messageData)
  }, [messageEdit])

  useEffect(() => {
    if (!onLike) {
      messageWindowRef.current?.scrollTo(
        0,
        messageWindowRef.current.scrollHeight
      );
    }
  }, [messages, messageEdit, messageData]);

  useEffect(() => {
    console.log("tempData", tempData)
  }, [tempData])

  const { mutate: vectoriseDocMutation, isLoading: isVectorising } =
    api.document.vectorise.useMutation({
      onSettled: async (data, error, variables, context) => {
        await trpc.document.getHistoryByUser.refetch();
        await trpc.document.getDocumentTotalPage.refetch();
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Document has been vectorised.",
          duration: 3000,
        });
        refetchUserDocData(); // Refetch user document data to get updated isVectorised status
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message ?? "Something went wrong",
          variant: "destructive",
          duration: 3000,
        });
      },
    });

  const {
    data: userDocData,
    isLoading: isUserDocLoading,
    refetch: refetchUserDocData,
  } = api.document.getUserDocData.useQuery({
    userId: userId!,
    documentId: docId as string,
  });

  if (isUserDocLoading) {
    return <SpinnerCentered />;
  }

  const isVectorised = userDocData?.isVectorised;

  if (!isVectorised) {
    return (
      <FeatureCard
        isLoading={isVectorising}
        bulletPoints={[
          "🔍 Search and ask questions about any part of your PDF.",
          "📝 Summarize content with ease.",
          "📊 Analyze and extract data effortlessly.",
        ]}
        onClick={() => {
          vectoriseDocMutation(
            { documentId: docId as string },
            {
              onError: (err: any) => {
                toast({
                  title: "Uh-oh",
                  description: err?.message ?? "Something went wrong",
                  variant: "destructive",
                  duration: 3000,
                });
              },
            }
          );
        }}
        buttonText="Turn PDF Interactive"
        subtext="Easily extract key information and ask questions on the fly:"
        title="Unleash the power of your PDF documents through interactive chat!"
      />
    );
  }

  if (isLoading) {
    // console.log("Sedang loading", messages);
  }

  const resetEdit = () => {
    setEditMessage((prev: any) => ({ ...prev, bool: false, index: 99999, value: "" }));
  }

  const handleExecuteEditMessage = async () => {
    try {
      resetEdit()
      console.log("sebelum", messageData)
      const newMessage = messageData.filter((item: any, i: number) => i <= editMessage.index - 1)
      console.log("sesudah", newMessage)
      setTempData([...newMessage])
      setMessageData((prev: any) => ([
        ...newMessage
      ]))
      const submit = document.getElementById("editMessage") as HTMLButtonElement;
      submit.click()
      editMessageApi.mutate({
        docId: `${docId}`,
        index: editMessage.index
      })

    } catch (error) {
      console.log("Api error in Execute EditMessage", error)
    }
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden">

      <form onSubmit={submitEdit} className="absolute w-0 h-0 overflow-hidden">
        <input type="text" value={edit} onChange={(e) => { editOnChange(e) }} />
        <button id="editMessage">
          submit
        </button>
      </form>

      <div
        id="chatAI"
        className="hideScrollbar flex flex-1 flex-col gap-[3rem] overflow-auto pb-[1rem] px-[1rem]"
        ref={messageWindowRef}
      >
        {messageData.map((m: any, i: number) => {
          // Cek apakah konten pesan adalah data base64 gambar
          const isBase64Image = m.content.startsWith("https://scrhcjbmidwcmrgnaybg.supabase.co");

          return (
            <div
              key={m.id}
              className={cn(
                m.role === "user" && "mr-auto",
                m.role === "assistant" && "mr-auto",
                "w-full text-left"
              )}
            >
              {isBase64Image ? (
                <div className="flex gap-[1rem]">
                  <div
                    id="border"
                    className={`w-[30px] h-[30px] flex justify-center items-center overflow-hidden rounded-[50%] shrink-0 ${m.role === "user" ? "bg-blue-500" : "bg-green-600"
                      }`}
                  >
                    {/* <Image src={TutorCasn} alt='' className='w-full' /> */}
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="h-[30px] flex items-center font-[600] capitalize mb-[.5rem]">
                      <p>
                        {m.role === "user" ? session?.user.name : "TutorCASN"}
                      </p>
                    </div>
                    <div className="">
                      {imageMessageLoading.value && imageMessageLoading.index === i ?
                        <div className={`bg-main-gray-input my-1 w-fit rounded-xl  min-w-[300px] min-h-[200px]`}>
                        </div>
                        :
                        <div className={`my-1 bg-main-gray-input w-fit rounded-xl`}>
                          <img
                            src={m.content}
                            alt=""
                            className="h-auto max-w-full rounded-xl"
                          />
                        </div>
                      }
                    </div>
                    <div className="flex text-main-gray-text justify-end w-full mt-[.5rem]">
                      {/* <ChatTools role={m.role} data={m} /> */}
                      <div className="text-[.8rem] flex items-center">
                        {m.createdAt && (
                          <p>
                            {getHours(m.createdAt)} | {getDate(m.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-[1rem]">
                  <div
                    id="border"
                    className={`w-[30px] h-[30px] flex justify-center items-center overflow-hidden rounded-[50%] shrink-0 ${m.role === "user" ? "bg-blue-500" : "bg-green-600"
                      }`}
                  >
                    {/* <Image src={TutorCasn} alt='' className='w-full' /> */}
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="h-[30px] flex items-center font-[600] capitalize">
                      <p>
                        {m.role === "user" ? session?.user.name : "TutorCASN"}
                      </p>
                    </div>
                    {editMessage.index !== i &&
                      <ReactMarkdown
                        className={cn(
                          m.role === "user" && "bg-transparent",
                          m.role === "assistant" && "bg-transparent",
                          "prose rounded-xl py-1 prose-ul:pl-2 prose-li:px-2 break-words w-full"
                        )}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                          img: ({ node, ...props }) => (
                            <img style={{ maxWidth: "100%" }} {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a style={{ color: "blue" }} {...props} />
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    }
                    {editMessage.bool && i === editMessage.index &&
                      <div className="w-full border-main-gray-input border bg-white rounded-[1rem] overflow-hidden">
                        <input id="editInput" type="text" value={editMessage.value} className="w-full px-[1rem] py-[.5rem] rounded-[1rem] outline-none " onChange={(e) => {
                          setEditMessage((prev: any) => ({ ...prev, value: e.target.value }));
                          editOnChange(e);
                        }} />
                        <div className="flex w-full justify-end px-[1rem] py-[1rem] gap-[.5rem] text-[.9rem]">
                          <button className="bg-main-gray-input  py-[.2rem] px-[1rem] text-black rounded-[1rem] duration-200 hover:bg-main-gray-input2 active:bg-white"
                            onClick={() => {
                              resetEdit()
                            }}
                          >
                            Batal
                          </button>
                          <button className="bg-main py-[.2rem] px-[1rem] text-white rounded-[1rem] duration-200 hover:bg-main-hover active:bg-main"
                            onClick={() => { handleExecuteEditMessage() }}
                          >
                            Kirim
                          </button>
                        </div>
                      </div>
                    }
                    <div className="flex text-main-gray-text justify-between w-full mt-[.5rem]">
                      <ChatTools role={m.role} data={m} index={i} setEdit={setEditMessage} setOnlike={setOnlike} submitRegenerate={submitEdit} onChangeRegenerate={editOnChange} setTempData={setTempData} />
                      <div className="text-[.8rem] flex items-center">
                        {m.createdAt && (
                          <p>
                            {getHours(m.createdAt)} | {getDate(m.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && messageData[messageData.length - 1].role === "user" && (
          <div className="flex gap-[1rem]">
            <div
              id="border"
              className={`w-[30px] h-[30px] flex justify-center items-center overflow-hidden rounded-[50%] shrink-0 bg-green-600`}
            >
              {/* <Image src={TutorCasn} alt='' className='w-full' /> */}
            </div>
            <div className="flex flex-col w-full">
              <div className="h-[30px] flex items-center font-[600] capitalize">
                <p>TutorCASN</p>
              </div>
              <div className="bg-transparent px-[1rem] flex justify-center items-center w-fit rounded-[.5rem]">
                <LoadingMessage />
              </div>
              <div className="flex text-main-gray-text justify-between w-full mt-[.5rem]">
                <ChatTools role={"asistant"} />
                <div className="text-[.8rem] flex items-center">
                  <p>
                    {getHours(new Date())} | {getDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {isLoadingEditMessage && messageData[messageData.length - 1].role === "user" && (
          <div className="flex gap-[1rem]">
            <div
              id="border"
              className={`w-[30px] h-[30px] flex justify-center items-center overflow-hidden rounded-[50%] shrink-0 bg-green-600`}
            >
              {/* <Image src={TutorCasn} alt='' className='w-full' /> */}
            </div>
            <div className="flex flex-col w-full">
              <div className="h-[30px] flex items-center font-[600] capitalize">
                <p>TutorCASN</p>
              </div>
              <div className="bg-transparent px-[1rem] flex justify-center items-center w-fit rounded-[.5rem]">
                <LoadingMessage />
              </div>
              <div className="flex text-main-gray-text justify-between w-full mt-[.5rem]">
                <ChatTools role={"asistant"} />
                <div className="text-[.8rem] flex items-center">
                  <p>
                    {getHours(new Date())} | {getDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


      <form onSubmit={(e) => {
        handleSubmit(e);
        messageWindowRef.current?.scrollTo(
          0,
          messageWindowRef.current.scrollHeight
        );
      }}>
        <div className="mb-2 mt-1 flex w-full ">
          <div className="relative w-full flex items-center px-[1.5rem] py-[.5rem]">
            <TextareaAutosize
              maxLength={1000}
              placeholder="Ajukan pertanyaan (max 1,000 characters)"
              className="flex-1 resize-none rounded-[.6rem] border border-gray-300 pl-[1rem] pr-[4rem] py-[.8rem] font-normal outline-none w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  // @ts-ignore
                  handleSubmit(e);
                } else if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
              value={input}
              onChange={handleInputChange}
              autoFocus
              maxRows={4}
            />
            {isLoading ? (
              <button className="w-fit px-2">
                <BanIcon size={24} className="text-gray-500" onClick={stop} />
              </button>
            ) : (
              <button
                id="submitMessages"
                className="group w-fit rounded-ee-md rounded-se-md px-2 absolute right-8"
                type="submit"
              >
                <Send
                  size={24}
                  className=" text-gray-600 group-hover:text-gray-700"
                />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

const ChatTools = ({ role, data, index, setEdit, setOnlike, submitRegenerate, onChangeRegenerate, setTempData }: { role: any, data?: any, index?: any, setEdit?: any, setOnlike?: any, submitRegenerate?: any, onChangeRegenerate?: any, setTempData?: any }) => {
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const docId = pathnameArray && pathnameArray[pathnameArray?.length - 1];

  const { imageMessageLoading, setImageMessageLoading, messageData, setMessageData } = useContext(AppContexs)

  const trpc = api.useUtils()
  const like = api.message.likeMessage.useMutation({
    onSettled: async (data, error, variables, context) => {
      await trpc.message.getAllByDocIdAndUserId.refetch()
    },
    onMutate(variables) {
      const upData = messageData.filter((_: any, i: any) => i < index)
      const downData = messageData.filter((_: any, i: any) => i > index)
      setMessageData([
        ...upData,
        { ...data, like: !data.like },
        ...downData
      ])
    },
  })
  const dislike = api.message.dislikeMessage.useMutation({
    onSettled: async (data, error, variables, context) => {
      await trpc.message.getAllByDocIdAndUserId.refetch()
    },
    onMutate(variables) {
      const upData = messageData.filter((_: any, i: any) => i < index)
      const downData = messageData.filter((_: any, i: any) => i > index)
      setMessageData([
        ...upData,
        { ...data, dislike: !data.dislike },
        ...downData
      ])
    },
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(data.content).then(
      () => {
        toast({
          title: "Copied!",
          description: "The message has been copied.",
          duration: 2000,
        });
      },
      (err) => {
        toast({
          title: "Error",
          description: "Failed to copy the message.",
          variant: "destructive",
          duration: 2000,
        });
      }
    );
  };

  const handleEditMessage = () => {
    setEdit((prev: any) => ({ ...prev, bool: true, index: index, value: data.content }))
  }


  const regenerateApi = api.message.regenerateMessage.useMutation({
    onSettled: async (data, error, variables, context) => {
    },
    onMutate(variables) {
    },
  })

  const regenerateMessage = () => {
    regenerateApi.mutate({
      docId: `${docId}`,
      index: index
    })
    const submit = document.getElementById("editMessage") as HTMLButtonElement;
    console.log("sebelum", messageData)
    const newMessage = messageData.slice(0, -2)
    console.log("sesudah", newMessage)
    const e = {
      target: {
        value: messageData[index - 1].content
      }
    }
    setTempData([...newMessage])
    setMessageData([...newMessage])
    onChangeRegenerate(e)
    setTimeout(() => {
      submit.click()
    }, 500);
  }

  return (
    <>
      {role === "user" ? (
        <div className="text-[1.2rem] flex items-center gap-[.5rem]">
          {/* <i
            className="bx bx-copy hover:bg-main-gray-input rounded-[50%] p-[.2rem]"
            onClick={() => handleCopy()}
          /> */}
          <div className="hover:bg-main-gray-input duration-200 text-main-gray-text rounded-[50%] p-[.2rem]"
            onClick={() => { handleCopy() }}
          >
            <IconCopy w={18} className={``} />
          </div>
          <div className="hover:bg-main-gray-input duration-200 text-main-gray-text rounded-[50%] p-[.2rem]"
            onClick={() => { handleEditMessage() }}
          >
            <IconEdit w={18} className={``} />
          </div>
        </div>
      ) : (
        <div className="text-[1.2rem] flex items-center gap-[.2rem]">
          <div className="hover:bg-main-gray-input duration-200 text-main-gray-text rounded-[50%] p-[.2rem]"
            onClick={() => { handleCopy() }}
          >
            <IconCopy w={18} className={``} />
          </div>
          <div className="hover:bg-main-gray-input duration-200 text-main-gray-text rounded-[50%] p-[.2rem]"
            onClick={() => { setOnlike(true); like.mutate({ id: data?.id }) }}
          >
            {data?.like ?
              <IconLike w={18} className={``} active={true} />
              :
              <IconLike w={18} className={``} />
            }
          </div>
          <div className="hover:bg-main-gray-input duration-200 text-main-gray-text rounded-[50%] p-[.2rem]"
            onClick={() => { setOnlike(true); dislike.mutate({ id: data?.id }) }}
          >
            {data?.dislike ?
              <IconDislike w={18} className={``} active={true} />
              :
              <IconDislike w={18} className={``} />
            }
          </div>
          <div className="hover:bg-main-gray-input duration-200 text-main-gray-text rounded-[50%] p-[.2rem]">
            <IconSettingMessage w={18} className={``} />
          </div>
          {messageData.length - 1 === index &&
            <div className="hover:bg-main-gray-input duration-200 text-main-gray-text rounded-[50%] p-[.2rem]"
              onClick={() => regenerateMessage()}
            >
              <IconRegenerateMessage w={18} className={``} />
            </div>
          }
        </div>
      )}
    </>
  );
};
