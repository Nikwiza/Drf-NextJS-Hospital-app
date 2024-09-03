'use client'
import React from 'react';

interface CompanyEquipment {
  id: number;
  equipment: {
    equipment_name: string;
    description: string;
    picture_url: string;
  }
  quantity: Number;
}

interface CompanyEquipmentProps {
  equipment: CompanyEquipment
}

const CompanyEquip: React.FC<CompanyEquipmentProps> = ({ equipment } : CompanyEquipmentProps) => {
  return (
    <div className="border p-4 mb-4 bg-yellow-600 border-gray-300 rounded-md shadow-md flex flex-col items-center">
      <h3 className="text-xl font-bold mb-2 text-white">{equipment.equipment.equipment_name}</h3>
      <p className="text-white mb-2 w-80">Description: {equipment.equipment.description}</p>
      <img src={equipment.equipment.picture_url} alt={equipment.equipment.equipment_name} className="w-80 h-auto" />
      <p className="text-white mb-2">Quantity: {equipment.quantity.toString()}</p>
    </div>
  );
};

export default CompanyEquip;
