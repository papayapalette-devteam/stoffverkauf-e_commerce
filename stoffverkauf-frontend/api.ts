import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/",
  baseURL: "https://stoffverkauf-e-commerce-1.onrender.com/"
});

// api.interceptors.request.use((config) => {
//   // Check standard token first (Admin or simple login)
//   let token = localStorage.getItem("token");
  
//   // If not found, check the user storage key
//   if (!token) {
//     const authData = localStorage.getItem("weber_auth");
//     if (authData) {
//       try {
//         const parsed = JSON.parse(authData);
//         token = parsed.token;
//       } catch (err) {
//         console.error("Failed to parse weber_auth", err);
//       }
//     }
//   }

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;