'use client'
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import "@/styles/globals.css";
import CompanyEquipment from './company-equipment';

interface Equipment {
  id: number;
  name: string;
  description: string;
  picture_url: string;
}

interface Company {
  name: string;
  address: string;
  description: string;
  average_rating: number;
  equipment: Equipment[];
}

const CompanyProfile: React.FC = () => {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (router.query && router.query.id) {
      const companyId = router.query.id;
      const fetchCompany = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/company/profile/${companyId}/`
          );
          if (response.ok) {
            const data: Company = await response.json();
            setCompany(data);
          } else {
            console.error('Failed to fetch company');
          }
        } catch (error) {
          console.error('Error during fetch: ', error);
        }
      };

      fetchCompany();
    }
  }, [router.query]);

  if (!company) {
    return <div>Loading company profile...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-slate-700 p-8 border rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-4 text-white">{company.name}</h1>
      <p className="mb-2 text-white">
        <span className="font-bold text-gray-300">Address:</span>{' '}
        {company.address}
      </p>
      <p className="mb-2 text-white">
        <span className="font-bold text-gray-300">Description:</span>{' '}
        {company.description}
      </p>
      <p className="mb-2 text-white">
        <span className="font-bold text-gray-300">Average rating:</span>{' '}
        {company.average_rating}
      </p>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-300">Equipment List</h2>
        {company.equipment.length > 0 ? (
          company.equipment.map((equipment) => (
            <CompanyEquipment key={equipment.id} equipment={equipment} />
          ))
        ) : (
          <p className="text-white">No elements available.</p>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;
