import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      background: 'linear-gradient(135deg, var(--color-bg-light) 0%, #dbedff 100%)',
      padding: '0 20px'
    },
    title: {
      fontSize: '3.5rem',
      color: 'var(--color-primary-blue)', 
      marginBottom: '20px',
      fontWeight: '700'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#757575',
      marginBottom: '40px',
      maxWidth: '600px',
      lineHeight: '1.6'
    },
    buttonGroup: {
      display: 'flex',
      gap: '20px'
    },
    loginBtn: {
      padding: '12px 30px',
      backgroundColor: '#1ABC9C',
      color: 'white',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      textDecoration: 'none',
      boxShadow: '0 4px 6px #D3D3D3',
      transition: 'transform 0.2s'
    },
    registerBtn: {
      padding: '12px 30px',
      backgroundColor: 'white',
      color: '#61A5D3',
      border: '2px solid #61A5D3',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'transform 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to ExpenseTracker</h1>
      <p style={styles.subtitle}>
        Manage your personal finances, track expenses with friends, and settle debts easily. 
        Simple, fast, and secure.
      </p>
      <div style={styles.buttonGroup}>
        <Link to="/login" style={styles.loginBtn}>Login To Dashboard</Link>
        <Link to="/register" style={styles.registerBtn}>Register New Account</Link>
      </div>
    </div>
  );
}

export default Home;
