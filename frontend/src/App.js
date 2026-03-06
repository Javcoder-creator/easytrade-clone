import React, { useEffect, useState } from 'react';
import api from './api/axios';
import useStore from './store/useStore';

// Komponentlar
import Login from './components/Login';
import Inventory from './components/Inventory';
import Pos from './components/Pos';
import SalesHistory from './components/SalesHistory';
import SalesChart from './components/SalesChart';

// Ikonkalar
import { 
  Store, ChevronRight, LayoutDashboard, Package, 
  ShoppingCart, LogOut, History, User as UserIcon, Lock,
  DollarSign, Users, TrendingUp
} from 'lucide-react';

function App() {
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSalesCount: 0, totalProfit: 0 }); 
  const { currentStore, setCurrentStore, user, logout } = useStore();
  const [view, setView] = useState('dashboard');
  const [weeklyData, setWeeklyData] = useState([]);
  // 1. Do'konlarni yuklash
  useEffect(() => {
    if (user) {
      api.get('/stores')
        .then(res => setStores(res.data))
        .catch(err => console.error("Xato:", err));
    }
  }, [user]);
    useEffect(() => {
    if (currentStore && user?.role === 'admin') {
        api.get(`/sales/weekly/${currentStore.id}`).then(res => setWeeklyData(res.data));
    }
}, [currentStore, view]);

  // 2. Statistika ma'lumotlarini yuklash
  useEffect(() => {
    if (currentStore && user?.role === 'admin') {
      api.get(`/sales/stats/${currentStore.id}`)
        .then(res => setStats(res.data))
        .catch(err => console.error("Statistika yuklanmadi", err));
    }
  }, [currentStore, user, view]);

  if (!user) return <Login />;

  if (currentStore) {
    if (view === 'pos') return <Pos storeId={currentStore.id} onBack={() => setView('dashboard')} />;
    if (view === 'inventory') return <Inventory storeId={currentStore.id} onBack={() => setView('dashboard')} />;
    if (view === 'history') return <SalesHistory storeId={currentStore.id} onBack={() => setView('dashboard')} />;

    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <LayoutDashboard size={28} color="#3b82f6" />
            <div style={userBadge}>
              <UserIcon size={16} />
              <span>{user.username} ({user.role})</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', borderLeft: '1px solid #ddd', paddingLeft: '15px' }}>
              {currentStore.name}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { setCurrentStore(null); setView('dashboard'); }} style={secondaryBtn}>
              Almashtirish
            </button>
            <button onClick={logout} style={logoutBtnStyle}>
              <LogOut size={18} /> Chiqish
            </button>
          </div>
        </header>

        {/* ADMIN UCHUN STATISTIKA PANELI - 3 TA KARTA */}
        {user.role === 'admin' && (
          <div style={statsGrid}>
            {user.role === 'admin' && <SalesChart data={weeklyData} />}
            <div style={{...statsCard, background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
              <div style={cardHeader}><DollarSign size={20} /> <span>Umumiy tushum</span></div>
              <h2 style={statsValue}>{Number(stats.totalRevenue).toLocaleString()} so'm</h2>
            </div>
            
            <div style={{...statsCard, background: 'linear-gradient(135deg, #10b981, #059669)'}}>
              <div style={cardHeader}><Users size={20} /> <span>Mijozlar</span></div>
              <h2 style={statsValue}>{stats.totalSalesCount} ta</h2>
            </div>

            <div style={{...statsCard, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
              <div style={cardHeader}><TrendingUp size={20} /> <span>Sof foyda</span></div>
              <h2 style={statsValue}>{Number(stats.totalProfit).toLocaleString()} so'm</h2>
            </div>
          </div>
        )}

        <main style={mainGrid}>
          <div style={menuCard} onClick={() => setView('pos')}>
            <ShoppingCart size={44} color="#3b82f6" />
            <h3>Sotuv (POS)</h3>
            <p>Yangi savdo amaliyoti</p>
          </div>

          {user.role === 'admin' ? (
            <>
              <div style={menuCard} onClick={() => setView('inventory')}>
                <Package size={44} color="#22c55e" />
                <h3>Ombor (Sklad)</h3>
                <p>Mahsulotlar va qoldiqlar</p>
              </div>
              <div style={{...menuCard, gridColumn: 'span 2'}} onClick={() => setView('history')}>
                <History size={44} color="#64748b" />
                <h3>Sotuvlar Tarixi</h3>
                <p>Barcha savdolar va hisobotlar</p>
              </div>
            </>
          ) : (
            <div style={{...menuCard, backgroundColor: '#f8fafc', cursor: 'default', borderStyle: 'dashed'}}>
              <Lock size={44} color="#94a3b8" />
              <h3 style={{color: '#64748b'}}>Boshqaruv cheklangan</h3>
              <p>Ombor va hisobotlar faqat Admin uchun</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div style={selectionContainer}>
      <h1 style={{ fontSize: '32px', color: '#1e293b', marginBottom: '10px' }}>EasyTrade</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Xush kelibsiz, <b>{user.username}</b>!</p>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        {stores.map(s => (
          <div key={s.id} onClick={() => setCurrentStore(s)} style={storeCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={iconWrapper}><Store size={22} color="white" /></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold' }}>{s.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.address}</div>
              </div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>
        ))}
        <button onClick={logout} style={{ ...secondaryBtn, width: '100%', marginTop: '20px', padding: '12px' }}>
          Tizimdan chiqish
        </button>
      </div>
    </div>
  );
}

// --- Stillar ---
const containerStyle = { padding: '30px', maxWidth: '1100px', margin: 'auto', fontFamily: 'Inter, sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' };
const userBadge = { display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' };
const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' };
const statsCard = { padding: '20px', borderRadius: '18px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const cardHeader = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.9, marginBottom: '10px' };
const statsValue = { margin: 0, fontSize: '24px', fontWeight: '800' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const menuCard = { padding: '30px', borderRadius: '20px', border: '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: '0.2s' };
const selectionContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' };
const storeCardStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'white', borderRadius: '16px', marginBottom: '12px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const iconWrapper = { background: '#3b82f6', padding: '12px', borderRadius: '12px', display: 'flex' };
const logoutBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fee2e2', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', color: '#ef4444' };
const secondaryBtn = { background: 'white', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', color: '#64748b' };

export default App;