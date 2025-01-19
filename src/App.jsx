import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState(""); // For storing the input URL
  const [loading, setLoading] = useState(false); // For managing loading state
  const [error, setError] = useState(null); // For managing errors
  const [productData, setProductData] = useState(null); // For storing the product data (title, image, reviews)
  const [intervalId, setIntervalId] = useState(null); // For tracking interval ID to clear it

  // Handle URL input change
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  // Fetch product data from the server
  const fetchProductData = async () => {
    if (!url) {
      alert("Please enter a product URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/get-product-data", {
        url: url, // Send the actual URL entered by the user
      });
      if (response.data.reviews) {
        // If productData already has reviews, append new reviews
        setProductData((prevData) => ({
          ...prevData,
          reviews: [...prevData?.reviews || [], ...response.data.reviews],
        }));
      }
    } catch (error) {
      setError("Error fetching product data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Start fetching data every second when button is clicked
  const startFetchingReviews = () => {
    if (intervalId) {
      clearInterval(intervalId); // Clear previous interval if any
    }

    const id = setInterval(() => {
      fetchProductData();
    }, 1000); // 1000 milliseconds = 1 second
    setIntervalId(id);
    setLoading(true);
  };

  // Stop fetching data (if needed)
  const stopFetchingReviews = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    setLoading(false);
  };

  // Cleanup the interval when component is unmounted
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <div className="App">
      <h1>Product Review Fetcher</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchProductData(); // Perform one-time fetch on form submit
        }}
        className="form"
      >
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter product link"
          required
          className="input"
        />
        <button type="submit" className="button">
          Get Reviews
        </button>
      </form>

      <div className="button-container">
        <button
          onClick={startFetchingReviews}
          disabled={loading}
          className={`button ${loading ? "button-disabled" : "button-fetch"}`}
        >
          Start Fetching Reviews Every Second
        </button>
        <button
          onClick={stopFetchingReviews}
          disabled={!loading}
          className={`button ${!loading ? "button-disabled" : "button-stop"}`}
        >
          Stop Fetching Reviews
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {productData && (
        <div className="product-container">
          <h3 className="product-title">{productData.title}</h3>
          <div className="reviews-container">
            {Array.isArray(productData.reviews) &&
              productData.reviews.map((review, index) => (
                <div key={index} className="review">
                  {review.title && <h3>{review.title}</h3>}
                  {review.description && <p>{review.description}</p>}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
