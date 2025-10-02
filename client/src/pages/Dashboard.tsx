import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardHome from '../components/dashboard/DashboardHome';
import Appointments from '../components/dashboard/Appointments';
import Clients from '../components/dashboard/Clients';
import Treatments from '../components/dashboard/Treatments';
import Inventory from '../components/dashboard/Inventory';
import Payments from '../components/dashboard/Payments';
import Reports from '../components/dashboard/Reports';
import Settings from '../components/dashboard/Settings';

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/treatments" element={<Treatments />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
