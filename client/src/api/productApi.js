import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export default API;