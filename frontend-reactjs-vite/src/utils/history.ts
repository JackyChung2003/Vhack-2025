import { createBrowserHistory } from 'history';

// Create browser history that doesn't use hash
const history = createBrowserHistory({
  basename: '/Vhack-2025'
});

export default history; 