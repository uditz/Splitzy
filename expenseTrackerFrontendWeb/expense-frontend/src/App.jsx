import React, { useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Friends from "./pages/Friends.jsx";
import CreateExpense from './pages/CreateExpense.jsx';
import ExpenseRequest from "./pages/ExpenseRequest.jsx";
import CreatedExpenses from './pages/CreatedExpenses.jsx';
import ExpenseParticipants from './pages/ExpenseParticipants.jsx';
import Chat from './pages/Chat.jsx';
import ChatWrapper from './pages/ChatWrapper.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Notifications from './pages/Notifications.jsx';
export const AuthContext = createContext();


function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);

  const setToken = (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, setToken, logout }}>
      <Router>
        <Routes>
          <Route path="/" element={!authToken ? <Home /> : <Navigate to="/dashboard" />} />
          
          <Route path="/login" element={!authToken ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!authToken ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Authenticated Routes wrapped in MainLayout */}
          <Route path="/dashboard" element={authToken ? <MainLayout><Dashboard /></MainLayout> : <Navigate to="/login" />} />
          <Route path="/friends" element={authToken ? <MainLayout><Friends /></MainLayout> : <Navigate to="/login" />} />
          
          <Route path="/create-expense" element={authToken ? <MainLayout><CreateExpense /></MainLayout> : <Navigate to="/login" />} />
          <Route path="/created-expenses" element={authToken ? <MainLayout><CreatedExpenses /></MainLayout> : <Navigate to="/login" />} />
          <Route path="/expense/:expenseId" element={authToken ? <MainLayout><ExpenseParticipants /></MainLayout> : <Navigate to="/login" />}/>
          <Route path="/expense-requests" element={authToken ? <MainLayout><ExpenseRequest /></MainLayout> : <Navigate to="/login" />} />
          <Route path="/notifications" element={authToken ? <MainLayout><Notifications /></MainLayout> : <Navigate to="/login" />} />
          
          <Route path="/chat" element={authToken ? <MainLayout><ChatWrapper /></MainLayout> : <Navigate to="/login" />} />
          <Route path="/chat/:friendId" element={authToken ? <MainLayout><ChatWrapper /></MainLayout> : <Navigate to="/login" />} />

        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
