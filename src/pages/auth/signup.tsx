import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { supabase } from "@/servers/supabase/supabaseClient";
import { Button } from "@/components/ui/button";
import { PrismaClient } from "@prisma/client";
import { api } from "@/lib/api";

const prisma = new PrismaClient();
interface SignUpValues {
  email: string;
  password: string;
  fullname: string;
}

const initialValues: SignUpValues = {
  email: "",
  password: "",
  fullname: "",
};

const SignUp = () => {
  const router = useRouter()

  const createUsers = api.user.createUser.useMutation({
    onSettled(data, error, variables, context) {
      if (!error) {
        router.push("/auth/login");
      }
    },
    onError(error, variables, context) {
      alert(error.message)
    },
  })

  const handleSubmit = async (values: SignUpValues, { setSubmitting, setErrors }: any) => {
    try {
      createUsers.mutate({
        name: values.fullname,
        password: values.password,
        email: values.email
      })
    } catch (error: any) {
      setErrors({ email: error.message });
      setSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-md min-h-screen px-4 py-8">
      <h1 className="mb-6 text-2xl text-center text-gray-800">
        Sign up by entering your details below...
      </h1>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="flex flex-col items-center w-full">
            <Field
              name="email"
              type="email"
              placeholder="Enter your email..."
              className="mb-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            />
            <Field
              name="fullname"
              type="text"
              placeholder="Enter your full name..."
              className="mb-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            />
            <Field
              name="password"
              type="password"
              placeholder="Create a password..."
              className="mb-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting} className="mb-4">
              Sign up
            </Button>
          </Form>
        )}
      </Formik>
      <Link href="/auth/login">
        <p className="text-sm text-blue-400 underline">
          Already have an account? Go to login
        </p>
      </Link>
    </div>
  );
};

export default SignUp;
