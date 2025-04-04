"use client";

import { z } from "zod";
import Link from "next/link";

import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/components/lib/actions/auth.action";
import FormField from "./FormField";
import { Sparkles } from "lucide-react";
import Image from "next/image";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const loadingToast = toast.loading(
      type === "sign-up" ? "Creating an account..." : "Signing in..."
    );

    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.dismiss(loadingToast);
          toast.error(result.message);
          return;
        }
        toast.dismiss(loadingToast);
        toast.success("Account created Successfully!");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.dismiss(loadingToast);
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });
        toast.dismiss(loadingToast);
        toast.success("Signed in Successfully!");
        router.push("/");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="flex flex-row w-full max-w-4xl border-2 border-y-white shadow-sm shadow-white/30 md:mx-4 rounded-lg ">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/3 relative">
        <Image
          src="/sidebar.jpg"
          alt="Sidebar Image" 
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Form Container */}
      <div className="w-full lg:w-2/3 flex flex-col justify-center p-10">
        <div className="flex flex-row gap-2 justify-center">
          <Sparkles height={38} width={38} />
          <h2 className="text-primary-100">AI Interviewer</h2>
        </div>

        <h3 className="flex justify-center items-center text-[20px] font-light italic">
          Practice job interviews with AI
        </h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center py-2">
          {isSignIn ? "New to here ?" : "Already a Member?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
