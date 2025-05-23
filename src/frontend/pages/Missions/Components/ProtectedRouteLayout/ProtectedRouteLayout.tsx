import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIdentityKit } from "@nfid/identitykit/react";
import MainLayout from '../MainLayout/MainLayout.tsx';

const ProtectedRouteLayout: React.FC = () => {
    const { identity, user } = useIdentityKit();
    const location = useLocation();

    // Define what "authenticated" means for your application
    // This usually means having a valid user object and identity, and the principal is not the anonymous one.
    const isAuthenticated = !!(user?.principal && user.principal.toText() !== "2vxsx-fae" && identity);

    if (!isAuthenticated) {
        // If not authenticated, redirect to /konnect, passing the intended location
        // so that Home.tsx can redirect back after successful login.
        return <Navigate to="/konnect" state={{ from: location }} replace />;
    }

    // If authenticated, render the MainLayout which contains the Outlet for nested protected routes
    return <MainLayout />;
};

export default ProtectedRouteLayout;