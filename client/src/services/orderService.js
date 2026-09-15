import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/api/orders`;

export const getMyOrders = async (token) => {
  const response = await axios.get(`${API_URL}/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};