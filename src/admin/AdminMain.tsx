import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminAuth } from './common/AdminAuth';
import { AdminHeader } from './common/AdminHeader';
import { ErrorBoundary } from './common/ErrorBoundary';
import { AdminGateway } from './gateway/AdminGateway';
import { PizzaDashboard } from './pizza/components/PizzaDashboard';
import { ResortDashboard } from './resort/components/ResortDashboard';

export function AdminMain() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDept, setActiveDept] = useState<'gateway' | 'pizza' | 'resort'>('gateway');

  // Sync active dept from URL query param if present (?dept=pizza or ?dept=resort)
  useEffect(() => {
    const deptParam = searchParams.get('dept');
    if (deptParam === 'pizza' || deptParam === 'resort') {
      setActiveDept(deptParam);
    } else {
      setActiveDept('gateway');
    }
  }, [searchParams]);

  const handleSelectDept = (dept: 'gateway' | 'pizza' | 'resort') => {
    setActiveDept(dept);
    if (dept === 'gateway') {
      setSearchParams({});
    } else {
      setSearchParams({ dept });
    }
  };

  return (
    <AdminAuth>
      {(session, handleLogout) => (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
          {/* Top Shared Admin Header */}
          <AdminHeader
            userEmail={session.user.email}
            activeDept={activeDept}
            onSelectDept={handleSelectDept}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {activeDept === 'gateway' && (
              <AdminGateway onSelectDepartment={(dept) => handleSelectDept(dept)} />
            )}

            {activeDept === 'pizza' && (
              <ErrorBoundary moduleName="Pizzeria Ranong">
                <PizzaDashboard />
              </ErrorBoundary>
            )}

            {activeDept === 'resort' && (
              <ErrorBoundary moduleName="Resort Koh Phayam">
                <ResortDashboard />
              </ErrorBoundary>
            )}
          </main>
        </div>
      )}
    </AdminAuth>
  );
}

export default AdminMain;
