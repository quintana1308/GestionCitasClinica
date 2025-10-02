import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientSidebar from '../components/ClientSidebar';
import ClientHeader from '../components/ClientHeader';
import ClientDashboard from '../components/client/ClientDashboard';
import MyAppointments from '../components/client/MyAppointments';
import MyProfile from '../components/client/MyProfile';
import MyPayments from '../components/client/MyPayments';
import BookAppointment from '../components/client/BookAppointment';

const ClientPortal: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <ClientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClientHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<ClientDashboard />} />
            <Route path="/appointments" element={<MyAppointments />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/payments" element={<MyPayments />} />
            <Route path="/profile" element={<MyProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ClientPortal;
