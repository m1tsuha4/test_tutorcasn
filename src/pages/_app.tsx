import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import "@/styles/globals.css";
import { api } from "@/lib/api";
import { Toaster } from "@/components/ui/toaster";
import { SEO } from "../../next-seo.config";
import { DefaultSeo } from "next-seo";
import Head from "next/head";
import { createContext, useState } from "react";

export const AppContexs = createContext<any>(null)

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {

  const [minimizeSidebar, setMinimizeSidebar] = useState<boolean>(false)
  const [showSidebar, setShowSidebar] = useState<boolean>(true)
  const [messageData, setMessageData] = useState<any>([
    {
      id: "id",
      content:
        "Welcome to **TutorCASN**! I'm here to assist you. Feel free to ask questions or discuss topics based on the data provided. Whether it's clarifying information, diving deeper into a subject, or exploring related topics, I'm ready to help. Let's make the most out of your learning!",
      role: "assistant",
      createAt: null,
      like: false,
      dislike: false
    },])
  const [imageMessageLoading, setImageMessageLoading] = useState<any>({
    index: 99999,
    value: true
  })
  return (
    <SessionProvider session={session}>
      <Head>
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </Head>
      <DefaultSeo {...SEO} />
      <AppContexs.Provider value={{ minimizeSidebar, setMinimizeSidebar, showSidebar, setShowSidebar, imageMessageLoading, setImageMessageLoading, messageData, setMessageData }}>
        <Component {...pageProps} />
      </AppContexs.Provider>
      <Toaster />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
