import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { supabase } from "@/servers/supabase/supabaseClient";

const Auth = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen max-w-md">
      <div className="mb-2">
      </div>
      <p className="px-6 mb-6 text-center text-gray-600">
        A place where all your achievements and general direction in life can be
        shred to pieces
      </p>
      <div className="w-full px-4">
        <Button className="mb-2" onClick={() => router.push("/auth/login")}>
          Login
        </Button>
        <Button variant="secondary" onClick={() => router.push("/auth/signup")}>
          Sign up
        </Button>
      </div>
    </div>
  );
};

export default Auth;
