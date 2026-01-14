import React, { useState, useEffect } from 'react';
import api from '../api';

function MyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyExpenses();
  }, []);

  const fetchMyExpenses = async () => {
    try {
      const response = await api.get('/Expense/myexpense');
      setExpenses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addExpense = async () => {
    try {
      await api.post('/Expense/new', { title, amount, transactionType, date });
      setMessage('Expense added');
      fetchMyExpenses();
    } catch (err) {
      setMessage('Error adding expense');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>My Expenses (Legacy/Test)</h2>
      
      <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Add New Expense</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input 
            type="text" 
            placeholder="Transaction Type" 
            value={transactionType} 
            onChange={(e) => setTransactionType(e.target.value)} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </div>
        <button 
          onClick={addExpense}
          className="btn btn-primary"
          style={{ marginTop: '20px' }}
        >
          Add Expense
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
          {expenses.map((exp) => (
            <li key={exp.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <span><b>{exp.title}</b></span>
              <span>{exp.amount} <small>({exp.transactionType})</small></span>
              <span style={{ color: '#888' }}>{exp.date}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {message && <p style={{ marginTop: '10px', color: 'green' }}>{message}</p>}
    </div>
  );
}

export default MyExpenses;