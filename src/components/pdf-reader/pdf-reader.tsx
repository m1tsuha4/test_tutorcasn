import { SpinnerPage } from "@/components/ui/spinner";
import { CustomTooltip } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { env } from "@/env.mjs";
import { api } from "@/lib/api";
import { useChatStore } from "@/lib/store";
import { copyTextToClipboard } from "@/lib/utils";
import { AppContexs } from "@/pages/_app";
import { base64ToFile } from "@/pages/help";
import { AppRouter } from "@/servers/api/root";
import { supabase } from "@/servers/supabase/supabaseClient";
import { HighlightPositionType } from "@/types/highlight";
import { HighlightTypeEnum } from "@prisma/client";
import { inferRouterOutputs } from "@trpc/server";
import { useChat } from "ai/react";
import {
  BookOpenCheck,
  ClipboardCopy,
  Highlighter,
  Lightbulb,
  ScanText,
  TrashIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
} from "react-pdf-highlighter";

const parseIdFromHash = () => document.location.hash.slice(1);

const resetHash = () => {
  document.location.hash = "";
};

type RouterOutput = inferRouterOutputs<AppRouter>;
type HighlightType =
  RouterOutput["document"]["getDocData"]["highlights"][number];

interface AddHighlighType {
  content: {
    text?: string;
    image?: string;
  };
  position: HighlightPositionType;
}

const PdfReader = ({
  docUrl,
  getHighlightById,
  addHighlight,
  deleteHighlight,
  highlights,
  docId,
  vision
}: {
  docId: string;
  docUrl: string;
  getHighlightById: (id: string) => HighlightType | undefined;
  addHighlight: ({ content, position }: AddHighlighType) => Promise<void>;
  deleteHighlight: (id: string) => void;
  highlights: HighlightType[];
  vision: boolean
}) => {
  const utils = api.useContext();

  const [urlPdf, setUrlPdf] = useState<any>(docUrl)

  const { mutate: updateAreaHighlight } =
    api.highlight.updateAreaHighlight.useMutation({
      async onMutate(newHighlight) {
        await utils.document.getDocData.cancel();
        const prevData = utils.document.getDocData.getData();
        console.log("PrevTest:", prevData)

        // @ts-ignore
        utils.document.getDocData.setData({ docId: docId as string }, (old) => {
          if (!old) return undefined;
          return {
            ...old,
            highlights: [
              ...old.highlights.filter(
                (highlight) => highlight.id !== newHighlight.id
              ),
              {
                position: {
                  boundingRect: newHighlight.boundingRect,
                  pageNumber: newHighlight.pageNumber,
                  rects: [],
                },
              },
            ],
          };
        });
        return { prevData };
      },
      onError(err, newPost, ctx) {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
          duration: 3000,
        });
        utils.document.getDocData.setData(
          { docId: docId as string },
          ctx?.prevData
        );
      },
      onSettled() {
        utils.document.getDocData.invalidate();
      },
    });


  let scrollViewerTo = (highlight: any) => { };

  const scrollToHighlightFromHash = () => {
    const highlight = getHighlightById(parseIdFromHash());

    if (highlight) {
      scrollViewerTo(highlight);
    }
  };

  const { sendMessage } = useChatStore();

  useEffect(() => {
    const temp = urlPdf
    setUrlPdf("")
    setTimeout(() => {
      setUrlPdf(temp)
    }, 10);
  }, [vision])



  return (
    <PdfLoader url={urlPdf} beforeLoad={<SpinnerPage />}>
      {(pdfDocument) => (
        <PdfHighlighter
          pdfDocument={pdfDocument}
          enableAreaSelection={(event) => vision}
          onScrollChange={resetHash}
          // pdfScaleValue={this.state.zoomLevel}
          scrollRef={(scrollTo) => {
            scrollViewerTo = scrollTo;
            scrollToHighlightFromHash();
          }}
          onSelectionFinished={(
            position,
            content,
            hideTipAndSelection,
            transformSelection
          ) => {
            return (
              <TextSelectionPopover
                sendMessage={sendMessage}
                content={content}
                hideTipAndSelection={hideTipAndSelection}
                position={position}
                addHighlight={() => addHighlight({ content, position })}
              />
            );
          }}
          highlightTransform={(
            highlight,
            index,
            setTip,
            hideTip,
            viewportToScaled,
            screenshot,
            isScrolledTo
          ) => {
            const isTextHighlight = highlight.position.rects?.length !== 0;

            const component = isTextHighlight ? (
              <div id={highlight.id}>
                {/* @ts-ignore */}
                <Highlight
                  isScrolledTo={isScrolledTo}
                  position={highlight.position}
                />
              </div>
            ) : (
              <div id={highlight.id}>
                <AreaHighlight
                  isScrolledTo={isScrolledTo}
                  highlight={highlight}
                  onChange={(boundingRect) => {
                    updateAreaHighlight({
                      id: highlight.id,
                      boundingRect: viewportToScaled(boundingRect),
                      type: HighlightTypeEnum.IMAGE,
                      documentId: docId as string,
                      ...(boundingRect.pageNumber
                        ? { pageNumber: boundingRect.pageNumber }
                        : {}),
                    });
                  }}
                />
              </div>
            );

            return (
              <Popup
                popupContent={
                  <HighlightedTextPopup
                    id={highlight.id}
                    deleteHighlight={deleteHighlight}
                    hideTip={hideTip}
                  />
                }
                onMouseOver={(popupContent) =>
                  setTip(highlight, (highlight) => popupContent)
                }
                onMouseOut={hideTip}
                key={index}
              >
                {component}
              </Popup>
            );
          }}
          // @ts-ignore
          highlights={highlights}
        />
      )}
    </PdfLoader>
  );
};

const TextSelectionPopover = ({
  content,
  hideTipAndSelection,
  position,
  addHighlight,
  sendMessage,
}: {
  position: any;
  addHighlight: () => void;
  content: {
    text?: string | undefined;
    image?: string | undefined;
  };
  hideTipAndSelection: () => void;
  sendMessage: ((message: string) => void) | null;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const docId = pathnameArray && pathnameArray[pathnameArray?.length - 1];

  const { data: prevChatMessages, isLoading: isChatsLoading } =
    api.message.getAllByDocIdAndUserId.useQuery(
      {
        documentId: docId as string,
      },
      {
        refetchOnWindowFocus: false,
      }
    );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
    append,
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
  });


  const switchSidebarTabToChat = () => {
    router.push({
      query: {
        ...router.query,
        tab: "chat",
      },
    });
  };


  const { imageMessageLoading, setImageMessageLoading, messageData, setMessageData } = useContext(AppContexs)

  const messagesCheck = [
    {
      id: "id",
      content:
        "Welcome to **TutorCASN**! I'm here to assist you. Feel free to ask questions or discuss topics based on the data provided. Whether it's clarifying information, diving deeper into a subject, or exploring related topics, I'm ready to help. Let's make the most out of your learning!",
      role: "assistant",
      createAt: null,
    },
    ...(prevChatMessages ?? []),
    ...messages,
  ]

  useEffect(() => {
    console.log("messagesCheck", messagesCheck)
  }, [messages, prevChatMessages])

  const getOptions = () => {
    const options = [];
    if (content.text) {
      options.push({
        onClick: () => {
          copyTextToClipboard(content.text, hideTipAndSelection);
          hideTipAndSelection();
        },
        icon: ClipboardCopy,
        tooltip: "Copy the text",
        title: "Salin"
      });

      if (sendMessage) {
        options.push(
          {
            onClick: () => {
              sendMessage("**Explain**: " + content.text);
              switchSidebarTabToChat();
              hideTipAndSelection();
            },
            icon: Lightbulb,
            tooltip: "Explain the text",
            title: "Jelaskan"
          },
          {
            onClick: () => {
              sendMessage("**Summarise**: " + content.text);
              switchSidebarTabToChat();
              hideTipAndSelection();
            },
            icon: BookOpenCheck,
            tooltip: "Summarise the text",
            title: "Simpulkan"
          }
        );
      }
    }
    if (content.image) {
      options.push({
        onClick: async () => {
          setImageMessageLoading({
            value: true,
            index: messageData.length - 1
          })
          console.log("length", messagesCheck.length)
          const file = base64ToFile(content.image, `${crypto.randomUUID()}`)
          console.log(file)
          if (sendMessage && content.image) {
            // sendMessage(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/img/${file.name.replace(/ /g, "%20")}`)
          }
          switchSidebarTabToChat();
          hideTipAndSelection();
          const { data, error } = await supabase.storage.from("img").upload(`${file.name}`, file)
          if (data && sendMessage) {
            sendMessage(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/img/${file.name.replace(/ /g, "%20")}`)
            setImageMessageLoading({
              value: false,
              index: 9999
            })
          }
          if (error) {
            alert("Error")
          }
        },
        icon: ScanText,
        tooltip: "Analyze",
        title: "Analisa"
      });
    }

    if (content.image || content.text) {
      options.push({
        onClick: () => {
          addHighlight();
          hideTipAndSelection();
        },
        icon: Highlighter,
        tooltip: "Highlight",
        title: "Highlight"
      });
    }
    return options;
  };
  const OPTIONS = getOptions();

  return (
    <div className="relative rounded-md bg-black">
      <div className="absolute -bottom-[10px] left-[50%] h-0 w-0 -translate-x-[50%] border-l-[10px] border-r-[10px] border-t-[10px] border-solid border-black border-l-transparent border-r-transparent " />

      <div id="tooltips" className="flex divide-x divide-gray-800">
        {OPTIONS.map((option, id) => {
          if (!option) return null;
          return (
            <div
              className="group p-2 hover:cursor-pointer"
              key={id}
              onClick={option.onClick}
            >
              <CustomTooltip content={option.tooltip}>
                {/* <option.icon className="h-5 w-5 text-gray-300 group-hover:text-gray-50" /> */}
                {option.title === "Salin" ?
                  <div className="flex items-center gap-[.5rem]">
                    <option.icon className="h-5 w-5 text-gray-300 group-hover:text-gray-50" />
                    <p className="text-white w-fit whitespace-nowrap">{option.title}</p>
                  </div>
                  :
                  <p className="text-white w-fit whitespace-nowrap">{option.title}</p>
                }
              </CustomTooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HighlightedTextPopup = ({
  id,
  deleteHighlight,
  hideTip,
}: {
  id: string;
  deleteHighlight: any;
  hideTip: () => void;
}) => {
  const OPTIONS = [
    {
      onClick: () => {
        deleteHighlight(id);
        hideTip();
      },
      icon: TrashIcon,
    },
  ];

  return (
    <div className="relative rounded-md bg-black">
      <div className="absolute -bottom-[10px] left-[50%] h-0 w-0 -translate-x-[50%] border-l-[10px] border-r-[10px] border-t-[10px] border-solid border-black border-l-transparent border-r-transparent " />

      <div className="flex divide-x divide-gray-800">
        {OPTIONS.map((option, id) => (
          <div
            className="group p-2 hover:cursor-pointer"
            key={id}
            onClick={option.onClick}
          >
            <option.icon
              size={18}
              className="rounded-full text-gray-300 group-hover:text-gray-50"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default PdfReader;
