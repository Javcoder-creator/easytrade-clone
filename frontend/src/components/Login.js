import React, { useState } from 'react';
import api from '../api/axios';
import useStore from '../store/useStore';
import { Lock, User, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginStore = useStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      loginStore(res.data.user, res.data.token);
    } catch (err) {
      alert("Login yoki parol xato!");
    }
  };

  return (
    <div style={loginBg}>
      <form onSubmit={handleLogin} style={loginCard}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>EasyTrade Kirish</h2>
        <div style={inputGroup}>
          <User size={20} color="#64748b" />
          <input 
            placeholder="Login" 
            style={inputStyle} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div style={inputGroup}>
          <Lock size={20} color="#64748b" />
          <input 
            type="password" 
            placeholder="Parol" 
            style={inputStyle} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit" style={loginBtn}>
          <LogIn size={18} /> Kirish
        </button>
      </form>
    </div>
  );
};

// --- Login Stillari ---
const loginBg = { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' };
const loginCard = { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px' };
const inputGroup = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #e2e8f0' };
const inputStyle = { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' };
const loginBtn = { width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' };

export default Login;