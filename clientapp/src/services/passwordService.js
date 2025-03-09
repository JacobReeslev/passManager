import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7182/api';

export const getPasswords = async () => {
  const response = await axios.get(`${API_URL}/passwords`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getPassword = async (id) => {
  const response = await axios.get(`${API_URL}/passwords/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const createPassword = async (passwordData) => {
  const response = await axios.post(`${API_URL}/passwords`, passwordData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updatePassword = async (id, passwordData) => {
  const response = await axios.put(`${API_URL}/passwords/${id}`, passwordData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deletePassword = async (id) => {
  const response = await axios.delete(`${API_URL}/passwords/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
