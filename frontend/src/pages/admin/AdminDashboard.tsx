import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Admin Dashboard</h1>
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Admin Dashboard</h2>
          <p className="text-neutral-600">Administrative tools coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
