import React, { useEffect, useState } from "react";
import api from "../api";

function ExpenseRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get("/participant/getreq")
      .then(res => setRequests(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>My Expense Requests</h2>

      {requests.length === 0 ? <p style={{ color: '#666' }}>No pending requests.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {requests.map(req => (
            <div key={req.id} className="card" style={{ borderLeft: req.transactionType === "DONE" ? '5px solid var(--color-primary-green)' : '5px solid var(--color-accent-coral)', padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>Amount I Owe: <span style={{ color: '#333' }}>₹{req.amountOwed}</span></p>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>Expense ID: {req.expenseId}</p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  backgroundColor: req.transactionType === "DONE" ? '#E8F5E9' : '#FFEBEE',
                  color: req.transactionType === "DONE" ? '#2E7D32' : '#C62828'
                }}>
                  {req.transactionType}
                </span>
                
                {req.transactionType === "DONE" && (
                  <span style={{ color: "var(--color-primary-green)", fontWeight: 'bold' }}>Paid ✅</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseRequests;
