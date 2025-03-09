import axios from 'axios';
import { getAuthHeader } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7182/api';

export const getTestimonials = async () => {
  const response = await axios.get(`${API_URL}/testimonials`);
  return response.data;
};

export const createTestimonial = async (testimonialData) => {
  const response = await axios.post(`${API_URL}/testimonials`, testimonialData, {
    headers: getAuthHeader()
  });
  return response.data;
};
