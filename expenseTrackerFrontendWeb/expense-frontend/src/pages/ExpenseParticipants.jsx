import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

function ExpenseParticipants() {
  const { expenseId } = useParams();
  const [participants, setParticipants] = useState([]);

  const loadParticipants = () => {
    api.get(`/participant/byEid/${expenseId}`)
      .then(res => setParticipants(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadParticipants();
  }, [expenseId]);

  const markDone = (receiverId) => {
    api.post(`/Expense/accept/${receiverId}/${expenseId}`)
      .then(() => loadParticipants()) // refresh after update
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>Expense Participants</h2>

      {participants.length === 0 ? <p style={{ color: '#666' }}>No participants found.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {participants.map(p => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: "20px",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: '4px solid var(--color-primary-blue)'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{p.receiverName}</h4>
                <p style={{ margin: '5px 0', fontSize: '1rem' }}>Amount: <b>₹{p.amount}</b></p>
                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>Status: {p.transactionType}</p>
              </div>

              <div style={{ marginTop: '20px' }}>
                {p.transactionType === "PENDING" ? (
                  <button onClick={() => markDone(p.receiverId)} className="btn btn-primary" style={{ width: '100%' }}>
                    Mark as Done
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--color-primary-green)', fontWeight: 'bold', padding: '10px', background: '#E8F5E9', borderRadius: '8px' }}>
                    Statement Settled ✅
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExpenseParticipants;
