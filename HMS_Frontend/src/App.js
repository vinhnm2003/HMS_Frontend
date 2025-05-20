import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Documents from './components/Documents/Documents';
import Surveys from './components/Surveys/Surveys';
import Tasks from './components/Tasks/Tasks';
import Inventory from './components/Inventory/Inventory';
import HonorBoard from './components/HonorBoard/HonorBoard';
import './App.css';
import Homepage from './components/Homepage/Homepage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Homepage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="documents" element={<Documents />} />
        <Route path="surveys" element={<Surveys />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="honor-board" element={<HonorBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
