import Image from "next/image";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/services/Token";
import { IoMdAddCircle } from "react-icons/io";


type Company = {
    company_name: string;
    address: string;
    average_rating: number;
  };

  interface Props {
    openModal: () => void;
  }

const CompanyTable = ({openModal}:Props) => {
  const [companies, setCompanies] = useState<Company[]>([])
  useEffect(() => {
    fetch('http://localhost:8000/company/', 
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
      .then((data: Company[]) =>
        setCompanies(data)
      );
  }, [openModal]);

  return (
    <div className="rounded-[10px] bg-white px-7.5  pt-7.5 shadow-1 shadow-md pt-5 w-full ">
      <div className="relative flex w-full justify-center">
        <h4 className="mb-8 text-center font-bold text-dark ">
          Companies
        </h4>
        <IoMdAddCircle
          className="absolute right-5 cursor-pointer"
          onClick={openModal}
        />
      </div>

      <div className="flex flex-col max-h-[300px] h-[300px] overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-3">
          <div className="px-2 pb-3.5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Name
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Address
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Rating
            </h5>
          </div>
          
        </div>
        <div className="text-sm">
        {companies && companies.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-3 ${
              key === companies.length - 1
                ? ""
                : "border-b border-stroke dark:border-dark-3"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3.5 px-2 py-4">

              <p className="font-medium text-dark dark:text-white sm:block">
                {brand.company_name}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {brand.address}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-green-light-1">
                {brand.average_rating}
              </p>
            </div>

          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyTable;