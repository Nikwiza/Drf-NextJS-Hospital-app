"use client";
import React from "react";
import ChatCard from "./ChatCard";
import CompanyTable from "./CompanyTable";
import CompanyAdminTable from "./CompanyAdminTable"
import SystemAdminTable from "./SystemAdminTable";
import CompanyModal from "./AddCompanyModal";
import SystemAdminModal from "./AddSystemAdminModal";
import CompanyAdminModal from "./AddCompanyAdminModal";
import ComplaintModal from "./ComplaintsModal";
import League from "./League";
import { useState } from "react";




const AdminDashboard: React.FC = () => {

  interface ComplaintDTO {
    complaint_id:number;
    complaint:string;
    admin_anwser?:String;
  }
  const [companyModal, setCompanyModal] = useState(false);
  const [complaintModal, setComplaintModal] = useState<ComplaintDTO | null>(null);
  const [companyAdminModal, setCompanyAdminModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);

  return (
    <>
      {complaintModal && <ComplaintModal onClose={()=>setComplaintModal(null)} setComplaint={setComplaintModal} complaint={complaintModal}/>}
      {companyModal && <CompanyModal onClose={()=>setCompanyModal(false)}/>}
      {companyAdminModal && <CompanyAdminModal onClose={()=>setCompanyAdminModal(false)}/>}
      {adminModal && <SystemAdminModal onClose={()=>setAdminModal(false)}/>}
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5 md:px-10">

        <div className="col-span-12 sm:col-span-6">
          <CompanyTable openModal={()=>setCompanyModal(true)}/>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <ChatCard setComplaint={setComplaintModal} complaintModal={complaintModal}/>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <CompanyAdminTable openModal={()=>setCompanyAdminModal(true)}/>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <SystemAdminTable openModal={()=>setAdminModal(true)}/>
        </div>

        <div className="col-span-12">
          <League/>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;