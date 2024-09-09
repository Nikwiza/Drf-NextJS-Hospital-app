'use client';
import { useState, useEffect } from "react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const ReservedUsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReservedUsers = async () => {
      try {
        const authTokens = localStorage.getItem('authTokens');
        if (!authTokens) throw new Error("Auth tokens not found!");

        const authTokensJson = JSON.parse(authTokens);
        const response = await fetch('http://localhost:8000/company/reserved-users-list/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authTokensJson.access}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchReservedUsers();
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full mx-auto p-8 mt-8 bg-slate-800 border rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-white text-center">Reserved Users List</h2>
      {users.length > 0 ? (
        <ul className="text-white">
          {users.map((user) => (
            <li key={user.id} className="mb-4 border-b pb-2">
              <span className="font-semibold">{user.first_name} {user.last_name}</span> ({user.email})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white text-center">No users have reserved slots.</p>
      )}
    </div>
  );
};

export default ReservedUsersList;
