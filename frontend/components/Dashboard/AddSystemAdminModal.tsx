"use client";
import React from "react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { getAccessToken } from "@/services/Token";


interface ModalProps {
    onClose: () => void;
  }

const SystemAdminModal = ({onClose}:ModalProps) => {
    const [error, setError] = useState("")

    const isValidEmail = (email: string) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
      };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const email = e.target[0].value;
        const name = e.target[1].value;
        const last_name = e.target[2].value;
        const password = e.target[3].value;
        const confirmPassword = e.target[4].value;
    
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
    
        if (confirmPassword !== password) {
          setError("Passwords are not equal");
          toast.error("Passwords are not equal")
          return;
        }
    
        try {
          //TODO: Change the root of the backend later
          const res = await fetch("http://localhost:8000/account/register-admin", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name:name,
              email:email,
              password:password,
              last_name: last_name || "",
              phone_number:'000000000'
            }),
          });
          if (res.status === 400 || res.status === 422) {
            toast.error("This email is already registered")
            setError("The email already in use");
          }
          if (res.status === 200) {
            setError("");
            toast.success("A system admin has been registered");
            onClose()
          }
        } catch (error) {
          toast.error("Error, try again")
          setError("Error, try again");
          console.log(error);
        }
      };
    return (
        <div className=" z-50 absolute top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center">
            <div className="fixed bg-white p-10 rounded-md shadow-xl sm:w-[50%] w-[100%]">
                <div className="w-full flex justify-end">
                    <IoMdClose 
                        onClick={onClose}
                        className="cursor-pointer"/>
                </div>
            
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
                            className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        </div>
                    </div>

                    <div>
                        <label
                        htmlFor="name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                        >
                        First name
                        </label>
                        <div className="mt-2">
                        <input
                            id="name"
                            name="name"
                            required
                            className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        </div>
                    </div>

                    <div>
                        <label
                        htmlFor="last_name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                        >
                        Last name
                        </label>
                        <div className="mt-2">
                        <input
                            id="last_name"
                            name="last_name"
                            className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                            className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        </div>
                    </div>

                    <div>
                        <label
                        htmlFor="confirmpassword"
                        className="block text-sm font-medium leading-6 text-gray-900"
                        >
                        Confirm password
                        </label>
                        <div className="mt-2">
                        <input
                            id="confirmpassword"
                            name="confirmpassword"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">

                        </div>
                    </div>

                    <div>
                        <button
                        type="submit"
                        className="flex w-full border border-black justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                        Create
                        </button>
                        <p className="text-red-600 text-center text-[16px] my-4">
                        {error && error}
                        </p>
                    </div>
                    </form>
                </div>
        </div>
    );
    };

export default SystemAdminModal;