import '@blocknote/mantine/style.css';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useCompletion } from 'ai/react';
import * as Y from 'yjs';

import AiPopover, {
  AiPopoverPropsRect,
} from '@/components/editor/custom/ai/popover';
import { toast } from '@/components/ui/use-toast';
import {
  getSlashMenuItems,
  schema,
} from '@/lib/editor-utils';
import { useBlocknoteEditorStore } from '@/lib/store';
import { YjsEditorProps } from '@/types/editor';
import {
  filterSuggestionItems,
  uploadToTmpFilesDotOrg_DEV_ONLY,
} from '@blocknote/core';
import {
  BasicTextStyleButton,
  BlockColorsItem,
  BlockNoteView,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  DragHandleMenu,
  DragHandleMenuItem,
  FormattingToolbar,
  FormattingToolbarController,
  ImageCaptionButton,
  NestBlockButton,
  RemoveBlockItem,
  ReplaceImageButton,
  SideMenu,
  SideMenuController,
  SuggestionMenuController,
  TextAlignButton,
  UnnestBlockButton,
  useCreateBlockNote,
} from '@blocknote/react';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';

export default function Editor({ canEdit }: { canEdit: boolean }) {
  const [doc, setDoc] = useState<Y.Doc>();

  // console.log(doc, "ini docccc");
  useEffect(() => {
    const yDoc = new Y.Doc();

    setDoc(yDoc);

    return () => {
      yDoc?.destroy();
    };
  }, []);

  if (!doc) {
    return null;
  }

  return <BlockNoteEditor canEdit={canEdit} doc={doc} />;
}

function BlockNoteEditor({ doc, canEdit }: YjsEditorProps) {
  // const { mutate: updateNotesMutation } =
  //   api.document.updateNotes.useMutation();
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const docId = pathnameArray && pathnameArray[pathnameArray?.length - 1]

  // const { data, error, isError } = api.highlight.getHighlight.useQuery({
  //   documentId: `${docId}`,
  //   pageNumber: 1,
  //   x1: 85.28125,
  //   y1: 381.28125,
  //   x2: 138.070892333984,
  //   y2: 397.28125,
  // })

  // if (data) {
  //   console.log("HighlightData:", data)
  // }

  const { data, error, isError } = api.highlight.getAllHighlight.useQuery()

  if (data) {
    // console.log("HighlightData:", data)
  }

  // const debounced = useDebouncedCallback((value) => {
  //   updateNotesMutation({
  //     markdown: value,
  //     documentId: query?.docId as string,
  //   });
  // }, 3000);

  const { setEditor } = useBlocknoteEditorStore();

  const { complete, completion, isLoading, stop } = useCompletion({
    onFinish: (_prompt, completion) => {
      // select the text that was just inserted
      // editor?._tiptapEditor.commands.setTextSelection({
      //   from: editor._tiptapEditor.state.selection.from - completion.length,
      //   to: editor._tiptapEditor.state.selection.from,
      // });

      editor._tiptapEditor.commands.focus("end");
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Something went wrong with text generation",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // const generateAiContent = (editor: BlockNoteEditorType) => {
  //   complete(
  //     getPrevText(editor._tiptapEditor, {
  //       chars: 500,
  //       offset: 1,
  //     }),
  //   );
  // };
  // const insertAi: ReactSlashMenuItem<typeof blockSchema> = {
  //   name: "Continue with AI",
  //   // @ts-ignore
  //   execute: generateAiContent,
  //   aliases: ["ai", "fill"],
  //   group: "AI",
  //   icon: <Bot size={24} />,
  //   hint: "Continue your idea with some extra inspiration!",
  // };

  const editor = useCreateBlockNote(
    {
      // onEditorContentChange: (editor) => {
      //   debounced(JSON.stringify(editor.topLevelBlocks, null, 2));
      // },
      schema,

      // todo replace this with our storage
      uploadFile: uploadToTmpFilesDotOrg_DEV_ONLY,
      domAttributes: {
        editor: {
          class: "my-6",
        },
      },
    },
    []
  );
  // const editor = useCreateBlockNote(
  //   {

  //     // editable: canEdit,
  //     // collaboration: {
  //     //   provider,
  //     //   fragment: doc.getXmlFragment("document-store"),
  //     //   user: {
  //     //     name: username || "User",
  //     //     color: getRandomLightColor(),
  //     //   },
  //     // },

  //     onEditorReady: (editor: any) => {
  //       setEditor(editor);
  //     },
  //     onEditorContentChange: async (editor: any) => {
  //       const block = editor.getTextCursorPosition().block;
  //       const blockText = (await editor.blocksToMarkdownLossy([block])).trim();
  //       const lastTwo = blockText?.slice(-2);
  //       if (lastTwo === "++" && !isLoading) {
  //         editor.updateBlock(block, {
  //           id: block.id,
  //           content: blockText?.slice(0, -2) + " ",
  //         });
  //         complete(blockText?.slice(-500) ?? "");
  //       }
  //     },
  //     blockSpecs: blockSpecs,
  //     // todo replace this with our storage
  //     uploadFile: uploadToTmpFilesDotOrg_DEV_ONLY,
  //     domAttributes: {
  //       editor: {
  //         class: "my-6",
  //       },
  //     },
  //     slashMenuItems: [...slashMenuItems, insertAi],
  //   },
  //   [canEdit],
  // );
  // console.log("Highligt data:", editor)

  useEffect(() => {
    if (!editor) return;

    setEditor(editor);
  }, [editor]);

  const prev = useRef("");

  useEffect(() => {
    if (!editor) return;

    const streamCompletion = async () => {
      const diff = completion?.slice(prev.current.length);
      prev.current = completion;

      const block = editor.getTextCursorPosition().block;
      const blockText = (await editor.blocksToMarkdownLossy([block])).trim();

      editor.updateBlock(editor.getTextCursorPosition().block, {
        id: editor.getTextCursorPosition().block.id,
        content: blockText + diff,
      });
    };

    streamCompletion();
  }, [isLoading, completion]);

  useEffect(() => {
    if (!editor) return;

    // if user presses escape or cmd + z and it's loading,
    // stop the request, delete the completion, and insert back the "++"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.metaKey && e.key === "z")) {
        stop();
        if (e.key === "Escape") {
          editor?._tiptapEditor.commands.deleteRange({
            from: editor._tiptapEditor.state.selection.from - completion.length,
            to: editor._tiptapEditor.state.selection.from,
          });
        }
        editor?._tiptapEditor.commands.insertContent("++");
      }
    };
    const mousedownHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stop();
    };
    if (isLoading) {
      document.addEventListener("keydown", onKeyDown);
      window.addEventListener("mousedown", mousedownHandler);
    } else {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", mousedownHandler);
    };
  }, [stop, isLoading, editor, complete, completion.length]);

  const [rect, setRect] = useState<AiPopoverPropsRect>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = editorRef.current;
    if (!rect || !scrollContainer) return;

    const handleScroll = () => {
      console.log("SCROLLINN");

      const newRect = scrollContainer.getBoundingClientRect();
      setRect((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          top: newRect.top + newRect.height,
          left: newRect.left,
          width: newRect.width,
        };
      });
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);




  return (
    <div>
      <BlockNoteView
        // ref={editorRef}
        sideMenu={false}
        onChange={async () => {
          const block = editor.getTextCursorPosition().block;
          const blockText = (
            await editor.blocksToMarkdownLossy([block])
          ).trim();

          const lastTwo = blockText?.slice(-2);
          if (lastTwo === "++" && !isLoading) {
            editor.updateBlock(block, {
              id: block.id,
              content: blockText?.slice(0, -2),
            });
            complete(blockText?.slice(-500) ?? "");
          }
        }}
        className="w-full flex-1"
        theme={"light"}
        editor={editor}
        slashMenu={false}
        editable={canEdit}
        formattingToolbar={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(getSlashMenuItems(editor), query)
          }
        />

        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              <BlockTypeSelect key={"blockTypeSelect"} />

              <ImageCaptionButton key={"imageCaptionButton"} />
              <ReplaceImageButton key={"replaceImageButton"} />

              <BasicTextStyleButton
                basicTextStyle={"bold"}
                key={"boldStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"italic"}
                key={"italicStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"underline"}
                key={"underlineStyleButton"}
              />
              <BasicTextStyleButton
                basicTextStyle={"strike"}
                key={"strikeStyleButton"}
              />
              <BasicTextStyleButton
                key={"codeStyleButton"}
                basicTextStyle={"code"}
              />

              <TextAlignButton
                textAlignment={"left"}
                key={"textAlignLeftButton"}
              />
              <TextAlignButton
                textAlignment={"center"}
                key={"textAlignCenterButton"}
              />
              <TextAlignButton
                textAlignment={"right"}
                key={"textAlignRightButton"}
              />

              <ColorStyleButton key={"colorStyleButton"} />

              <NestBlockButton key={"nestBlockButton"} />
              <UnnestBlockButton key={"unnestBlockButton"} />

              <CreateLinkButton key={"createLinkButton"} />
            </FormattingToolbar>
          )}
        />

        <SideMenuController
          sideMenu={(props) => (
            <SideMenu
              {...props}
              dragHandleMenu={(props) => (
                <DragHandleMenu {...props}>
                  <RemoveBlockItem {...props}>Delete</RemoveBlockItem>
                  <DragHandleMenuItem
                    onClick={async () => {
                      const blockDiv = document.querySelector(
                        `div[data-id="${props.block.id}"]`
                      ) as HTMLElement;

                      if (!blockDiv) return;

                      // select the div
                      const selection = window.getSelection();
                      const range = document.createRange();
                      range.selectNodeContents(blockDiv);
                      selection?.removeAllRanges();
                      selection?.addRange(range);

                      // scroll to the div
                      blockDiv.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });

                      const rect = blockDiv.getBoundingClientRect();
                      const top = rect.top + rect.height;
                      const left = rect.left;
                      const width = rect.width;

                      const text = await editor.blocksToMarkdownLossy([
                        props.block,
                      ]);

                      setRect({
                        top,
                        left,
                        width,
                        blockId: props.block.id,
                        text,
                      });
                    }}
                  >
                    AI
                  </DragHandleMenuItem>
                  <BlockColorsItem {...props}>Colors</BlockColorsItem>
                </DragHandleMenu>
              )}
            />
          )}
        />
        {rect && <AiPopover rect={rect} setRect={setRect} />}
      </BlockNoteView>
    </div>
  );
}
