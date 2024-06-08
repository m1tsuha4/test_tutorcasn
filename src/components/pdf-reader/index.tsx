import { useEffect, useState } from 'react';

import { ChevronLeftIcon } from 'lucide-react';
import { useRouter } from 'next/router';

import PdfReader from '@/components/pdf-reader/pdf-reader';
import { buttonVariants } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { useBlocknoteEditorStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AppRouter } from '@/servers/api/root';
import {
  HighlightContentType,
  HighlightPositionType,
} from '@/types/highlight';
import { insertOrUpdateBlock } from '@blocknote/core';
import { createId } from '@paralleldrive/cuid2';
import { HighlightTypeEnum } from '@prisma/client';
import { inferRouterOutputs } from '@trpc/server';
import { IconMinus, IconPlus, IconSearch, IconVision } from '@/pages/_assest/icon/icon';

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

const DocViewer = ({
  canEdit,
  doc,
}: {
  canEdit: boolean;
  doc: inferRouterOutputs<AppRouter>["document"]["getDocData"];
}) => {
  const { query, isReady } = useRouter();
  const router = useRouter();

  // console.log("DocData:", doc)

  const docId = doc?.id;
  const id = doc?.id;
  const url = doc?.url;

  const { data: totalPage } = api.document.getDocumentTotalPage.useQuery({ docId })

  // const { mutate: addHighlightMutation } = api.highlight.add.useMutation({
  //   async onMutate(newHighlight) {
  //     await utils.document.getDocData.cancel();
  //     const prevData = utils.document.getDocData.getData();

  //     // @ts-ignore
  //     utils.document.getDoclData.setData({ docId: docId as string }, (old) => {
  //       if (!old) return null;

  //       return {
  //         ...old,
  //         highlights: [
  //           ...old.highlights,
  //           {
  //             position: {
  //               boundingRect: newHighlight.boundingRect,
  //               rects: newHighlight.rects,
  //               pageNumber: newHighlight.pageNumber,
  //             },
  //           },
  //         ],
  //       };
  //     });

  //     return { prevData };
  //   },
  //   onError(err, newPost, ctx) {
  //     toast({
  //       title: "Error",
  //       description: "Something went wrong",
  //       variant: "destructive",
  //       duration: 3000,
  //     });

  //     utils.document.getDocData.setData(
  //       { docId: docId as string },
  //       ctx?.prevData
  //     );
  //   },
  //   onSettled() {
  //     // Sync with server once mutation has settled
  //     utils.document.getDocData.invalidate();
  //   },
  // });

  const { mutate: addHighlightMutation } = api.highlight.add.useMutation({
    onSettled(data, error, variables, context) {
      alert("Berhasil highlight")
    },
  })
  const { mutate: deleteHighlightMutation } = api.highlight.delete.useMutation({
    async onMutate(oldHighlight) {
      await utils.document.getDocData.cancel();
      const prevData = utils.document.getDocData.getData();

      utils.document.getDocData.setData({ docId: docId as string }, (old) => {
        if (!old) return undefined;
        return {
          ...old,
          highlights: [
            ...old.highlights.filter(
              (highlight) => highlight.id !== oldHighlight.highlightId
            ),
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

  const { editor } = useBlocknoteEditorStore();

  const addHighlightToNotes = (
    content: string,
    highlightId: string,
    type: HighlightContentType
  ) => {
    if (!editor) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!canEdit) {
      toast({
        title: "Error",
        description: "User can't edit this document",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (type === HighlightContentType.TEXT) {
      if (!content || !highlightId) return;

      insertOrUpdateBlock(editor, {
        content,
        props: {
          highlightId,
        },
        type: "highlight",
      });
    } else {
      if (!content || !highlightId) return;

      try {
        insertOrUpdateBlock(editor, {
          props: {
            url: content,
          },
          type: "image",
        });
      } catch (err: any) {
        console.log(err.message, "errnes");
      }
    }
  };

  const utils = api.useContext();

  useEffect(() => {
    const scrollToHighlightFromHash = () => { };

    window.addEventListener("hashchange", scrollToHighlightFromHash, false);

    return () => {
      window.removeEventListener("hashchange", scrollToHighlightFromHash);
    };
  }, []);

  function getHighlightById(id: string): HighlightType | undefined {
    return doc?.highlights?.find((highlight) => highlight.id === id);
  }

  async function addHighlight({ content, position }: AddHighlighType) {
    const highlightId = createId();

    if (!content.text && !content.image) return;
    const isTextHighlight = !content.image;

    // todo check if user has edit/admin access

    addHighlightMutation({
      id: highlightId,
      boundingRect: position.boundingRect,
      type: isTextHighlight ? HighlightTypeEnum.TEXT : HighlightTypeEnum.IMAGE,
      documentId: docId as string,
      pageNumber: position.pageNumber,
      rects: position.rects,
    });
    // addHighlightMutation({
    //   documentId: docId,
    //   pageNumber: 1
    // });

    if (isTextHighlight) {
      if (!content.text) return;
      addHighlightToNotes(content.text, highlightId, HighlightContentType.TEXT);
    } else {
      if (!content.image) return;

      addHighlightToNotes(
        content.image,
        highlightId,
        HighlightContentType.IMAGE
      );
    }
  }

  const deleteHighlight = (id: string) => {
    // todo check if user has edit/admin access
    deleteHighlightMutation({
      documentId: docId as string,
      highlightId: id,
    });
  };
  if (!doc?.highlights || !isReady) {
    return;
  }

  const [vision, setVision] = useState<boolean>(false)

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex items-center justify-between h-[60px] bg-bg-workspace border-b border-main-gray-input py-[1rem]">
        <div className="flex items-center ">
          <div
            onClick={() => router.back()}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-fit justify-start"
            )}
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
          </div>

          <p className="line-clamp-1 font-semibold text-[.9rem]">{doc?.title ?? id}</p>
        </div>
        <div className="flex items-center gap-[1.5rem] text-[1.5rem]">
          <p className=" border-r pr-[1rem] text-[1rem] font-[500] shrink-0"><span className="font-[400] bg-bg-workspace py-[.3rem] px-[.6rem] whitespace-nowrap rounded-[.5rem]">1</span> / {totalPage ? totalPage : "-"}</p>
          <div className="flex items-center gap-[.5rem]">
            <IconMinus className={"text-main-gray-text2"} w={15} />
            <div className="bg-bg-workspace py-[.5rem] px-[1rem] rounded-[.8rem]">
              <p className="text-[1rem]">100%</p>
            </div>
            <IconPlus className={"text-main-gray-text2"} w={15} />
          </div>
          <IconSearch className={"text-main-gray-text2 shrink-0"} />
          <div className="" onClick={() => { setVision(!vision) }}
          >
            <IconVision className={`${vision ? "text-main" : "text-main-gray-text2 "} shrink-0 hover:text-main cursor-pointer`} />
          </div>
        </div>
      </div>
      <div id='DocumentViewPdf' className={`relative h-full w-full bg-bg-workspace border-[2px] ${vision ? " border-main" : "border-transparent"} `}>
        {/* <div className="absolute z-[10] top-0 left-0 w-full h-full bg-black"></div> */}
        <div className="relative border-[1rem] border-bg-workspace h-full w-full">
          <PdfReader
            docId={id as string}
            deleteHighlight={deleteHighlight}
            docUrl={url}
            getHighlightById={getHighlightById}
            addHighlight={addHighlight}
            highlights={doc.highlights ?? []}
            vision={vision}
          />
        </div>
      </div>
    </div>
  );
};

export default DocViewer;
