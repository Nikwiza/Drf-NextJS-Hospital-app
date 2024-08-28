'use client'
import CompanyProfile from "@/components/company-profile";
import Navbar from "@/app/Navbar";
import "@/styles/globals.css";

const CompanyProfilePage = () => {
    return(
        <div className="container mx-auto mt-8">
            <CompanyProfile/>
        </div>
    );
};

export default CompanyProfilePage;