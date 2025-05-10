import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ScanQR } from './pages/ScanQR';
import { useAuth } from './contexts/AuthContext';
import { Register } from './pages/Register';
import { BusinessList } from './pages/BusinessList';
import { BusinessProfile } from './pages/BusinessProfile';
import { BusinessForm } from './pages/BusinessForm';

const theme = extendTheme({
  direction: 'rtl',
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/businesses" element={<BusinessList />} />
              <Route path="/business/:id" element={<BusinessProfile />} />
              
              {/* Protected Routes */}
              <Route
                path="/scan"
                element={
                  <ProtectedRoute>
                    <ScanQR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/new"
                element={
                  <ProtectedRoute>
                    <BusinessForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business/edit/:id"
                element={
                  <ProtectedRoute>
                    <BusinessForm />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
