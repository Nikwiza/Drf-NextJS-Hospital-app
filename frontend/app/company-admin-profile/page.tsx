'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import "@/styles/globals.css";

interface CompanyAdministrator {
    id: number;
    company_name: string;
    company_id: number; 
    account: {
        name: string;
        email: string;
    }
}

const CompanyAdministratorProfile: React.FC = () => {
  const [admin, setAdmin] = useState<CompanyAdministrator | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter(); 

  useEffect(() => {
    const fetchAuthenticatedAdmin = async () => {
      try {
        const authTokens = localStorage.getItem('authTokens');
        if (!authTokens) {
          throw new Error("Tokens were not returned from backend!");
        }

        let authTokensJson;
        try {
          authTokensJson = JSON.parse(authTokens);
        } catch (error) {
          throw new Error("Tokens cannot be parsed");
        }
        if (!authTokensJson?.access) {
          throw new Error("Access token is missing");
        }

        const response = await fetch(
          `http://localhost:8000/account/authenticated-company-admin/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authTokensJson.access}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.status === 401) {
          setUnauthorized(true);
          return;
        }

        if (response.ok) {
          const data: CompanyAdministrator = await response.json();
          setAdmin(data);
        } else {
          console.error('Failed to fetch administrator');
        }
      } catch (error) {
        console.error('Error during fetch: ', error);
      }
    };

    fetchAuthenticatedAdmin();
  }, []);

  const handleViewCompanyProfile = () => {
    if (admin && admin.company_id) {
      router.push(`/company-profile/${admin.company_id}`); 
    }
  };


  if (unauthorized) {
    return <div>You are not authorized to view this profile.</div>;
  }

  if (!admin) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-slate-700 p-8 border rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-4 text-white">Administrator Profile</h1>
      <p className="mb-2 text-white">
        <span className="font-bold text-gray-300">Name:</span> {admin.account.name}
      </p>
      <p className="mb-2 text-white">
        <span className="font-bold text-gray-300">Email:</span> {admin.account.email}
      </p>
      <p className="mb-2 text-white flex items-center">
        <span className="font-bold text-gray-300">Company name:</span> {admin.company_name}
        <button
          onClick={handleViewCompanyProfile}
          className="ml-4 text-blue-500 underline"
        >
          View
        </button>
      </p>
      <div className="flex justify-between mt-8">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Edit Info
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default CompanyAdministratorProfile;
