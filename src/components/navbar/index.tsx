import UserAccountNav from "@/components/navbar/user-account-nav";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import LOGO from "../../pages/_assest/logomark.png"

const Navbar = ({ showAuth, setShowAuth }: any) => {
  const { data: session } = useSession();

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-4 py-4 lg:px-16 2xl:max-w-7xl">
      <div className="flex items-center justify-between bg-opacity-30 backdrop-blur-lg backdrop-filter">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Image alt="TutorCASN" src={LOGO} width={30} />
            <span className="font-semibold">TutorCASN</span>
          </div>
        </Link>
        {
          session ? (
            <UserAccountNav user={session.user} />
          ) : (
            <button className="bg-main text-white py-[.5rem] px-[1rem] rounded-[1.5rem]"
              onClick={() => setShowAuth({ signUp: true, login: false })}
            >Daftar/Masuk</button>
          )
        }
      </div >
    </div >
  );
};
export default Navbar;
