import { Outlet, Navigate } from 'react-router-dom'

import NavigationBar from '@/mycomponents/NavigationBar';
import { getLoggedInUser } from '../utils/utils';

const RouteAdmin = () => {
    const user = getLoggedInUser();
    return(
        user && user?.roleId == 1 ? 
            <main>
            <NavigationBar />
            <Outlet/>
            </main>
            : 
            <Navigate to="/" />
    )
}

export default RouteAdmin