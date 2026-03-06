import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ShoppingCart, Trash2, ArrowLeft, Search, 
  Printer, X, CheckCircle2 
} from 'lucide-react';

const Pos = ({ storeId, onBack }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        api.get(`/products/${storeId}`).then(res => setProducts(res.data));
    }, [storeId]);

    const addToCart = (product) => {
        if (product.stock_quantity <= 0) return alert("Omborda tovar qolmagan!");
        const exist = cart.find(x => x.id === product.id);
        if (exist) {
            setCart(cart.map(x => x.id === product.id ? { ...exist, qty: exist.qty + 1 } : x));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        const exist = cart.find(x => x.id === id);
        if (exist.qty === 1) {
            setCart(cart.filter(x => x.id !== id));
        } else {
            setCart(cart.map(x => x.id === id ? { ...exist, qty: exist.qty - 1 } : x));
        }
    };

    const totalPrice = cart.reduce((a, c) => a + c.price_sell * c.qty, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const saleData = {
                store_id: storeId,
                items: cart,
                total_price: totalPrice,
                date: new Date().toLocaleString()
            };
            await api.post('/sales', saleData);
            
            setLastSale(saleData);
            setShowReceipt(true);
            setCart([]);
            api.get(`/products/${storeId}`).then(res => setProducts(res.data));
        } catch (err) {
            alert("Sotuvda xatolik: " + err.message);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={containerStyle}>
            {/* CHEK MODAL OYNASI */}
            {showReceipt && lastSale && (
                <div style={modalOverlay} className="no-print">
                    <div style={receiptModal}>
                        <div id="printable-receipt" style={receiptPaper}>
                            <h3 style={{ textAlign: 'center', marginBottom: '5px' }}>EASY TRADE</h3>
                            <p style={{ textAlign: 'center', fontSize: '12px', margin: 0 }}>Sotuv Cheki</p>
                            <hr />
                            <div style={receiptInfo}>
                                <span>Sana: {lastSale.date}</span>
                                <span>Do'kon ID: {storeId}</span>
                            </div>
                            <hr />
                            <table style={{ width: '100%', fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        <th align="left">Nomi</th>
                                        <th align="center">Soni</th>
                                        <th align="right">Narxi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lastSale.items.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td align="center">{item.qty}</td>
                                            <td align="right">{(item.price_sell * item.qty).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <hr />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>JAMI:</span>
                                <span>{lastSale.total_price.toLocaleString()} so'm</span>
                            </div>
                        </div>
                        
                        <div style={modalActions}>
                            <button onClick={handlePrint} style={printBtn}><Printer size={18} /> Chop etish</button>
                            <button onClick={() => setShowReceipt(false)} style={closeBtn}>Yopish</button>
                        </div>
                    </div>
                </div>
            )}

            <header style={headerStyle}>
                <button onClick={onBack} style={backBtn}><ArrowLeft size={20} /></button>
                <div style={searchBox}>
                    <Search size={18} color="#94a3b8" />
                    <input 
                        placeholder="Mahsulot qidirish..." 
                        style={searchInput} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div style={posGrid}>
                <div style={productGrid}>
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} style={productCard}>
                            <div style={stockBadge}>{p.stock_quantity}</div>
                            <h4 style={{margin: '10px 0'}}>{p.name}</h4>
                            <p style={{color: '#3b82f6', fontWeight: 'bold'}}>{Number(p.price_sell).toLocaleString()} so'm</p>
                        </div>
                    ))}
                </div>

                <div style={cartPanel}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '10px'}}><ShoppingCart size={22} /> Savat</h3>
                    <div style={cartItems}>
                        {cart.map(item => (
                            <div key={item.id} style={cartItem}>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: '600'}}>{item.name}</div>
                                    <div style={{fontSize: '12px', color: '#64748b'}}>{Number(item.price_sell).toLocaleString()} x {item.qty}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{fontWeight: 'bold'}}>{(item.price_sell * item.qty).toLocaleString()}</span>
                                    <Trash2 size={16} color="#ef4444" style={{cursor: 'pointer'}} onClick={() => removeFromCart(item.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={cartFooter}>
                        <div style={totalRow}>
                            <span>Jami:</span>
                            <span>{totalPrice.toLocaleString()} so'm</span>
                        </div>
                        <button onClick={handleCheckout} style={checkoutBtn}>Sotuvni yakunlash</button>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body * { visibility: hidden; }
                    #printable-receipt, #printable-receipt * { visibility: visible; }
                    #printable-receipt { position: fixed; left: 0; top: 0; width: 100%; padding: 20px; }
                }
            `}</style>
        </div>
    );
};

// --- Stillar ---
const containerStyle = { padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' };
const headerStyle = { display: 'flex', gap: '20px', marginBottom: '20px' };
const backBtn = { padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' };
const searchBox = { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '0 15px', borderRadius: '12px' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', width: '100%', height: '45px' };

const posGrid = { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', flex: 1, overflow: 'hidden' };
const productGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', overflowY: 'auto', paddingRight: '10px' };
const productCard = { background: 'white', padding: '15px', borderRadius: '16px', border: '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'center', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const stockBadge = { position: 'absolute', top: '8px', right: '8px', background: '#f1f5f9', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', color: '#64748b' };

const cartPanel = { background: 'white', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const cartItems = { flex: 1, overflowY: 'auto', marginBottom: '20px' };
const cartItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' };
const cartFooter = { borderTop: '2px solid #f1f5f9', paddingTop: '15px' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '22px', fontWeight: '800', marginBottom: '15px', color: '#1e293b' };
const checkoutBtn = { width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const receiptModal = { background: 'white', padding: '25px', borderRadius: '24px', width: '380px' };
const receiptPaper = { background: '#fff', padding: '20px', border: '1px dashed #ccc', color: '#000', fontFamily: 'monospace' };
const receiptInfo = { display: 'flex', flexDirection: 'column', fontSize: '12px', gap: '4px', margin: '10px 0' };
const modalActions = { display: 'flex', gap: '10px', marginTop: '20px' };
const printBtn = { flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' };
const closeBtn = { flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };

export default Pos;