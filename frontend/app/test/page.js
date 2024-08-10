"use client"

import React, { useState, useEffect } from "react";

const HomePage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/test/")
      .then((res) => res.json())
      .then((data) => setData(data.data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
  
return (
    <div>
      <p>{data ? data : "Loading data..."}</p>
    </div>
  );
};

export default HomePage;