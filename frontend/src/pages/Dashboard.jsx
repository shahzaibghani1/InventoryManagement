import React, { useEffect, useState } from "react";
import { Card, CardBody, Typography, Spinner } from "@material-tailwind/react";
import axios from "axios";

const DashboardCard = ({ title, value }) => (
  <Card className="border-2 border-gray-300 shadow-md">
    <CardBody>
      <div className="mb-5 text-lg font-medium text-black">{title}</div>
      <Typography color="blue-gray" className="text-2xl font-bold">
        {value}
      </Typography>
    </CardBody>
  </Card>
);

const Dashboard = () => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/dashboard");
        setApiData(response.data);
        setError(null);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center"><Spinner className="h-10 w-10"/></div>;
  }

  if (error) {
    return (
      <div className="text-center text-lg font-medium text-red-500">
        {error}
      </div>
    );
  }

  const dashboardData = [
    {
      title: "Total Sales (Today)",
      value: `Rs. ${apiData.totalSalesToday || 0}`,
    },
    {
      title: "Total Monthly Sales",
      value: `Rs. ${apiData.totalMonthlySales || 0}`,
    },
    { title: "No. of Products", value: `${apiData.noOfProducts}` },
    {
      title: "Purchase Count (Today)",
      value: `${apiData.purchaseCountToday || 0}`,
    },
    {
      title: "Total Purchase Count",
      value: `${apiData.totalPurchaseCount || 0}`,
    },
    {
      title: "Total Stock Value",
      value: `Rs. ${apiData.totalStockValue || 0}`,
    },

    // { title: "No. of Clients", value: `${apiData.noOfClients || 0}` },
    // { title: "Out of Stock", value: `${apiData.zeroQuantityCount || 0}` },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {dashboardData.map((item, index) => (
          <DashboardCard key={index} title={item.title} value={item.value} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
