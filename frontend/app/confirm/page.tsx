"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Envalope from "@/resources/images/Dropped Image.png"
import { useContext } from "react";
import AuthContext from "@/context/AuthContext";
import Link from "next/link";
import { sendConfirmationEmail } from "@/services/Email";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";


const RegisterPage = () => {
    const [error, setError] = useState("");
    const router = useRouter();
    const { userInfo, user, logoutUser } = useContext(AuthContext)

    useEffect(() => {
        if (user == null) {
            router.replace("/register");
          }
        if (userInfo?.is_email_verified === true) {
          redirect('/dashboard')
        }
      }, [userInfo, router]);



    return (
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="flex justify-center flex-col items-center">
                <div className="mt-10 sm:mx-auto w-[90%] ">
                    <div className="bg-white px-6 py-14 shadow sm:rounded-lg sm:px-12 w-full flex justify-center flex-col items-center gap-y-4 ">
                        <Image
                            src={Envalope}
                            width={50}
                            height={50}
                            alt="Envalope"
                        />

                        <h3 className="text-center">
                            Please confirm your email adress
                        </h3>
                        <p className="text-sm w-[65%] text-center text-gray-600">
                            An email has been sent to {userInfo?.email} please click on the confirmation link provided
                        </p>
                        <div className="flex justify-center gap-x-3 mt-6">
                            <div className="text-sm leading-6">
                                <Link
                                    href="#"
                                    onClick={()=>{
                                        sendConfirmationEmail()
                                        toast.success("Email has been resent!")
                                    }} 
                                    className="text-black hover:text-gray-900"
                                >
                                    Resend
                                </Link>
                            </div>
                            <div className="text-sm leading-6">
                                <Link
                                    href="/login"
                                    className="text-black hover:text-gray-900"
                                    onClick={() =>{
                                        logoutUser()
                                        redirect('/login')}
                                    }
                                >
                                    Try again
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;