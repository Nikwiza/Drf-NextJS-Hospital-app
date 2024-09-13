"use client";
import React from "react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { getAccessToken } from "@/services/Token";


interface ModalProps {
    onClose: () => void;
  }

const CompanyModal = ({onClose}:ModalProps) => {
    const [error, setError] = useState("")

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const company_name = e.target[0].value;
        const address = e.target[1].value;
        const description = e.target[2].value;
    

    
        try {
          //TODO: Change the root of the backend later
          const res = await fetch("http://localhost:8000/company", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                company_name:company_name,
                address:address,
                description:description,
            }),
          });
          if (res.status === 400 || res.status === 422) {
            toast.error("There has been a problem")
            setError("Problem while creating company");
          }
          if (res.status === 200) {
            setError("");
            toast.success("A company has been added");
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
            <div className=" fixed bg-white p-10 rounded-md shadow-xl sm:w-[50%] w-[100%]">
                <div className="w-full flex justify-end">
                    <IoMdClose 
                        onClick={onClose}
                        className="cursor-pointer"/>
                </div>
            
                <form className="space-y-6" onSubmit={()=>{}}>


                    <div>
                        <label
                        htmlFor="company_name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                        >
                        Company Name
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
                        htmlFor="adress"
                        className="block text-sm font-medium leading-6 text-gray-900"
                        >
                        Address
                        </label>
                        <div className="mt-2">
                        <input
                            id="address"
                            name="address"
                            type="text"
                            required
                            className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        </div>
                    </div>

                    <div>
                        <label
                        htmlFor="description"
                        className="block text-sm font-medium leading-6 text-gray-900"
                        >
                        Descriptoin
                        </label>
                        <div className="mt-2">
                        <input
                            id="description"
                            name="description"
                            type="text"
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

export default CompanyModal;