const isConnected = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found.");
      return null;
    }

    const response = await fetch("http://localhost:3000/protected", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      console.error("Unauthorized - Invalid token.");
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to connect");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
};

export default isConnected;
