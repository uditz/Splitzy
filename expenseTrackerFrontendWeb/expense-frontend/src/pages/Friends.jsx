import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  // ---------------- FETCH DATA ----------------
  const fetchFriends = async () => {
    const res = await api.get('/friend/all');
    setFriends(res.data);
  };

  const fetchRequests = async () => {
    const res = await api.get('/friend/requests');
    setRequests(res.data);
  };

  // ---------------- SEARCH USERS ----------------
  const searchUsers = async (keyword) => {
    setSearchKeyword(keyword);

    if (keyword.trim() === '') {
      setSearchResults([]);
      return;
    }

    const res = await api.get(`/friend/search?keyword=${keyword}`);
    setSearchResults(res.data);
  };

  // ---------------- FRIEND ACTIONS ----------------
  const sendRequest = async (username) => {
    await api.post(`/friend/add/${username}`);
    setMessage('Friend request sent');
    setSearchKeyword('');
    setSearchResults([]);
  };

  const acceptRequest = async (senderId) => {
    await api.post(`/friend/accept/${senderId}`);
    fetchFriends();
    fetchRequests();
  };

  const rejectRequest = async (senderId) => {
    await api.post(`/friend/reject/${senderId}`);
    fetchRequests();
  };

  const removeFriend = async (friendId) => {
    await api.post(`/friend/remove/${friendId}`);
    fetchFriends();
  };

  const openChat = (friendId) => {
    navigate(`/chat/${friendId}`);
  };

  // ---------------- UI ----------------
  return (
    <div>
      <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#333' }}>Friends</h2>

      {/* 🔍 SEARCH BAR */}
      <h3 style={{ borderBottom: '2px solid var(--color-primary-blue)', paddingBottom: '10px', marginBottom: '20px' }}>Search Users</h3>
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchKeyword}
        onChange={(e) => searchUsers(e.target.value)}
        style={styles.searchInput}
      />

      {/* SEARCH RESULTS */}
      <div style={styles.cardContainer}>
        {searchResults.map((user) => (
          <div key={user.id} className="card" style={styles.card}>
            <img src={user.imageUrl || 'https://via.placeholder.com/80'} alt={user.name} style={styles.profileImage} />
            <div style={styles.cardInfo}>
              <h4 style={styles.name}>{user.name}</h4>
              <p style={styles.bio}>
                {user.bio && user.bio.length > 25 ? user.bio.substring(0, 25) + '...' : user.bio}
              </p>
              <p style={{ margin: '10px 0', fontSize: '14px', color: '#555' }}>
                Status: <span style={{ fontWeight: '600' }}>{user.friendStatus}</span>
              </p>

              {/* Actions */}
              {user.friendStatus === 'NOT_FRIEND' && (
                <button onClick={() => sendRequest(user.name)} className="btn btn-primary" style={{ width: '100%' }}>Add Friend</button>
              )}

              {user.friendStatus === 'REQUEST_SENT' && <span style={{ color: 'var(--color-primary-orange)' }}> ⏳ Request Sent</span>}

              {user.friendStatus === 'REQUEST_RECEIVED' && (
                <button onClick={() => acceptRequest(user.id)} className="btn btn-primary" style={{ width: '100%' }}>Accept</button>
              )}

              {user.friendStatus === 'FRIEND' && (
                <button onClick={() => openChat(user.id)} className="btn btn-secondary" style={{ width: '100%' }}>
                  💬 Message
                </button>
              )}
            </div>
          </div>
        ))}
        {searchResults.length === 0 && searchKeyword && <p>No users found.</p>}
      </div>

      {/* FRIEND REQUESTS */}
      {requests.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ borderBottom: '2px solid var(--color-accent-coral)', paddingBottom: '10px', marginBottom: '20px' }}>Friend Requests</h3>
          <div style={styles.cardContainer}>
            {requests.map((req) => (
              <div key={req.id} className="card" style={{ ...styles.card, borderColor: 'var(--color-accent-coral)' }}>
                 <h4 style={styles.name}>{req.name}</h4>
                 <p style={{ fontSize: '0.9rem', color: '#666' }}>{req.email}</p>
                 <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                   <button onClick={() => acceptRequest(req.id)} className="btn btn-primary" style={{ flex: 1, padding: '5px' }}>Accept</button>
                   <button onClick={() => rejectRequest(req.id)} className="btn" style={{ flex: 1, padding: '5px', border: '1px solid #ccc', background: 'white' }}>Reject</button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FRIEND LIST */}
      <h3 style={{ marginTop: '40px', borderBottom: '2px solid var(--color-primary-green)', paddingBottom: '10px', marginBottom: '20px' }}>My Friends</h3>
      {friends.length === 0 ? <p>You have no friends yet. Search for someone!</p> : (
        <div style={styles.cardContainer}>
          {friends.map((friend) => (
            <div key={friend.id} className="card" style={styles.card}>
              <img src={friend.imageUrl || 'https://via.placeholder.com/80'} alt={friend.name} style={styles.profileImage} />
              <h4 style={styles.name}>{friend.name}</h4>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>{friend.email}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={() => openChat(friend.id)} className="btn btn-secondary" style={{ flex: 1, padding: '5px' }}>Message</button>
                <button onClick={() => removeFriend(friend.id)} className="btn" style={{ flex: 1, padding: '5px', color: 'red', background: 'transparent', border: '1px solid red' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#333', color: 'white', padding: '10px 20px', borderRadius: '5px' }}>{message}</div>}
    </div>
  );
}

const styles = {
  searchInput: {
    padding: '15px',
    width: '100%',
    marginBottom: '20px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid #ccc',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
  card: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px'
  },
  profileImage: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '15px',
    border: '3px solid var(--color-bg-light)'
  },
  cardInfo: {
    width: '100%',
  },
  name: {
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: '5px 0',
    color: 'var(--color-text-primary)'
  },
  bio: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    margin: '5px 0',
  },
};

export default Friends;
