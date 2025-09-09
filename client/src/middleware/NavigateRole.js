import { useNavigate } from 'react-router-dom';

export const useNavigationPermission = () => {
  const navigate = useNavigate();

  const navigatePermission = (deleted, userRole, requiredRole) => {
    if(deleted && userRole > requiredRole) navigate("/notFound", { replace: true });
  };

  return { navigatePermission };
};