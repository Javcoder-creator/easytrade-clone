import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { 
  PackagePlus, Trash2, ArrowLeft, PlusCircle, 
  Search, X, Save 
} from 'lucide-react';

const Inventory = ({ storeId, onBack }) => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Yangi mahsulot qo'shish oynasi (Modal) uchun statelar
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price_sell: '',
        supply_price: '',
        stock_quantity: 0
    });

    // 1. Mahsulotlarni yuklash
    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products/${storeId}`);
            setProducts(res.data);
        } catch (err) {
            console.error("Yuklashda xato:", err);
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // 2. YANGI MAHSULOT YARATISH
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', { ...newProduct, store_id: storeId });
            alert("Yangi mahsulot qo'shildi! ✅");
            setShowAddModal(false);
            setNewProduct({ name: '', price_sell: '', supply_price: '', stock_quantity: 0 });
            loadProducts();
        } catch (err) {
            alert("Xatolik: " + err.response?.data?.message);
        }
    };

    // 3. BOR MAHSULOTGA KIRIM QILISH (Stock Entry)
    const handleAddStock = async (product) => {
        const qty = prompt(`${product.name} uchun qancha miqdor qo'shmoqchisiz?`);
        if (!qty || isNaN(qty) || qty <= 0) return;

        const price = prompt("Ushbu partiyaning kelish narxi (dona uchun):", product.supply_price || "");
        if (!price || isNaN(price)) return;

        try {
            await api.post('/products/add-stock', {
                product_id: product.id,
                quantity: parseInt(qty),
                supply_price: parseFloat(price)
            });
            alert("Zaxira yangilandi! 📦");
            loadProducts();
        } catch (err) {
            alert("Kirimda xatolik!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("O'chirilsinmi?")) {
            try {
                await api.delete(`/products/${id}`);
                loadProducts();
            } catch (err) { alert("Xato!"); }
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={onBack} style={backBtn}><ArrowLeft size={20} /></button>
                    <h2><PackagePlus size={24} color="#22c55e" /> Ombor</h2>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={searchBox}>
                        <Search size={18} color="#94a3b8" />
                        <input 
                            placeholder="Qidirish..." 
                            style={searchInput} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* MANA O'SHA TUGMA! */}
                    <button style={addMainBtn} onClick={() => setShowAddModal(true)}>
                        <PlusCircle size={20} /> Yangi Tovar
                    </button>
                </div>
            </header>

            {/* YANGI MAHSULOT QO'SHISH MODAL OYNASI */}
            {showAddModal && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={modalHeader}>
                            <h3>Yangi mahsulot qo'shish</h3>
                            <X onClick={() => setShowAddModal(false)} style={{cursor:'pointer'}} />
                        </div>
                        <form onSubmit={handleCreateProduct} style={modalForm}>
                            <input placeholder="Mahsulot nomi" required style={modalInput}
                                onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                            <input type="number" placeholder="Sotish narxi" required style={modalInput}
                                onChange={e => setNewProduct({...newProduct, price_sell: e.target.value})} />
                            <input type="number" placeholder="Kirim narxi (Tannarxi)" required style={modalInput}
                                onChange={e => setNewProduct({...newProduct, supply_price: e.target.value})} />
                            <input type="number" placeholder="Boshlang'ich qoldiq" style={modalInput}
                                onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
                            <button type="submit" style={saveBtn}><Save size={18} /> Saqlash</button>
                        </form>
                    </div>
                </div>
            )}

            <div style={tableWrapper}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={theadStyle}>
                            <th style={thStyle}>Nomi</th>
                            <th style={thStyle}>Sotish narxi</th>
                            <th style={thStyle}>Qoldiq</th>
                            <th style={thStyle}>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} style={trStyle}>
                                <td style={tdStyle}><b>{p.name}</b></td>
                                <td style={tdStyle}>{Number(p.price_sell).toLocaleString()} so'm</td>
                                <td style={tdStyle}>
                                    <span style={p.stock_quantity < 10 ? lowStock : normalStock}>
                                        {p.stock_quantity} dona
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleAddStock(p)} style={entryBtn}>+ Kirim</button>
                                        <button onClick={() => handleDelete(p.id)} style={deleteBtn}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Yangilangan Stillar ---
const containerStyle = { padding: '25px', fontFamily: 'Inter, sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const backBtn = { background: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', cursor: 'pointer' };
const searchBox = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '10px 15px', borderRadius: '12px', width: '250px' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', width: '100%' };
const addMainBtn = { background: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' };

// Modal Stillari
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const modalForm = { display: 'flex', flexDirection: 'column', gap: '15px' };
const modalInput = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px' };
const saveBtn = { background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' };

const tableWrapper = { background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadStyle = { background: '#f8fafc', textAlign: 'left' };
const thStyle = { padding: '15px', color: '#64748b', fontSize: '14px' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '15px' };
const entryBtn = { background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const deleteBtn = { background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '6px', borderRadius: '8px', cursor: 'pointer' };
const lowStock = { background: '#fef2f2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' };
const normalStock = { background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', borderRadius: '6px' };

export default Inventory;