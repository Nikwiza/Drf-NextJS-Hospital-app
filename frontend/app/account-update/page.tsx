'use client'

import "@/styles/globals.css";
import { useState, ChangeEvent } from 'react';

interface AccountUpdateFormProps {
  accountId: string;
}

const AccountUpdateForm: React.FC<AccountUpdateFormProps> = ({ accountId }) => {
  const [accountInfo, setAccountInfo] = useState<{ [key: string]: string }>({
    name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const handleFieldSubmit = async (fieldName: string) => {
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

      const response = await fetch(`http://localhost:8000/user/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fieldName]: accountInfo[fieldName] }),
      });

      const responseData = await response.json();

      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (response.ok) {
        setUpdateStatus(`success-${fieldName}`);
        console.log(`Account ${fieldName} updated successfully!`);
      } else {
        setUpdateStatus('error');
        console.error(`Failed to update account ${fieldName}`, responseData);
      }
    } catch (error) {
      console.error(`Error during update of ${fieldName}: `, error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  if (unauthorized) {
    return <div>You are not authorized to update account information.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-slate-700 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-white">Update Account Information</h1>
      {updateStatus === "success-name" && (
        <div className="mb-4 text-green-600">
          First name edited successfully!
        </div>
      )}
      {updateStatus === "success-last_name" && (
        <div className="mb-4 text-green-600">
          Last name edited successfully!
        </div>
      )}
      {updateStatus === "success-email" && (
        <div className="mb-4 text-green-600">
          Email edited successfully!
        </div>
      )}
      {updateStatus === "success-phone_number" && (
        <div className="mb-4 text-green-600">
          Phone number edited successfully!
        </div>
      )}
      {updateStatus === "error" && (
        <div className="mb-4 text-red-600">
          Failed to edit.
        </div>
      )}
      <form>
        <div className="mb-4">
          <label htmlFor="name" className="block text-white font-bold mb-2">
            First Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={accountInfo.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="button"
            onClick={() => handleFieldSubmit("name")}
            className="mt-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:bg-yellow-800"
          >
            Edit First Name
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="last_name" className="block text-white font-bold mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={accountInfo.last_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="button"
            onClick={() => handleFieldSubmit("last_name")}
            className="mt-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:bg-yellow-800"
          >
            Edit Last Name
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-white font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={accountInfo.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="button"
            onClick={() => handleFieldSubmit("email")}
            className="mt-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:bg-yellow-800"
          >
            Edit Email
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="phone_number" className="block text-white font-bold mb-2">
            Phone Number
          </label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={accountInfo.phone_number}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="button"
            onClick={() => handleFieldSubmit("phone_number")}
            className="mt-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:bg-yellow-800"
          >
            Edit Phone Number
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountUpdateForm;
