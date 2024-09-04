'use client';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import "@/styles/globals.css";

interface User{
    id: number;
    name: string;
    email: string;
}

interface PickupSlot {
  id: number;
  date: string;
  time: string;
  duration: number;
  reserved_by: User;
}

const ReservedPickupSlotsPage: React.FC = () => {
  const [activePickupSlots, setActivePickupSlots] = useState<PickupSlot[]>([]);
  const [inactivePickupSlots, setInactivePickupSlots] = useState<PickupSlot[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchReservedPickupSlots = async () => {
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

      const response = await fetch('http://localhost:8000/company/pickup-slots/reserved/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (response.ok) {
        const slots: PickupSlot[] = await response.json();
        const now = new Date();
        
        const activeSlots = slots.filter(slot => {
          const [slotHour, slotMinute] = slot.time.split(':').map(Number);
          const slotStartTime = new Date(slot.date);
          slotStartTime.setHours(slotHour, slotMinute, 0);
          
          const slotEndTime = new Date(slotStartTime.getTime() + slot.duration * 1000);
          return now >= slotStartTime && now <= slotEndTime;
        });

        const inactiveSlots = slots.filter(slot => !activeSlots.includes(slot));

        setActivePickupSlots(activeSlots);
        setInactivePickupSlots(inactiveSlots);
      } else {
        console.error('Failed to fetch reserved pickup slots');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  useEffect(() => {
    fetchReservedPickupSlots();
  }, []);

  if (unauthorized) {
    return <div>You are not authorized to view reserved pickup slots.</div>;
  }

  return (
    <div className="w-full mx-auto bg-slate-700 p-8 border rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">Reserved Pickup Slots</h2>
      
      <div className="flex flex-wrap justify-between">
        <div className="w-full md:w-1/2 pr-2">
          <h3 className="text-lg font-bold mb-2 text-gray-300">Active Pickup Slots</h3>
          <ul>
            {activePickupSlots.length === 0 && (
              <p className='text-white text-small font-bold'>No active pickup slots.</p>
            )}
            {activePickupSlots.map(slot => (
              <li key={slot.id} className="max-w-md h-auto border p-4 mb-4 bg-green-600 border-gray-300 rounded-md shadow-md">
                <p className="text-white">Date: {slot.date}</p>
                <p className="text-white">Time: {slot.time}</p>
                <p className="text-white">Duration: {slot.duration}</p>
                <p className='text-white'>Reserved by: {slot.reserved_by.name}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-1/2 pl-2">
          <h3 className="text-lg font-bold mb-2 text-gray-300">Inactive Pickup Slots</h3>
          <ul>
            {inactivePickupSlots.map(slot => (
              <li key={slot.id} className="max-w-md h-auto border p-4 mb-4 bg-yellow-600 border-gray-300 rounded-md shadow-md">
                <p className="text-white">Date: {slot.date}</p>
                <p className="text-white">Time: {slot.time}</p>
                <p className="text-white">Duration: {slot.duration}</p>
                <p className='text-white'>Reserved by: {slot.reserved_by.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReservedPickupSlotsPage;
