import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function CreatedExpenses() {
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/Expense/myexpense")
      .then(res => setExpenses(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>Expenses I Created</h2>

      {expenses.length === 0 ? <p style={{ color: '#666' }}>No expenses found.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {expenses.map(exp => (
            <div
              key={exp.id}
              onClick={() => navigate(`/expense/${exp.id}`)}
              className="card"
              style={{
                cursor: "pointer",
                borderLeft: '5px solid var(--color-primary-green)',
                padding: '20px'
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--color-primary-blue)' }}>{exp.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>₹{exp.amount}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>{new Date(exp.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CreatedExpenses;
