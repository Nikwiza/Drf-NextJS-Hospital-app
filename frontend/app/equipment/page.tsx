'use client'

import React, { useReducer, useEffect, useCallback, useMemo, ChangeEvent, useState } from 'react';
import { getAccessToken } from '@/services/Token';
import { IoFilter } from "react-icons/io5";
import { Button } from '@nextui-org/button';
import { useRouter } from 'next/navigation';

interface SimpleCompany {
  company:{
    id: number;
    company_name:string
  }
  quantity:number;
}

interface Equipment {
  id: number;
  equipment_name: string;
  equipment_type: string;
  description: string;
  picture_url: string;
  price: number;
  companies:SimpleCompany[]
}

enum EquipmentType {
  Any = 'Any',
  Imaging = 'Imaging',
  Emergency = 'Emergency',
  Respiratory = 'Respiratory',
  Utility = 'Utility'
}


interface Filter {
  top_price: number | null;
  bot_price: number | null;
  type: EquipmentType
}

interface State {
  equipment: Equipment[];
  search: string;
  filter:Filter
}

interface Action {
  type: string;
  payload: any;
}

export default function Equipment() {
  const router = useRouter()

  const [filterMenu, setFilterMenu] = useState(false)
  
  const [{ equipment, search, filter }, dispatch] = useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case 'setEquipment':
          return { ...state, equipment: action.payload };
        case 'setSearch':
          return { ...state, search: action.payload };
        case 'setFilter':
          return {...state, filter: action.payload}
        default:
          return state;
      }
    },
    {
      equipment: [],
      search: '',
      filter: {
        top_price:null,
        bot_price:null,
        type:EquipmentType.Any
      }
    }
  );

  // Fetch equipment
  useEffect(() => {


    fetch('http://localhost:8000/equipment/equipment-with-companies/', 
      {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getAccessToken()}`,
            'Content-Type': 'application/json',
        },
    }
    )
      .then((response) => response.json())
      .then((data: Equipment[]) =>
        dispatch({
          type: 'setEquipment',
          payload: data,
        })
      );
  }, []);

  // Filter and search handlers
  const setFilter = useCallback((filterUpdates: Partial<Filter>) => {
    dispatch({
      type: 'setFilter',
      payload: { ...filter, ...filterUpdates },
    });
  }, [filter]);
  
  const setSearch = useCallback((search: string) => {
    dispatch({
      type: 'setSearch',
      payload: search,
    });
  }, []);

  const toggleFilter = () =>{
    setFilterMenu((prev) => !prev);
  }

  const handleClickCompany = (id:number) => {
    //TODO: make it be ordarable
    router.push(`/company/${id}`);
  }

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq: Equipment) => {
      const matchesSearch = eq.equipment_name.toLowerCase().includes(search.toLowerCase());
      const matchesType = filter.type === EquipmentType.Any || eq.equipment_type === filter.type;
      const matchesPrice =
        (filter.bot_price === null || eq.price >= filter.bot_price) &&
        (filter.top_price === null || eq.price <= filter.top_price);

        console.log((eq.price >= filter.bot_price))

      return matchesSearch && matchesPrice && matchesType;
    });
  }, [equipment, search, filter]);


  const EquipmentList: React.FC = () => {
    return (
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-3">
        {filteredEquipment.map((eq : Equipment) => (
          <li
            key={eq.id}
            className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200"
          >
            <div className="flex-1 flex flex-col p-8">
              <img
                className="w-32 h-32 flex-shrink-0 mx-auto bg-black rounded-full"
                src={eq.picture_url}
                alt=""
              />
              <h3 className="mt-6 text-gray-900 text-sm font-medium text-left p-2 font-mono">
                <p className=''><b>Name: </b>{eq.equipment_name}</p>
                <p><b>Type: </b>{eq.equipment_type}</p>
                <p><b>Price: </b>{eq.price}$</p>
                <p className=''><b>Description: </b>{eq.description}</p>
                <ul className='mt-3 flex gap-2 flex-wrap'>
                {eq.companies.map((com : SimpleCompany) =>(
                  <li key={com.company.id}>
                  <Button 
                  className='text-xs'
                  onClick={() => handleClickCompany(com.company.id)}
                  >
                      {com.company.company_name}
                  </Button>
                  </li>
                ))}
                </ul>
              </h3>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className=''>
      <div className='flex items-center'>
      <input
        className="mt-3 block w-[90%] rounded-md border border-gray-300 shadow-sm focus:border-indigo-800 focus:ring-indigo-800 sm:text-lg p-2"
        placeholder="Search"
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />
      <IoFilter 
        className='mt-1 ml-5 cursor-pointer'
        onClick={toggleFilter}/>
      </div>
      {filterMenu && (<div className='flex gap-x-20 justify-center p-4'>
        <select name="type" 
          className='text-sm p-1'
          value={filter.type}
          onChange={(e) => setFilter({ type: e.target.value as EquipmentType })}>
          {Object.values(EquipmentType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          className='text-sm p-1 '
          type="number"
          name="bot_price"
          placeholder="Min price"
          value={filter.bot_price}
          onChange={(e) => setFilter({ bot_price: parseFloat(e.target.value) || null })}
        />
        <input
          className='text-sm p-1'
          type="number"
          name="top_price"
          placeholder="Max price"
          value={filter.top_price}
          onChange={(e) => {
            setFilter({ top_price: parseFloat(e.target.value) || null })}}
        />
        </div>)}
      <EquipmentList />
    </div>
  );
}
