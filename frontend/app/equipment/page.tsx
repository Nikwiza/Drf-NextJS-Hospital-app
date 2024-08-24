'use client'

import React, { useReducer, useEffect, useCallback, useMemo, ChangeEvent } from 'react';

interface Equipment {
  id: number;
  name: string;
  picture_url: string;
}

interface State {
  equipment: Equipment[];
  search: string;
}

interface Action {
  type: string;
  payload: any;
}

export default function Equipment() {
  const [{ equipment, search }, dispatch] = useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case 'setEquipment':
          return { ...state, equipment: action.payload };
        case 'setSearch':
          return { ...state, search: action.payload };
        default:
          return state;
      }
    },
    {
      equipment: [],
      search: '',
    }
  );

  // Fetch equipment
  useEffect(() => {
    fetch('http://localhost:8000/equipment/')
      .then((response) => response.json())
      .then((data: Equipment[]) =>
        dispatch({
          type: 'setEquipment',
          payload: data,
        })
      );
  }, []);

  const setSearch = useCallback((search: string) => {
    dispatch({
      type: 'setSearch',
      payload: search,
    });
  }, []);

  const filteredEquipment = useMemo(
    () =>
      equipment.filter((eq: Equipment) =>
        eq.name.toLowerCase().includes(search.toLowerCase())
      ),
    [equipment, search]
  );

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
              <h3 className="mt-6 text-gray-900 text-sm font-medium">
                {eq.name}
              </h3>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <input
        className="mt-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-800 focus:ring-indigo-800 sm:text-lg p-2"
        placeholder="Search"
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
      />
      <EquipmentList />
    </div>
  );
}
