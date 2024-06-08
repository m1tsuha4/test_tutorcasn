// src/components/DocViewerPage.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";
import DocViewer from "@/components/pdf-reader";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "@/components/workspace/sidebar";
import { SpinnerPage } from "@/components/ui/spinner";
import { usePathname } from "next/navigation";
import Layout from "@/pages/user/layout";
import { supabase } from "@/servers/supabase/supabaseClient";

const DocViewerPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameArray = pathname?.split("/");
  const docId = pathnameArray && pathnameArray[pathnameArray?.length - 1];

  const {
    data: doc,
    isLoading,
    isError,
    error,
  } = api.document.getDocData.useQuery(
    { docId: docId as string },
    {
      enabled: !!docId,
    }
  );

  // console.log("workspace:", doc)

  const trpc = api.useUtils();
  const updateHistory = api.document.updateHistory.useMutation({
    onSettled: async (data, error, variables, context) => {
      await trpc.document.getHistoryByUser.refetch();
      await trpc.document.getDocumentTotalPage.refetch();
      // console.log("Update History")
    },
  });

  useEffect(() => {
    if (docId) {
      updateHistory.mutate({
        documentId: docId as string,
      });
    }
  }, [docId]);

  if (!docId) {
    return <p>Document ID not found in the URL.</p>;
  }

  if (isLoading) {
    return <SpinnerPage />;
  }

  if (isError) {
    console.error("Error fetching document:", error);
    return <p>Error loading the document.</p>;
  }

  return (
    <Layout chat={true}>
      <ResizablePanelGroup autoSaveId="window-layout" direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={30}>
          <DocViewer doc={doc} canEdit={true} />
        </ResizablePanel>
        <div className="group flex flex-col w-2 cursor-col-resize items-center justify-between rounded-md bg-bg-workspace">
          <div className="h-[60px] w-full bg-bg-workspace border-b border-main-gray-input"></div>
          <ResizableHandle className="h-1 w-24 rounded-full bg-neutral-400 duration-300 group-hover:bg-primary group-active:bg-primary group-active:duration-75 lg:h-24 lg:w-1" />
          <div className=""></div>
        </div>
        <ResizablePanel defaultSize={50} minSize={30}>
          <Sidebar canEdit={doc.userPermissions.canEdit} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Layout>
  );
};

export default DocViewerPage;
