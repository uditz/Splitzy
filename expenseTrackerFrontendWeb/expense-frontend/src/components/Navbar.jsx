import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import UpdateProfileModal from './UpdateProfileModal';
import './Navbar.css';

function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // We should ideally fetch real fresh data, but for now using local storage as cache placeholders
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const userImage = localStorage.getItem("imageUrl");
  const userEmail = localStorage.getItem("email") || "user@example.com"; // Email often not in LS, showing placeholder if missing

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">💰</span> ExpenseTracker
        </Link>
        
        <div className="navbar-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
          <Link to="/friends" className={`nav-link ${isActive('/friends')}`}>Friends</Link>
          <Link to="/chat" className={`nav-link ${isActive('/chat')}`}>Chat</Link>

          {/* Expenses Dropdown */}
          <div className="nav-item dropdown">
              <span className={`nav-link ${isActive('/create-expense') || isActive('/created-expenses') || isActive('/expense-requests') ? 'active' : ''}`}>
                  Expenses ▼
              </span>
              <div className="dropdown-content">
                  <Link to="/create-expense">Create Expense</Link>
                  <Link to="/created-expenses">My Expenses</Link>
                  <Link to="/expense-requests">Requests</Link>
              </div>
          </div>
        </div>
        
        <Link to="/notifications" className={`nav-link notification-icon-link ${isActive('/notifications')}`} style={{ fontSize: '1.2rem', marginRight: '1rem', textDecoration: 'none' }}>
           🔔
        </Link>

        {/* User Profile Hover Section */}
        <div className="nav-user-container">
          <div className="nav-user-trigger">
             <img 
                src={userImage || "https://via.placeholder.com/35"} 
                alt="Profile" 
                className="nav-profile-pic"
             />
             <span className="user-greeting">Hi, {username || "User"}</span>
          </div>

          <div className="profile-dropdown">
             <div className="profile-header">
                <img 
                    src={userImage || "https://via.placeholder.com/60"} 
                    alt="Profile Large" 
                    className="profile-large-pic"
                />
                <div className="profile-info">
                    <h4>{username || "User"}</h4>
                    <span className="profile-email">{userEmail}</span>
                </div>
             </div>
             <div className="profile-actions">
                <button onClick={() => setIsModalOpen(true)} className="profile-action-btn update-btn">
                    Update Profile
                </button>
                <button onClick={handleLogout} className="profile-action-btn logout-btn-dropdown">
                    Logout
                </button>
             </div>
          </div>
        </div>
      </nav>

      <UpdateProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        currentName={username}
        currentBio="" // We don't have bio in LS, pass empty for now
        currentImage={userImage} 
      />
    </>
  );
}

export default Navbar;
