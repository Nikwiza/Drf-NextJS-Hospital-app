'use client'
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import "@/styles/globals.css";

interface CompanyEquipment {
  id: number;
  equipment: {
    equipment_name: string;
    description: string;
    picture_url: string;
  }
  quantity: Number;
}

interface Equipment{
    id: number;
    equipment_name: string;
    description: string;
    picture_url: string;
}

const EquipmentList: React.FC = () => {
  const router = useRouter();
  const [ownedEquipmentList, setOwnedEquipmentList] = useState<CompanyEquipment[]>([]);
  const [unownedEquipmentList, setUnownedEquipmentList] = useState<Equipment[]>([]);
  const [ownedQuantities, setOwnedQuantities] = useState<{ [key: number]: number }>({});
  const [unownedQuantities, setUnownedQuantities] = useState<{ [key: number]: number }>({});
  const [searchTerm1, setSearchTerm1] = useState('');
  const [searchTerm2, setSearchTerm2] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<string>('text-green-500');


  const displayMessage = (msg: string) => {
    setMessage(msg);
    setMessageColor('text-green-500');
    setTimeout(() => {
      setMessage(null);
    }, 2000);
  };


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
      const ownedEquipmentResponse = await fetch(`http://localhost:8000/company/owned-equipment/${fetchedCompanyId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        }
      });

      if (allEquipmentResponse.status === 401 || ownedEquipmentResponse.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (allEquipmentResponse.ok && ownedEquipmentResponse.ok) {
        const allEquipmentData: Equipment[] = await allEquipmentResponse.json();
        const ownedEquipmentData: CompanyEquipment[] = await ownedEquipmentResponse.json();
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
      const quantity = unownedQuantities[equipmentId] || 1;
      const response = await fetch(`http://localhost:8000/company/add-equipment/${companyId}/${equipmentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        console.log('Equipment added successfully');
        displayMessage('Equipment added successfully');
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
      const quantity = ownedQuantities[equipmentId] || 1; // Default to 1 if not set
      const response = await fetch(`http://localhost:8000/company/remove-equipment/${equipmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        console.log('Equipment removed successfully');
        displayMessage('Equipment removed successfully');
        fetchEquipmentList();
      } else {
        console.error('Failed to remove equipment from the company');
      }
    } catch (error) {
      console.error('Error during fetch: ', error);
    }
  };

  const handleQuantityChange = (id: number, quantity: number, isOwned: boolean) => {
    if (isOwned) {
      setOwnedQuantities(prev => ({ ...prev, [id]: quantity }));
    } else {
      setUnownedQuantities(prev => ({ ...prev, [id]: quantity }));
    }
  };

  const filteredOwnedEquipment = ownedEquipmentList.filter((equipment) =>
    equipment.equipment.equipment_name?.toLowerCase().includes(searchTerm1.toLowerCase())
  );

  const filteredUnownedEquipment = unownedEquipmentList.filter((equipment) =>
    equipment.equipment_name?.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  if (unauthorized) {
    return <div>You are not authorized to change company's equipment.</div>;
  }

  return (
    <div className="w-max mx-auto bg-slate-700 p-8 border rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">Equipment List</h2>
      <div className="flex gap-8">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2 text-gray-300">Owned Equipment</h3>
          <input
            type="text"
            placeholder="Search owned equipment..."
            value={searchTerm1}
            onChange={(e) => setSearchTerm1(e.target.value)}
            className="mb-4 p-2 border rounded-md"
          />
          {filteredOwnedEquipment.map((equipment) => (
            <div key={equipment.id} className="max-w-md h-auto border p-4 mb-4 bg-yellow-600 border-gray-300 rounded-md shadow-md flex flex-col items-center">
              <h3 className="text-xl font-bold mb-2 text-white">{equipment.equipment.equipment_name}</h3>
              <p className="text-white mb-2">Description: {equipment.equipment.description}</p>
              <img src={equipment.equipment.picture_url} alt={equipment.equipment.equipment_name} className="w-80 h-auto pb-2" />
              <div className="mb-2">
                <label className="text-white mr-2">Quantity:</label>
                <select
                  value={ownedQuantities[equipment.id] || 1}
                  onChange={(e) => handleQuantityChange(equipment.id, parseInt(e.target.value, 10), true)}
                  className="p-1 border rounded-md"
                >
                  {Array.from({length: parseInt(equipment.quantity.toString())}, (_, i) => i + 1).map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <button
                className="text-white bg-red-600 px-2 py-1 mt-2 rounded-md"
                onClick={() => handleRemoveEquipment(equipment.id)} //ovde pravi problem
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Unowned Equipment Column */}
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2 text-gray-300">Unowned Equipment</h3>
          <input
            type="text"
            placeholder="Search unowned equipment..."
            value={searchTerm2}
            onChange={(e) => setSearchTerm2(e.target.value)}
            className="mb-4 p-2 border rounded-md"
          />
          {filteredUnownedEquipment.map((equipment) => (
            <div key={equipment.id} className=" h-auto border p-4 mb-4 bg-green-600 border-gray-300 rounded-md shadow-md flex flex-col items-center">
              <h3 className="text-xl font-bold mb-2 text-white">{equipment.equipment_name}</h3>
              <p className="text-white mb-2">Description: {equipment.description}</p>
              <img src={equipment.picture_url} alt={equipment.equipment_name} className="w-80 h-auto pb-2" />
              <div className="mb-2">
                <label className="text-white mr-2">Quantity:</label>
                <select
                  value={unownedQuantities[equipment.id] || 1}
                  onChange={(e) => handleQuantityChange(equipment.id, parseInt(e.target.value, 10), false)}
                  className="p-1 border rounded-md"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <button
                className="text-white bg-green-600 px-2 py-1 mt-2 rounded-md"
                onClick={() => handleAddEquipment(equipment.id)}
              >
                Add
              </button>
            </div>
          ))}
          {message && (
            <div className={`mb-4 ${messageColor} text-center font-bold`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentList;
