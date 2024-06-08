import UserAccountNav from "@/components/navbar/user-account-nav";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <div className="p-4 border-b h-full flex pr-10  justify-end max-sm:justify-between  bg-white shadow-sm">
      {session ? (
        <UserAccountNav user={session.user} />
      ) : (
        <Button>
          <Link href="/auth/login">Sign Up</Link>
        </Button>
      )}
    </div>
  );
};

export default Navbar;
