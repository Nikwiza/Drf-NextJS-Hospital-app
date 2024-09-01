import "@/styles/globals.css";
import { useState, ChangeEvent } from 'react';

interface CompanyUpdateFormProps {
  companyId: string;
}

const CompanyUpdateForm: React.FC<CompanyUpdateFormProps> = ({ companyId }) => {
  const [companyInfo, setCompanyInfo] = useState<{ [key: string]: string }>({
    company_name: '',
    description: '',
    address: '',
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
      const response = await fetch(`http://localhost:8000/company/update/${companyId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authTokensJson.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [fieldName]: companyInfo[fieldName] }),
      });

      const responseData = await response.json();

      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (response.ok) {
        setUpdateStatus(`success-${fieldName}`);
        console.log(`Company ${fieldName} updated successfully!`);
      } else {
        setUpdateStatus('error');
        console.error(`Failed to update company ${fieldName}`, responseData);
      }
    } catch (error) {
      console.error(`Error during update of ${fieldName}: `, error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  if (unauthorized) {
    return <div>You are not authorized to update company profile.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-slate-700 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-white">Update Company Information</h1>
      {updateStatus === "success-company_name" && (
        <div className="mb-4 text-green-600">
          Name edited successfully!
        </div>
      )}
      {updateStatus === "success-description" && (
        <div className="mb-4 text-green-600">
          Description edited successfully!
        </div>
      )}
      {updateStatus === "success-address" && (
        <div className="mb-4 text-green-600">
          Address edited successfully!
        </div>
      )}
      {updateStatus === "error" && (
        <div className="mb-4 text-red-600">
          Failed to edit.
        </div>
      )}
      <form>
        <div className="mb-4">
          <label htmlFor="company_name" className="block text-white font-bold mb-2">
            Company Name
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={companyInfo.company_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="button"
            onClick={() => handleFieldSubmit("company_name")}
            className="mt-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:bg-yellow-800"
          >
            Edit Name
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-white font-bold">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={companyInfo.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
            rows={4}
            required
          />
          <button
            type="button"
            onClick={() => handleFieldSubmit("description")}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:bg-yellow-800"
          >
            Edit Description
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block text-white font-bold mb-2">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={companyInfo.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="button"
            onClick={() => handleFieldSubmit("address")}
            className="mt-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:bg-yellow-800"
          >
            Edit Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyUpdateForm;
