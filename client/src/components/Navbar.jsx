import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="glass-panel" style={{ padding: '1rem 2rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Inventory<span style={{ color: '#fff' }}>Manager</span>
            </Link>
            <div>
                <Link to="/" className="btn btn-icon" style={{ marginRight: '1rem' }}>Dashboard</Link>
                <Link to="/add" className="btn btn-primary">
                    + Add Product
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
