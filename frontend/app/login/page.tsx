"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import AuthContext from "@/context/AuthContext";
import { sendConfirmationEmail } from "@/services/Email";


interface Account {
  id: number;
  email: string;
  name: string;
  last_name: string;
  phone_number: string;
  date_joined: string;
  last_login: string;
  is_admin: boolean;
  is_active: boolean;
  is_email_verified: boolean;
  is_company_admin: boolean;
  is_password_changed: boolean;
}

const NextLoginPage = () => {
  const router = useRouter();
  const { loginUser, user, userInfo } = useContext(AuthContext);
  const [fetchedUserInfo, setFetchedUserInfo] = useState<Account | null>(null);


  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (): Promise<Account | null> => {
    try {
      const authTokens = localStorage.getItem('authTokens');
      if (!authTokens) throw new Error("Tokens are missing");

      let authTokensJson;
      try {
        authTokensJson = JSON.parse(authTokens);
      } catch {
        throw new Error("Tokens cannot be parsed");
      }

      if (!authTokensJson?.access) throw new Error("Access token is missing");

      const response = await fetch('http://localhost:8000/user/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Account = await response.json();
      console.log('Fetched user data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };


  useEffect(() => {
    if (fetchedUserInfo) {
      if (!fetchedUserInfo.is_email_verified) {
        router.push("/confirm");
      } else {
        router.push("/dashboard");
      }
    }
  }, [fetchedUserInfo, router]);


  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    if (!isValidEmail(email)) {
      setError("Email is invalid");
      toast.error("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      toast.error("Password is invalid");
      return;
    }

    const res = await loginUser({
      email,
      password,
    });

    if (!res?.success) {
      setError(res.detail);
      toast.error(res.detail);
    } else {
      setError("");
      toast.success("Successful login");

      const userData = await fetchUserData();

      if (!userData) {
        console.error('Failed to fetch user data.');
        return;
      }


      if (userData.is_company_admin) {
        if (userData.is_password_changed) {
          router.push("/company-admin-homepage");
        } else {
          router.push("/company-admin-password-change");
        }
      }
      else if (userData.is_admin) {
        if (!userData.is_email_verified) {
          router.push("/system-admin-password-change")
        }
        else {
          router.push("/admin-dashboard")
        }

      }
      else {
        if (!userData.is_email_verified) {
          sendConfirmationEmail();
          router.push("/confirm");
        }
        else {
          router.push("/equipment");
        }
      }
    }
  };

  return (
    true && (
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="flex justify-center flex-col items-center">
          <Image src="/logo 1.svg" alt="star logo" width={50} height={50} />
          <h2 className="mt-6 text-center text-2xl leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="px-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="px-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>



              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <Link
                    href="#"
                    className="text-black hover:text-gray-900"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full border border-black justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Sign in
                </button>
              </div>
            </form>

            <div>
              <p className="text-red-600 text-center text-[16px] my-4">
                {error && error}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default NextLoginPage;