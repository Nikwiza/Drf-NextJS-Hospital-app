"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { getAccessToken } from "@/services/Token";
import { Textarea } from "@nextui-org/input";


interface ComplaintDTO {
    complaint_id:number;
    complaint:string;
    admin_anwser?:String;
  }

interface ModalProps {
    onClose: () => void;
    setComplaint: React.Dispatch<React.SetStateAction<ComplaintDTO | null>>;
    complaint: ComplaintDTO | null;
  }


const ComplaintModal = ({onClose, setComplaint, complaint}:ModalProps) => {

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try {
          //TODO: Change the root of the backend later
          const res = await fetch("http://localhost:8000/complaints/answer/", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                complaint_id:complaint?.complaint_id,
                admin_answer:complaint?.admin_anwser,
            }),
          });
          if (res.status === 400 || res.status === 422) {
            toast.error("There has been a problem")
          }
          if (res.status === 200) {
            toast.success("Complaint answered!");
            onClose()
          }
        } catch (error) {
          console.log(error);
        }
      };

      const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAnswer = event.target.value;
    
        // Update the admin_anwser in the state
        setComplaint((prevComplaint) => {
          if (prevComplaint) {
            return {
              ...prevComplaint, // Keep all other properties the same
              admin_anwser: newAnswer, // Update the admin_anwser
            };
          }
          return prevComplaint; // Return the previous state if null
        });
      };

    return (
        <div className=" z-50 absolute top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center">
            <div className=" fixed bg-white p-10 rounded-md shadow-xl sm:w-[50%] w-[100%]">
                <div className="w-full flex justify-end">
                    <IoMdClose 
                        onClick={onClose}
                        className="cursor-pointer"/>
                </div>
            
                <form className="space-y-6" onSubmit={handleSubmit}>

                    <div className="flex flex-col">
                    Answer the complaint
                    <p className="text-sm inline-block p-2 text-white font-bold bg-blue-400 w-[80%] rounded-md m-6">
                        {complaint?.complaint}
                    </p>
                    </div>
                    
                    <Textarea
                        placeholder="Answer the complaint"
                        value={complaint!.admin_anwser as string || ""} 
                        onChange={handleTextChange} 
                        fullWidth 
                        minRows={3}  
/>
                    <div>
                        <button
                        type="submit"
                        className="flex w-full border border-black justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                        Answer
                        </button>
                    </div>
                    </form>
                </div>
        </div>
    );
    };

export default ComplaintModal;