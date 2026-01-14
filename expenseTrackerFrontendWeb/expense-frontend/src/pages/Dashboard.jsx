// src/pages/Dashboard.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';

function Dashboard() {
  const userId = localStorage.getItem("userId");

  const menuItems = [
    { title: "Friends", icon: "👥", path: "/friends", color: "#61A5D3", desc: "Manage your connections" },
    { title: "Create Expense", icon: "➕", path: "/create-expense", color: "#8CCB56", desc: "Add a new spent" },
    { title: "My Expenses", icon: "📄", path: "/created-expenses", color: "#FFB84D", desc: "View expenses you created" },
    { title: "Requests", icon: "📬", path: "/expense-requests", color: "#FF6F61", desc: "Approve pending expenses" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>Dashboard</h2>
      
      <div className="card" style={{ marginBottom: '30px', background: 'linear-gradient(to right, #61A5D3, #8CCB56)', color: 'white' }}>
        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>👋 Welcome back!</h3>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '1.2rem', fontWeight: 'bold' }}>
            {localStorage.getItem("username") || `User ID: ${userId}`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {menuItems.map((item) => (
          <Link to={item.path} key={item.path} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{item.icon}</div>
              <h3 style={{ color: item.color, margin: '0 0 10px 0' }}>{item.title}</h3>
              <p style={{ color: '#757575', margin: 0 }}>{item.desc}</p>
            </div>
          </Link>
        ))}
        
        {/* Helper link for dev testing */}
        <Link to="/chat/2" style={{ textDecoration: 'none' }}>
             <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px', border: '2px dashed #D3D3D3', background: 'transparent' }}>
               <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💬</div>
               <h3 style={{ color: '#757575', margin: '0 0 10px 0' }}>Test Chat</h3>
               <p style={{ color: '#757575', margin: 0 }}>Friend ID: 2</p>
             </div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
