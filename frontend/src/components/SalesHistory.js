import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ArrowLeft, History, Calendar } from 'lucide-react';

const SalesHistory = ({ storeId, onBack }) => {
    const [sales, setSales] = useState([]);

    useEffect(() => {
        api.get(`/sales/${storeId}`).then(res => setSales(res.data));
    }, [storeId]);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <ArrowLeft onClick={onBack} style={{ cursor: 'pointer' }} />
                <h2><History size={24} /> Sotuvlar Tarixi</h2>
            </div>

            {sales.map(sale => (
                <div key={sale.id} style={saleCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><Calendar size={14} /> {new Date(sale.createdAt).toLocaleString()}</span>
                        <strong style={{ color: '#22c55e' }}>+{Number(sale.total_price).toLocaleString()} so'm</strong>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#64748b' }}>
                        {sale.items.map((item, idx) => (
                            <span key={idx}>{item.name} (x{item.qty}){idx !== sale.items.length - 1 ? ', ' : ''}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const saleCard = { 
    background: 'white', padding: '15px', borderRadius: '12px', 
    marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eee' 
};

export default SalesHistory;