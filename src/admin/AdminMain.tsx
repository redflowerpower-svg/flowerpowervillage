import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminAuth } from './common/AdminAuth';
import { AdminHeader } from './common/AdminHeader';
import { ErrorBoundary } from './common/ErrorBoundary';
import { AdminGateway } from './gateway/AdminGateway';
import { PizzaDashboard } from './pizza/components/PizzaDashboard';
import { ResortDashboard } from './resort/components/ResortDashboard';
import DocumentReaderStudio from './components/DocumentReaderStudio';

export function AdminMain() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDept, setActiveDept] = useState<'gateway' | 'pizza' | 'resort' | 'docs'>('gateway');

  // Sync active dept from URL query param if present (?dept=pizza, ?dept=resort, or ?dept=docs)
  useEffect(() => {
    const deptParam = searchParams.get('dept');
    if (deptParam === 'pizza' || deptParam === 'resort' || deptParam === 'docs') {
      setActiveDept(deptParam);
    } else {
      setActiveDept('gateway');
    }
  }, [searchParams]);

  const handleSelectDept = (dept: 'gateway' | 'pizza' | 'resort' | 'docs') => {
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
          <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
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

            {activeDept === 'docs' && (
              <ErrorBoundary moduleName="Document Web Reader">
                <DocumentReaderStudio />
              </ErrorBoundary>
            )}
          </main>
        </div>
      )}
    </AdminAuth>
  );
}

export default AdminMain;
