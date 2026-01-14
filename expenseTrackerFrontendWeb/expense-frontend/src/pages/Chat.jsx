// src/pages/Chat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { connectToWebSocket, sendMessage, disconnectWebSocket } from '../services/socket';
import axios from 'axios';
import api from '../api';

function Chat({ userId, friendId }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null); // { conversationId, friendId, friendName, friendImageUrl }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1) Fetch all conversations (Sidebar)
  useEffect(() => {
    axios.get('http://localhost:8080/chat/getConversations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then((res) => {
      setConversations(res.data);
    }).catch(err => console.error("Error fetching conversations:", err));
  }, []);

  // 1.5) Auto-select conversation if friendId is provided
  useEffect(() => {
    if (!friendId) return;

    // Check if we already have this friend in the list
    const existingConv = conversations.find(c => String(c.friendId) === String(friendId));

    if (existingConv) {
        setActiveConversation(existingConv);
    } else {
        // If not in list, fetch basic friend info and "mock" a conversation object
        // so the user can start chatting immediately.
        // The backend will create/get the real conversation ID when we send a message or initial fetch
        api.get(`/public/user/${friendId}`)
           .then(res => {
                // We need the conversationID to fetch history even if empty
                // So let's ask the backend for the conversationId (create if not exists)
                axios.get(`http://localhost:8080/chat/conversation/${friendId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }).then(convRes => {
                    const newConv = {
                        conversationId: convRes.data,
                        friendId: friendId,
                        friendName: res.data.name,
                        friendImageUrl: res.data.imageUrl
                    };
                    setActiveConversation(newConv);
                    // Optionally add to list so sidebar updates immediately
                    setConversations(prev => {
                        if(prev.find(c => c.conversationId === newConv.conversationId)) return prev;
                        return [newConv, ...prev];
                    });
                });
           })
           .catch(err => console.error("Could not fetch friend data", err));
    }
  }, [friendId, conversations.length]); // depend on conversations list loading

  // 2) Load history when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    // Disconnect previous socket
    disconnectWebSocket();

    axios.get(`http://localhost:8080/chat/history/${activeConversation.conversationId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then((res) => {
      setMessages(res.data);
      scrollToBottom();
    });

    // 3) Connect WebSocket for this conversation
    const onMessageReceived = (msg) => {
      console.log("📩 Incoming message:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    connectToWebSocket(activeConversation.conversationId, onMessageReceived);

    return () => disconnectWebSocket();
  }, [activeConversation]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeConversation) return;

    sendMessage(activeConversation.conversationId, activeConversation.friendId, newMessage);
    setNewMessage('');
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '85vh', 
      maxWidth: '1200px', 
      margin: '20px auto', 
      backgroundColor: '#fff', 
      borderRadius: '16px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      fontFamily: '"Outfit", sans-serif' 
    }}>
      
      {/* Sidebar: User List */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid #f0f0f0', 
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a1a' }}>Chats</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((conv) => (
            <div 
              key={conv.conversationId}
              onClick={() => setActiveConversation(conv)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 20px',
                cursor: 'pointer',
                backgroundColor: activeConversation?.conversationId === conv.conversationId ? '#eef2ff' : 'transparent',
                borderLeft: activeConversation?.conversationId === conv.conversationId ? '4px solid var(--color-primary-blue)' : '4px solid transparent',
                transition: 'background-color 0.2s'
              }}
            >
              <img 
                src={conv.friendImageUrl || "https://via.placeholder.com/50"} 
                alt={conv.friendName} 
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{conv.friendName}</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#888' }}>Tap to chat</p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No conversations yet. Start a chat from Friends list.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeConversation ? (
          <>
            {/* Header */}
            <div style={{ 
              padding: '15px 25px', 
              borderBottom: '1px solid #f0f0f0', 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: '#fff'
            }}>
               <img 
                src={activeConversation.friendImageUrl || "https://via.placeholder.com/45"} 
                alt={activeConversation.friendName} 
                style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px' }}
              />
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{activeConversation.friendName}</h3>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              padding: '25px', 
              overflowY: 'auto', 
              backgroundColor: '#f4f6f8',
              backgroundImage: 'radial-gradient(#e3e8eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}>
               {messages.map((msg, index) => {
                const isMe = String(msg.senderId) === String(userId);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                      marginBottom: '15px'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 18px',
                      borderRadius: '18px',
                      backgroundColor: isMe ? 'var(--color-primary-blue)' : '#fff',
                      color: isMe ? 'white' : '#333',
                      borderBottomRightRadius: isMe ? '4px' : '18px',
                      borderBottomLeftRadius: isMe ? '18px' : '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '30px',
                    border: '1px solid #e1e4e8',
                    outline: 'none',
                    fontSize: '1rem',
                    backgroundColor: '#f8f9fa'
                  }}
                />
                <button 
                  onClick={handleSend}
                  style={{
                    padding: '14px 28px',
                    borderRadius: '30px',
                    backgroundColor: 'var(--color-primary-blue)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#aaa' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💬</div>
            <p style={{ fontSize: '1.2rem' }}>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
