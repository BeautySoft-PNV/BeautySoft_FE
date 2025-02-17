import axios, { AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/constants/variables";

// const AXIOS = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 60000,
//   headers: {
//     Accept: "application/json",
//     "Content-type": "application/json;charset=utf-8",
//   },
// });

// AXIOS.interceptors.request.use(
//   async function (config) {
//     const token = await AsyncStorage.getItem("TOKEN");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );

// AXIOS.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   async (error) => {
//     const originalConfig = error.config;
//     if (error.response && error.response.status === 419) {
//       try {
//         // await refreshToken();
//         const accessToken = await AsyncStorage.getItem("access_token");
//         originalConfig.headers["Authorization"] = `Bearer ${accessToken}`;
//         return AXIOS(originalConfig);
//       } catch (err: any) {
//         if (err.response && err.response.status === 400) {
//           console.log(error);
//         }
//         return Promise.reject(err);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// interface RequestOptions {
//   method: AxiosRequestConfig["method"];
//   url: string;
//   data?: any;
//   onSuccess?: (data: any) => void;
//   onError?: (error: any) => void;
// }

// const request = async ({
//   method,
//   url,
//   data,
//   onSuccess = () => {},
//   onError = () => {},
// }: RequestOptions) => {
//   try {
//     const response = await AXIOS({
//       method,
//       url,
//       data,
//     });
//     onSuccess(response.data);
//     return response;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       onError(error.response?.data);
//     } else {
//       onError(error);
//     }
//   }
// };

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default apiClient;
