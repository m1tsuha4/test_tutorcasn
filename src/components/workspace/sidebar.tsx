import { useEffect, useState } from "react";

import { AlbumIcon, Layers, MessagesSquareIcon, RotateCcw } from "lucide-react";
import { useRouter } from "next/router";

import Chat from "@/components/chat";
import Editor from "@/components/editor";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomTooltip } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { useBlocknoteEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import Flashcards from "../flash-card";
import { usePathname } from "next/navigation";
import {
  IconTabsChat,
  IconTabsFlashCard,
  IconTabsNotes,
} from "@/pages/_assest/icon/icon";

const TABS = [
  {
    value: "chat",
    title: "Chat",
    tooltip: "Chat with the pdf",
    icon: <IconTabsChat w={18} />,
    isNew: false,
  },
  {
    value: "notes",
    title: "Catatan",
    tooltip: "Take notes",
    icon: <IconTabsNotes w={18} />,
    isNew: false,
  },
  {
    value: "flashcards",
    title: "Kuis",
    tooltip: "Generate flashcards from the pdf",
    icon: <IconTabsFlashCard w={18} />,
    isNew: false,
  },
];

const tabNames = TABS.map((tab) => tab.value);

const Sidebar = ({ canEdit }: { canEdit: boolean }) => {
  const { query, push, asPath } = useRouter();
  const tab = query.tab as string;
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const docId = pathnameArray && pathnameArray[pathnameArray?.length - 1];
  const [documentId, setDocumentId] = useState((query?.docId as string) || ""); // Use query?.docId initially, then update via useEffect if needed
  const { editor } = useBlocknoteEditorStore();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const trpc = api.useUtils();
  const resetChat = api.message.resetMessage.useMutation({
    onSettled: async (data, error, variables, context) => {},
    onMutate(variables) {},
  });
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(
    tab && tabNames.includes(tab) ? tab : "notes"
  );

  useEffect(() => {
    // update activeIndex when tab changes externally (using switchSidebarTabToChat fn)
    if (tab && tabNames.includes(tab)) {
      setActiveIndex(tab);
    }
  }, [tab]);

  const handleResetConfirmation = async () => {
    setIsResetModalOpen(false);
    await handleResetChat();
  };

  useEffect(() => {
    const parts = asPath.split("/");
    const documentIndex = parts.findIndex((part) => part === "document");
    if (documentIndex !== -1 && documentIndex + 1 < parts.length) {
      let nextSegment = parts[documentIndex + 1].split("?")[0];
      setDocumentId(nextSegment);
    }
  }, [asPath, tab]);

  const handleResetChat = async () => {
    try {
      await resetChat.mutate({ docId: `${docId}` });
      router.reload();
    } catch (error) {
      console.error("Failed to reset chat:", error);
    }
  };

  return (
    <div className="bg-bg-workspace">
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
            <p>Are you sure you want to reset the chat?</p>
            <div className="mt-4 flex gap-4">
              <button
                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700"
                onClick={handleResetConfirmation}
              >
                Reset Chat
              </button>
            </div>
          </div>
        </div>
      )}
      <Tabs
        value={activeIndex}
        onValueChange={(value) => {
          setActiveIndex(value);
          push(
            {
              query: {
                ...query,
                tab: value,
              },
            },
            undefined,
            { shallow: true }
          );
        }}
        defaultValue="notes"
        className="max-h-screen max-w-full overflow-hidden"
      >
        <div className="flex items-center justify-between px-[1rem] bg-bg-workspace h-[60px] border-l border-b border-main-gray-input">
          <TabsList className="rounded-md bg-transparent h-full">
            {TABS.map((item) => (
              <CustomTooltip content={item.tooltip} key={item.value}>
                <TabsTrigger
                  value={item.value}
                  className="relative bg-transparent text-main-gray-text data-[state=active]:bg-main data-[state=active]:text-white capitalize text-[.95rem] font-[400] py-[.5rem] mr-[.5rem] rounded-[.7rem] border data-[state=active]:border-main border-main-gray-input2 flex items-center gap-[.5rem]"
                >
                  {item.icon}
                  {item.title}
                </TabsTrigger>
              </CustomTooltip>
            ))}
          </TabsList>
          <div className="flex items-center gap-1">
            <div
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "ml-auto cursor-pointer border-stone-200 bg-white px-2 text-xs shadow-sm sm:border"
              )}
              onClick={() => setIsResetModalOpen(true)}
            >
              <RotateCcw />
            </div>
          </div>
        </div>

        {[
          {
            value: "notes",
            tw: "flex-1 bg-bg-workspace border-main-gray-input border-l px-0 pr-[.5rem] sm:shadow-lg h-[calc(100vh-3.5rem)] w-full",
            children: <Editor canEdit={canEdit} />,
          },
          {
            value: "chat",
            tw: " p-2 pb-0 break-words bg-bg-workspace border-main-gray-input border-l px-0 pr-[.5rem] sm:shadow-lg h-[calc(100vh-3.5rem)] w-full ",
            children: <Chat />,
          },
          {
            value: "flashcards",
            tw: " p-2 pb-0 break-words bg-bg-workspace border-main-gray-input border-l px-0 pr-[.5rem] sm:shadow-lg h-[calc(100vh-3.5rem)] w-full ",
            children: <Flashcards />,
          },
        ].map((item) => (
          <TabsContent
            key={item.value}
            forceMount
            hidden={item.value !== activeIndex}
            value={item.value}
            className={item.tw}
          >
            {item.children}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
export default Sidebar;
