'use client'

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const PasswordChange = () => {
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword1, setNewPassword1] = useState<string>('');
  const [newPassword2, setNewPassword2] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const authTokens = localStorage.getItem('authTokens');
      if (!authTokens) throw new Error("Tokens are missing");

      let authTokensJson;
      try {
        authTokensJson = JSON.parse(authTokens);
      } catch {
        throw new Error("Tokens cannot be parsed");
      }

      if (!authTokensJson?.access) throw new Error("Access token is missing");

      const response = await fetch('http://localhost:8000/account/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          old_password: oldPassword,
          new_password1: newPassword1,
          new_password2: newPassword2,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully');
        setError(null);
        setTimeout(() => {
          router.push('/company-admin-homepage');
        }, 1500);
      } else {
        setError(data.errors ? JSON.stringify(data.errors) : 'An error occurred');
        setSuccess(null);
      }
    } catch (error) {
      console.error('Error during password change:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full mx-auto p-8 mt-8 bg-slate-800 border rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-white text-center">Change Password</h2>
      <form onSubmit={handlePasswordChange}>
        <div className="mb-4">
          <label htmlFor="old-password" className="block text-white mb-2">Old Password</label>
          <input
            type="password"
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="new-password1" className="block text-white mb-2">New Password</label>
          <input
            type="password"
            id="new-password1"
            value={newPassword1}
            onChange={(e) => setNewPassword1(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="new-password2" className="block text-white mb-2">Confirm New Password</label>
          <input
            type="password"
            id="new-password2"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default PasswordChange;
