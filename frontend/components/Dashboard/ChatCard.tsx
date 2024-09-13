import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/services/Token";

const formatDateTime = (date:Date) => {
  return moment(date).format('YYYY-MM-DD HH:mm');
};

type Complaint = {
    id: number;
    comments:string;
    user_name: string;
    user_email: string;
    user_id: string;
    commented_at: Date;
    admin_answer?: string;
  };

interface ComplaintDTO {
    complaint_id:number;
    complaint:string;
    admin_anwser?:String;
  }

  interface ModalProps {
    setComplaint: React.Dispatch<React.SetStateAction<ComplaintDTO | null>>;
    complaintModal: ComplaintDTO | null
  }

const ChatCard = ({setComplaint, complaintModal}:ModalProps) => {
  const [complaintList, setComplaintList] = useState<Complaint[]>([])
  useEffect(() => {

    fetch('http://localhost:8000/complaints/', 
      {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json',
        },
    }
    )
    .then((response) => {
      if (!response.ok) {
        console.error(`Error: ${response.status} ${response.statusText}`);
        return null; 
      }
      return response.json(); // Continue if response is OK
    })
      .then((data: Complaint[]) =>
        setComplaintList(data)
      );
  }, [complaintModal]);

  const handleComplaintClick = (id:number, comment:string) =>{
    setComplaint({
      complaint_id:id,
      complaint:comment,
      admin_anwser:""
    })
  }
  
  return (
    <div className="rounded-[10px] bg-white py-6 shadow-md ">
      <h4 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark text-center">
        Complaints
      </h4>

      <div className="max-h-[300px] h-[300px] overflow-y-auto text-sm">
        {complaintList && complaintList.map((chat, key) => (
          <div
            className="cursor-pointer flex items-center gap-4.5 px-7.5 py-3 hover:bg-gray-1 dark:hover:bg-dark-2"
            key={key}
            onClick={()=>handleComplaintClick(chat.id, chat.comments)}
          >


            <div className="px-2 flex flex-1 items-center justify-between">
              <div>
                <h5 className="font-medium text-lg font-sans">
                  {chat.user_name}
                </h5>
                <p className="flex flex-col">
                  <span
                    className={"mb-px text-body-sm font-medium dark:text-dark-3 break-words max-w-[100%] overflow-x break-all whitespace-normal"}
                  >
                    {chat.comments}
                  </span>
                  <span className="text-xs"> {formatDateTime(chat.commented_at)}</span>
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatCard;