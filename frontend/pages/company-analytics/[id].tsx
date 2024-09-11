'use client';
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useRouter } from 'next/router';
import Navbar from '../../app/Navbar';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement,  // Register PointElement
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

// Define the interface for the data response
interface AnalyticsData {
  average_rating: number;
  created_slots: {
    months: Record<string, number>;
    quarters: Record<string, number>;
    years: Record<string, number>;
  };
  reserved_slots: {
    months: Record<string, number>;
    quarters: Record<string, number>;
    years: Record<string, number>;
  };
  revenue: {
    months: Record<string, number>;
  };
}

const AnalyticsPage: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = router.query.id;
    if (!companyId) return;

    const fetchData = async () => {
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
        const response = await fetch(`http://localhost:8000/company/analytics/${companyId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokensJson.access}`,
          },
        });

        if (response.ok) {
          const responseData: AnalyticsData = await response.json();
          setData(responseData);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchData();
    }
  }, [router.query.id]);

  if (loading) return <div>Loading...</div>;

  // Prepare data for charts
  const months = Object.keys(data?.created_slots.months || {});
  const quarters = Object.keys(data?.created_slots.quarters || {});
  const years = Object.keys(data?.created_slots.years || {});

  const createdSlotsMonthly = Object.values(data?.created_slots.months || {});
  const reservedSlotsMonthly = Object.values(data?.reserved_slots.months || {});
  
  const createdSlotsQuarterly = Object.values(data?.created_slots.quarters || {});
  const reservedSlotsQuarterly = Object.values(data?.reserved_slots.quarters || {});
  
  const createdSlotsAnnually = Object.values(data?.created_slots.years || {});
  const reservedSlotsAnnually = Object.values(data?.reserved_slots.years || {});
  
  const revenueMonthly = Object.values(data?.revenue.months || {});

  return (
    <div>
      <Navbar/>
      <div className="w-full mx-auto p-8 mt-8 bg-slate-800 border rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-white text-center">Company Analytics</h1>

        {data && (
          <>
            <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Average Company Rating</h2>
            <Bar
              data={{
                labels: ['Average Rating'],
                datasets: [
                  {
                    label: 'Rating',
                    data: [data.average_rating],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: {
                    min: 0,
                    max: 5,
                  },
                },
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Average Company Rating (0-5)',
                    color: 'white',
                  },
                },
              }}
            />

            <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Created and Reserved Slots</h2>

            <h3 className="text-xl font-semibold text-white mt-4">Monthly</h3>
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Created Slots',
                    data: createdSlotsMonthly,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                  },
                  {
                    label: 'Reserved Slots',
                    data: reservedSlotsMonthly,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Monthly Created and Reserved Slots',
                    color: 'white',
                  },
                },
              }}
            />

            <h3 className="text-xl font-semibold text-white mt-4">Quarterly</h3>
            <Line
              data={{
                labels: quarters,
                datasets: [
                  {
                    label: 'Created Slots',
                    data: createdSlotsQuarterly,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                  },
                  {
                    label: 'Reserved Slots',
                    data: reservedSlotsQuarterly,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Quarterly Created and Reserved Slots',
                    color: 'white',
                  },
                },
              }}
            />

            <h3 className="text-xl font-semibold text-white mt-4">Annually</h3>
            <Line
              data={{
                labels: years,
                datasets: [
                  {
                    label: 'Created Slots',
                    data: createdSlotsAnnually,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                  },
                  {
                    label: 'Reserved Slots',
                    data: reservedSlotsAnnually,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Annually Created and Reserved Slots',
                    color: 'white',
                  },
                },
              }}
            />

            <h2 className="text-2xl font-semibold text-white mt-6 mb-4">Monthly Revenue</h2>
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Revenue',
                    data: revenueMonthly,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Monthly Revenue',
                    color: 'white',
                  },
                },
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
