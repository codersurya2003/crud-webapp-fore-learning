import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/');
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/${id}`);
                setProducts(products.filter((p) => p._id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Inventory...</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2>Current Inventory</h2>
                <span style={{ color: '#94a3b8' }}>{products.length} Products</span>
            </div>

            {products.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>No products found.</p>
                    <Link to="/add" className="btn btn-primary">Start Adding</Link>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product._id} className="glass-panel product-card">
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                            <div className="category-tag">{product.category || 'Uncategorized'}</div>
                            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', flex: 1 }}>{product.description}</p>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="price-tag">${product.price}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link to={`/edit/${product._id}`} className="btn btn-icon" title="Edit">✏️</Link>
                                        <button onClick={() => handleDelete(product._id)} className="btn btn-icon" style={{ color: '#ef4444' }} title="Delete">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
