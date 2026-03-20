import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/",
  baseURL: "https://stoffverkauf-e-commerce-1.onrender.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;