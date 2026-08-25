import React from 'react';
import { SuperAdminProvider, useSuperAdmin } from './context/SuperAdminContext';
import { SuperAdminLayout } from './components/superadmin/SuperAdminLayout';
import { TenantWorkspaceApp } from './components/tenant/TenantWorkspaceApp';
import { LoginPage } from './components/auth/LoginPage';

const AppContent: React.FC = () => {
  const { currentUser, activeTenant } = useSuperAdmin();

  // 1. If not authenticated, render Login Page with logo
  if (!currentUser) {
    return <LoginPage />;
  }

  // 2. If client organization is active (or super admin is in tenant workspace)
  if (activeTenant) {
    return <TenantWorkspaceApp tenant={activeTenant} />;
  }

  // 3. Otherwise, render SaaS Super Admin Control Plane
  return <SuperAdminLayout />;
};

function App() {
  return (
    <SuperAdminProvider>
      <AppContent />
    </SuperAdminProvider>
  );
}

export default App;
