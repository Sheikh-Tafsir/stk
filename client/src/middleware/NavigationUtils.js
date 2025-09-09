import { useNavigate } from 'react-router-dom';

export const useNavigationUtils = () => {
  const navigate = useNavigate();

  const navigateError = (error) => {
    //console.log(errorStatus);
    if(error?.response?.status == 401 || error?.response?.status == 404 
      || error?.response?.status == 500) navigate("/notFound", { replace: true });
  };

  return { navigateError };
};