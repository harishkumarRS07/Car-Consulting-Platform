import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';

export default function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore();
  const isAdmin = user?.role === 'admin' && token;

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}
