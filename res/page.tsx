'use client'
import React, { useState } from 'react';
import Image from "next/image";
import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
// import { Label } from "@nextui-org/label";
// import { Logo } from "@/components/svg/logo";
// import { Icons } from "@nextui-org/icons";
import { signIn, useSession } from "next-auth/react";
// import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [pending, setPending] = useState(false);
  // const { status } = useSession();
  // const router = useRouter();
  const formSubmitted = async (event) => {
    event.preventDefault();
    setPending(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      if (res?.error ) {
        console.log('res error :::: ',res)
        setErrorMessage(res.error);
        setPending(false);
      } else {
        setPending(false);
        // Handle successful login here (e.g., redirect or store user data)
        router.push("/dashboard");
  
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred during login");
      setPending(false);
    }
  };


  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12 bg-secondary-600">
        <div className="mx-auto grid max-w-6xl gap-12">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Inatale Admin Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your official username below to login to your account
            </p>
          </div>
          <form onSubmit={formSubmitted} className="grid gap-4">
            <div className="grid gap-2">
              <p>Username</p>
              <Input
                id="username"
                type="text"
                placeholder="user"
                required
                className="bg-secondary-100 border-secondary-900"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <p>Password</p>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                required
                className="bg-secondary-100 border-secondary-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <LoginButton pending={pending} />
            <div
              className="flex h-8 items-end space-x-1"
              aria-live="polite"
              aria-atomic="true"
            >
              {errorMessage && (
                <>
                  {/* <Icons.bookmark className="h-5 w-5 text-red-500" /> */}
                  <p className="text-sm text-red-500">{errorMessage}</p>
                </>
              )}
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Forgot Password?{" "}
            <Link href="#" className="underline">
              Contact Admin
            </Link>
          </div>
        </div>
      </div>
      <div
        className=" bg-primary-600 flex flex-1 items-center justify-center"
      >
        <div className="flex flex-col items-center text-center">
          {/* <Logo.svg className=" lg:w-96" fill="#e6e6dd" /> */}
          <Link href="#" className="mt-4 text-muted-foreground underline">
            Go to Website
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginButton({ pending }) {
  return (
    <Button className="mt-4 w-full bg-primary-600 text-secondary-50" aria-disabled={pending}>
      Log in {/* Log in <Icons.chevronRight className="ml-auto h-5 w-5 text-gray-50" /> */}
    </Button>
  );
}

export default Login;