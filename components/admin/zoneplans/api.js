import axios from 'axios';

const API_BASE_URL = 'http://localhost/api/v1/';
// const AUTH_TOKEN = env.TOKEN
const AUTH_TOKEN = 'Token 449dacbbc14522dc7c0888e7fdf31a3bdc677bf3'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: AUTH_TOKEN
  }
});

export const fetchFloors = async () => {
  try {
    const response = await axiosInstance.get('floor/');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching floors:', error);
    throw error; // Re-throw to handle it in the component
  }
};

export const fetchOrgcodeData = async (orgcode, floorNum) => {
  try {
    const response = await axiosInstance.get(`orgcode/${orgcode}/?floor_num=${floorNum}`);
    const geofc = response.data;
    if (geofc.features !== null) { return geofc } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching orgcode data:', error);
    throw error; // Re-throw to handle it in the component
  }
};
