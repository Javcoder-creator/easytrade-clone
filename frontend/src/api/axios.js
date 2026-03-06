import axios from 'axios';

const api = axios.create({
  // Render bergan primary URL ni shu yerga qo'ying
  baseURL: 'https://easytrade-clone.onrender.com/api' 
});

export default api;