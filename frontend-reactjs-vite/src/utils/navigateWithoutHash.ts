import { NavigateFunction } from 'react-router-dom';

/**
 * Navigate to a path without using hash routing
 * @param navigate The navigate function from useNavigate
 * @param path The path to navigate to
 * @param options Navigation options
 */
export const navigateWithoutHash = (
  navigate: NavigateFunction,
  path: string,
  options?: { replace?: boolean; state?: any }
) => {
  // Always use replace to prevent hash from appearing
  navigate(path, { 
    replace: true, 
    ...options 
  });
  
  // Just in case, also use history API directly
  if (options?.replace) {
    window.history.replaceState(
      options?.state || null,
      '',
      window.location.origin + '/Vhack-2025' + path
    );
  }
}; 