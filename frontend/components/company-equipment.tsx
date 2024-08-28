'use client'
import React from 'react';

interface Equipment {
  id: number;
  equipment_name: string;
  description: string;
  picture_url: string;
}

interface CompanyEquipmentProps {
  equipment: Equipment;
}

const CompanyEquipment: React.FC<CompanyEquipmentProps> = ({ equipment }) => {
  console.log('Equipment: ', equipment);

  return (
    <div className="border p-4 mb-4 bg-yellow-600 border-gray-300 rounded-md shadow-md">
      <h3 className="text-xl font-bold mb-2 text-white">{equipment.equipment_name}</h3>
      <p className="text-white mb-2">Description: {equipment.description}</p>
      <img src={equipment.picture_url} alt={equipment.equipment_name} className="w-full h-auto" />
    </div>
  );
};

export default CompanyEquipment;
