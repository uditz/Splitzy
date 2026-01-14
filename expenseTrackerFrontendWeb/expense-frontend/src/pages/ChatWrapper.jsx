import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import React, { useContext } from 'react';
import Chat from './Chat';

export default function ChatWrapper() {
  const { friendId } = useParams();
  const { authToken } = useContext(AuthContext);
  const userId = parseInt(localStorage.getItem('userId')); // or fetch from backend

  return <Chat userId={userId} friendId={friendId ? parseInt(friendId) : null} />;
}