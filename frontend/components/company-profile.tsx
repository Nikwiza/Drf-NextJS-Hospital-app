'use client';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import "@/styles/globals.css";
import CompanyEquip from './company-equipment';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { LatLngTuple } from 'leaflet';
import iconMarker from 'leaflet/dist/images/marker-icon.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface CompanyEquipment {
  id: number;
  equipment: {
    equipment_name: string;
    description: string;
    picture_url: string;
  }
  quantity: number;
}

interface PickupSlot {
  id: number;
  date: string;
  time: string;
  duration: string;
  administrator: CompanyAdministrator;
}

interface Account {
  id: string;
  name: string;
  email:string;
}

interface CompanyAdministrator {
  id: number;
  account: Account;
}

interface BusinessHours {
  [key: string]: {
    start: string;
    end: string;
  } | null;
}

interface Company {
  id: number;
  company_name: string;
  address: string;
  description: string;
  average_rating: number;
  latitude: number;
  longitude: number;
  equipment: CompanyEquipment[];
  pickup_slots: PickupSlot[];
  administrators: CompanyAdministrator[];
  business_hours: BusinessHours;
}

const CompanyProfile: React.FC = () => {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [position, setPosition] = useState<LatLngTuple | null>(null);
  const [L, setL] = useState<any>(null);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [showPickupSlotForm, setShowPickupSlotForm] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [pickupDuration, setPickupDuration] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState<string>('text-green-500');

  const displayMessage = (msg: string, color: string) => {
    setMessage(msg);
    setMessageColor(color);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleCreatePickupSlot = () => {
    setShowPickupSlotForm(true);
  };

  const isValidBusinessHours = (date: string, time: string, duration: number): boolean => {
    if (!company) return false;

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const businessHours = company.business_hours[dayOfWeek];

    if (!businessHours) return false;

    const [startHour, startMinute] = businessHours.start.split(':').map(Number);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);
    const [inputHour, inputMinute] = time.split(':').map(Number);

    const businessStart = new Date();
    businessStart.setHours(startHour, startMinute, 0);

    const businessEnd = new Date();
    businessEnd.setHours(endHour, endMinute, 0);

    const slotStart = new Date();
    slotStart.setHours(inputHour, inputMinute, 0);

    const slotEnd = new Date(slotStart.getTime() + duration  * 1000);
    return (
      slotStart >= businessStart &&
      slotEnd <= businessEnd &&
      slotStart <= slotEnd
    );  
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseFloat(e.target.value);
    if (!isNaN(minutes)) {
      const durationInSeconds = minutes * 60;
      setPickupDuration(durationInSeconds);
    } else {
      setPickupDuration(0);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidBusinessHours(pickupDate, pickupTime, pickupDuration)) {
      displayMessage('Selected slot is outside of business hours.', 'text-red-500');
      return;
    }

    try {
        const authTokens = localStorage.getItem('authTokens');
        if (!authTokens) throw new Error("Tokens were not returned from backend!");

        let authTokensJson;
        try {
            authTokensJson = JSON.parse(authTokens);
        } catch {
            throw new Error("Tokens cannot be parsed");
        }

        if (!authTokensJson?.access) throw new Error("Access token is missing");

        const response = await fetch(`http://localhost:8000/company/pickup-slots/create/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authTokensJson.access}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                administrator: selectedAdmin,
                date: pickupDate,
                time: pickupTime,
                duration: pickupDuration,
            })
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 400 && errorData[0] === "Administrator is already assigned to another pickup slot during this time.") {
            displayMessage('Administrator is already assigned to another pickup slot during this time.', 'text-red-500');
          } else {
            console.log('Failed to create pickup slot. Please try again.', 'text-red-500');
          }
          return;
        }

        const newPickupSlot = await response.json();
        setCompany(prevCompany => {
            if (!prevCompany) return prevCompany;
            return {
                ...prevCompany,
                pickup_slots: [...prevCompany.pickup_slots, newPickupSlot]
            };
        });
        displayMessage('Pickup slot created successfully!', 'text-green-500');
        setTimeout(() => {
          setShowPickupSlotForm(false);
        }, 3000);
    } catch (error) {
        console.error('Error during fetch:', error);
    }
  };


  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import('leaflet');
      setL(leaflet.default || leaflet);
    };
    loadLeaflet();
  }, []);

  useEffect(() => {
    const companyId = router.query.id;
    if (!companyId) return;

    const fetchCompanyData = async () => {
      try {
        const authTokens = localStorage.getItem('authTokens');
        if (!authTokens) throw new Error("Tokens were not returned from backend!");

        let authTokensJson;
        try {
          authTokensJson = JSON.parse(authTokens);
        } catch {
          throw new Error("Tokens cannot be parsed");
        }

        if (!authTokensJson?.access) throw new Error("Access token is missing");

        const [companyResponse, userResponse] = await Promise.all([
          fetch(`http://localhost:8000/company/profile/${companyId}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authTokensJson.access}`,
              'Content-Type': 'application/json',
            }
          }),
          fetch(`http://localhost:8000/user/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authTokensJson.access}`,
              'Content-Type': 'application/json',
            }
          })
        ]);

        if (companyResponse.status === 401) {
          setUnauthorized(true);
          return;
        }

        if (companyResponse.ok && userResponse.ok) {
          const companyData: Company = await companyResponse.json();
          const currentUserData: Account = await userResponse.json();

          setCompany(companyData);
          setPosition([companyData.latitude, companyData.longitude]);

          const isAdmin = companyData.administrators.some(
            (admin) => admin.account.id === currentUserData.id
          );
          setIsCompanyAdmin(isAdmin);
          
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error during fetch:', error);
      }
    };

    fetchCompanyData();
  }, [router.query.id]);

  if (unauthorized) {
    return <div>You are not authorized to view this company profile.</div>;
  }

  if (!company) {
    return <div>Loading company profile...</div>;
  }

  const icon = L?.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    iconShadow: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -32],
  });

  return (
    <div className="w-full mx-auto p-8 mt-8 bg-slate-800 border rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-white text-center">{company.company_name}</h1>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="mb-4 text-white">
            <span className="font-bold text-gray-300">Address:</span> {company.address}
          </p>
          <p className="mb-4 text-white">
            <span className="font-bold text-gray-300">Description:</span> {company.description}
          </p>
          <p className="mb-4 text-white">
            <span className="font-bold text-gray-300">Average rating:</span> {company.average_rating}
          </p>
          <div className="mb-6">
            {position && (
              <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: "400px", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={icon}>
                  <Popup>
                    {company.company_name} <br /> {company.address}
                  </Popup>
                </Marker>
              </MapContainer>
            )}
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Available Pickup Slots</h2>
            {company.pickup_slots && company.pickup_slots.length > 0 ? (
              <ul className="list-disc list-inside text-white">
                {company.pickup_slots.map((slot) => (
                  <li key={slot.id}>
                    {slot.date} at {slot.time} for {slot.duration} - {slot.administrator?.account?.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white">No available pickup slots.</p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Company Administrators</h2>
            {company.administrators.length > 0 ? (
              company.administrators.map((admin) => (
                <div key={admin.id} className="mb-2 text-white">
                  <p><strong>Name:</strong> {admin.account.name}</p>
                  <p><strong>Email:</strong> {admin.account.email}</p>
                </div>
              ))
            ) : (
              <p className="text-white">No administrators found.</p>
            )}
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Business Hours</h2>
            <ul>
              {Object.entries(company.business_hours).map(([day, hours]) => (
                <li key={day} className="text-white mb-2">
                  {day}: {hours ? `${hours.start} - ${hours.end}` : 'Closed'}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <button 
              onClick={() => router.push(`/company-equipment/${company.id}`)} 
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
              Update Company Equipment
            </button>
          </div>
          <div className='mb-4'>
            <button
            onClick={() => router.push(`/update-company/${company.id}`)}
            className='bg-blue-500 text-white font-bold py-2 px-4 rounded'>
              Edit Company Info
            </button>
          </div>
          <div className='mb-8'>
            {isCompanyAdmin && (
            <button onClick={handleCreatePickupSlot}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
              Create Pickup Slot
            </button>
            )}
          </div>
          {showPickupSlotForm && (
            <form onSubmit={handleFormSubmit} className="mb-8">
              <div className="mb-4">
                <label className="block text-white mb-2">Administrator</label>
                <select
                  value={selectedAdmin || ''}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select an administrator</option>
                  {company.administrators.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Duration (in minutes)</label>
                <input
                  type="number"
                  value={pickupDuration ? pickupDuration / 60 : ''}               
                  onChange={handleDurationChange}
                  required
                  placeholder='e.g., 30 (minutes)'
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              {message && (
                <p className={`mb-4 ${messageColor}`}>{message}</p>
              )}
              <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded">
                Create Pickup Slot
              </button>
            </form>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-300">Equipment List</h2>
          {company.equipment && company.equipment.length > 0 ? (
            company.equipment.map((equipment) => (
              <CompanyEquip key={equipment.id} equipment={equipment} />
            ))
          ) : (
            <p className="text-white">No elements available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
