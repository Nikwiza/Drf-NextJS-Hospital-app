'use client'
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import "@/styles/globals.css";

interface Equipment {
  id: number;
  equipment_name: string;
  description: string;
  picture_url: string;
}

const EquipmentList: React.FC = () => {
  const router = useRouter();
  const [ownedEquipmentList, setOwnedEquipmentList] = useState<Equipment[]>([]);
  const [unownedEquipmentList, setUnownedEquipmentList] = useState<Equipment[]>([]);
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Owned Equipment List:", ownedEquipmentList);
    console.log("Unowned Equipment List:", unownedEquipmentList);
  }, [ownedEquipmentList, unownedEquipmentList]);

  const fetchEquipmentList = async () => {
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
      const fetchedCompanyId = router.query.id as string;
      const allEquipmentResponse = await fetch(`http://localhost:8000/equipment/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        }
      });
      const ownedEquipmentResponse = await fetch(`http://localhost:8000/company/owned-equipment/${fetchedCompanyId}/` , {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        }
      });
      if (allEquipmentResponse.ok && ownedEquipmentResponse.ok) {
        const allEquipmentData: Equipment[] = await allEquipmentResponse.json();
        const ownedEquipmentData: Equipment[] = await ownedEquipmentResponse.json();
        setOwnedEquipmentList(ownedEquipmentData);
        setUnownedEquipmentList(allEquipmentData.filter(item => !ownedEquipmentData.some(ownedItem => ownedItem.id === item.id)));
      } else {
        console.error('Failed to fetch equipment list.');
      }
    } catch (error) {
      console.error('Error during fetch: ', error);
    }
  };

  useEffect(() => {
    if (router.query && router.query.id) {
      const fetchedCompanyId = router.query.id as string;
      setCompanyId(fetchedCompanyId);
      fetchEquipmentList();
    }
  }, [router.query]);

  const handleAddEquipment = async (equipmentId: number) => {
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
      const response = await fetch(`http://localhost:8000/company/add-equipment/${companyId}/${equipmentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('Equipment added successfully');
        fetchEquipmentList();
      } else {
        console.error('Failed to add equipment to the company');
      }
    } catch (error) {
      console.error('Error during fetch: ', error);
    }
  };

  const handleRemoveEquipment = async (equipmentId: number) => {
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
      const response = await fetch(`http://localhost:8000/company/remove-equipment/${companyId}/${equipmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('Equipment removed successfully');
        fetchEquipmentList();
      } else {
        console.error('Failed to remove equipment from the company');
      }
    } catch (error) {
      console.error('Error during fetch: ', error);
    }
  };

  const filteredOwnedEquipment = ownedEquipmentList.filter((equipment) =>
    equipment.equipment_name?.toLowerCase().includes(searchTerm1.toLowerCase())
  );

  const filteredUnownedEquipment = unownedEquipmentList.filter((equipment) =>
    equipment.equipment_name?.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  return (
    <div>
      {ownedEquipmentList.length === 0 && unownedEquipmentList.length === 0 && (
        <p className="text-black">Loading...</p>
      )}
      {(ownedEquipmentList.length > 0 || unownedEquipmentList.length > 0) && (
        <div className="w-max mx-auto bg-slate-700 p-8 border rounded-lg shadow-lg mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">Equipment List</h2>
          <div className="flex">
            <div className="flex-1 mr-24">
              <h3 className="text-lg font-bold mb-2 text-gray-300">Owned Equipment</h3>
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm1}
                onChange={(e) => setSearchTerm1(e.target.value)}
                className="mb-4 p-2 border rounded-md"
              />
              {filteredOwnedEquipment.map((equipment) => (
                <div
                  key={equipment.id}
                  className="w-64 h-auto border p-4 mb-4 bg-yellow-600 border-gray-300 rounded-md shadow-md"
                >
                  <h3 className="text-xl font-bold mb-2 text-white">{equipment.equipment_name}</h3>
                  <p className="text-white mb-2">Description: {equipment.description}</p>
                  <img src={equipment.picture_url} alt={equipment.equipment_name} className="w-full h-auto" />
                  <button
                    className="text-white bg-red-600 px-2 py-1 mt-2 rounded-md"
                    onClick={() => handleRemoveEquipment(equipment.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 text-gray-300">Unowned Equipment</h3>
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm2}
                onChange={(e) => setSearchTerm2(e.target.value)}
                className="mb-4 p-2 border rounded-md"
              />
              {filteredUnownedEquipment.map((equipment) => (
                <div
                  key={equipment.id}
                  className="w-64 h-auto border p-4 mb-4 bg-yellow-600 border-gray-300 rounded-md shadow-md"
                >
                  <h3 className="text-xl font-bold mb-2 text-white">{equipment.equipment_name}</h3>
                  <p className="text-white mb-2">Description: {equipment.description}</p>
                  <img src={equipment.picture_url} alt={equipment.equipment_name} className="w-full h-auto" />
                  <button
                    className="text-white bg-blue-600 px-2 py-1 mt-2 rounded-md"
                    onClick={() => handleAddEquipment(equipment.id)}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
