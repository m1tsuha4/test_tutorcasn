import React, { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/servers/supabase/supabaseClient";
import withAuthRedirect from "@/components/other/withAuthRedirect";
import { api } from "@/lib/api";
import Cookie from "js-cookie";
import { signIn, useSession } from "next-auth/react";

interface LoginValues {
  email: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // const login = api.test.login.useMutation({
  //   onSettled(data, error, variables, context) {
  //     // if (!error) {
  //     //   router.push("/admin/dashboard")
  //     // }
  //   },
  //   onSuccess(data: any, variables: any, context: any) {
  //     alert("Berhasil")
  //     console.log(data.token)
  //     if (data && data.token) {
  //       Cookie.set("token", `${data.token}`, { expires: 1 })
  //       Cookie.set("user_data", `${JSON.stringify(data)}`, { expires: 1 })
  //     }
  //     router.push("/dashboard")
  //   },
  //   onError(error, variables, context) {
  //     alert(error.message)
  //   },
  // })

  const handleSubmit = async (values: LoginValues) => {
    setSubmitting(true);
    // login.mutate({ email: values.email, password: values.password })
    try {
      const res = await signIn("credentials", {
        email: values.email, password: values.password, redirect: false
      })
      console.log(res)

      if (res?.error) {
        alert("Invalid Credentials");
      } else {
        router.push("/beranda", { redirect: false })
      }
    } catch (error) {
      console.log("error:", error)
      return
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-md px-4 min-h-screen-vp">
      <h1 className="mb-8 text-2xl text-center text-gray-800">
        Enter your login details below...
      </h1>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email..."
                disabled={submitting}
                value={values.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password..."
                disabled={submitting}
                value={values.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="mb-4 w-full">
              Login
            </Button>
          </Form>
        )}
      </Formik>
      <Link href="/auth/signup">
        <p className="text-sm text-blue-400 underline">
          Don't have an account yet? Sign up
        </p>
      </Link>
    </div>
  );
};

export default Login;
