import { Outlet, Navigate, useLocation } from 'react-router-dom'

import { isLoggedIn } from '../utils/utils';
import NavigationBar from '@/mycomponents/NavigationBar';

const ProtectedRoute = () => {
    const location = useLocation();

    const shouldHideNav = /^\/participants\/[^/]+\/experiments\/[^/]+$/.test(location.pathname);

    return (
        isLoggedIn() ?
            <main>
                {!shouldHideNav && <NavigationBar />}
                <main className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
                    <Outlet />
                </main>
            </main>
            :
            <Navigate to="/auth/login" />
    )
}

export default ProtectedRoute