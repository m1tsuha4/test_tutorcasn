import { api } from "@/lib/api";
import { getServerAuthSession } from "@/servers/auth";
import {
  getUserData,
  removeCookieLogout,
  token,
  user_data,
} from "../../lib/getSession";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    console.log("Authenticated as:", session.user);
  } else {
    console.log("Not authenticated");
  }

  const { data, error, isLoading } = api.user.userData.useQuery();

  return (
    <div className="">
      Dashboard User <br />
      <p>id : {session?.user.id}</p>
      <p>Name : {session?.user.name}</p>
      <p>email : {session?.user.email}</p>
      <p>role : {session?.user.role}</p>
      <button
        onClick={() => signOut()}
        className="bg-blue-500 text-white rounded-[.5rem] px-[1rem] py-[.2rem] mt-4 ml-4"
      >
        Logout
      </button>
      <button
        onClick={() => router.push("/admin/dashboard")}
        className="bg-blue-500 text-white rounded-[.5rem] px-[1rem] py-[.2rem] mt-4 ml-4"
      >
        Go to admin dashboard
      </button>
    </div>
  );
}
