import React, { useEffect, useState } from "react";
import api from "../api";

function CreateExpense() {
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  /* ✅ Fetch friends */
  useEffect(() => {
    api.get("/friend/all")
      .then(res => setFriends(res.data))
      .catch(err => console.error(err));
  }, []);

  /* ✅ Add or remove friend */
  const toggleFriend = (friend) => {
    const exists = selectedFriends.find(f => f.id === friend.id);

    if (exists) {
      setSelectedFriends(prev =>
        prev.filter(f => f.id !== friend.id)
      );
    } else {
      setSelectedFriends(prev => [
        ...prev,
        { ...friend, amount: "" }
      ]);
    }
  };

  /* ✅ Update amount for a friend */
  const updateAmount = (id, value) => {
    setSelectedFriends(prev =>
      prev.map(f =>
        f.id === id ? { ...f, amount: value } : f
      )
    );
  };

  /* ✅ Submit expense */
  const createExpense = async () => {
    const payload = {
      title,
      totalAmount,
      selectedFriend: selectedFriends.map(f => ({
        name: f.name,
        amount: f.amount
      }))
    };

    try {
      await api.post("/Expense/new", payload);
      alert("Expense created ✅");

      setTitle("");
      setTotalAmount("");
      setSelectedFriends([]);

    } catch (err) {
      console.error(err);
      alert("Failed to create expense ❌");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Create Expense</h2>

      <div className="card" style={{ padding: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title</label>
          <input
            type="text"
            placeholder="What needs to be paid?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Total Amount</label>
          <input
            type="number"
            placeholder="0.00"
            value={totalAmount}
            onChange={e => setTotalAmount(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>

        <h3 style={{ marginBottom: '15px' }}>Split with Friends</h3>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
          {friends.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>No friends found. Add some friends first!</p> :
            friends.map(friend => {
            const selected = selectedFriends.find(f => f.id === friend.id);

            return (
              <div key={friend.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f9f9f9', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => toggleFriend(friend)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '1.1rem' }}>{friend.name}</span>
                </label>

                {/* Amount input */}
                {selected && (
                  <input
                    type="number"
                    placeholder="Amount"
                    value={selected.amount}
                    onChange={e =>
                      updateAmount(friend.id, e.target.value)
                    }
                    style={{ width: '100px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <button onClick={createExpense} className="btn btn-primary" style={{ width: '100%', marginTop: '30px', padding: '15px', fontSize: '1.1rem' }}>
          Create Expense
        </button>
      </div>
    </div>
  );
}

export default CreateExpense;
