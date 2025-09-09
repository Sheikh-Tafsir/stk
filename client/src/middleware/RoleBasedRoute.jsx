import { Outlet, Navigate } from 'react-router-dom'
import { getLoggedInUser } from '@/utils/utils';
import { USER_ROLE } from '@/utils/enums';

const RoleBasedRoute = ({ allowedRoles }) => {
    const user = getLoggedInUser();

    const effectiveRoles = allowedRoles.includes(USER_ROLE.ADMIN)
        ? [...allowedRoles, USER_ROLE.SUPER_ADMIN]
        : [...allowedRoles];

    return (
        effectiveRoles.includes(user.role) ?
            <Outlet />
            :
            <Navigate to="/" replace />
    )
}

export default RoleBasedRoute