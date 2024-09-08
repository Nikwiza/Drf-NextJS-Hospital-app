'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import "@/styles/globals.css";

interface CompanyAdministrator {
    id: number;
    company_name: string;
    company_id: number; 
    account: {
        first_name: string;
        last_name: string;
        phone_number: string;
        email: string;
    }
}
const CompanyAdminHomePage: React.FC = () => {

    const navigateTo = (path: string) => {
        router.push(path);
    };

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

    return (
        <div className="w-full mx-auto p-8 mt-8 bg-slate-800 border rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-6 text-white text-center">Company Administrator Home Page</h1>
            <ul className='text-center'>
                <li>
                <button 
                    onClick={() => navigateTo('/admin/reservations')} 
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4">
                    List of Registered Users with Reservations
                </button>
                </li>
                <li>
                <button 
                    onClick={() => navigateTo('/reserved-pickup-slots')}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4">
                    Enter Equipment Pickup Information
                </button>
                </li>
                <li>
                <button 
                    onClick={() => navigateTo('/admin/work-calendar')}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4">
                    Work Calendar
                </button>
                </li>
                <li>
                <button 
                    onClick={handleViewCompanyProfile}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4">
                    Company Profile
                </button>
                </li>
                <li>
                <button 
                    onClick={() => navigateTo('/company-admin-profile')}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded mt-4">
                    Administrator Profile
                </button>
                </li>
            </ul>
        </div>
    );
};

export default CompanyAdminHomePage;
