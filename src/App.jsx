import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import { Dashboard, GroupsPage, GroupDetail, PersonalPage, ProfilePage, IndividualPage, IndividualChat, LoginPage, RegisterPage, ForgotPasswordPage } from './pages'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase'

const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/personal" element={<PersonalPage />} />
                  <Route path="/individual" element={<IndividualPage />} />
                  <Route path="/individual/:contactId" element={<IndividualChat />} />
                  <Route path="/groups" element={<GroupsPage />} />
                  <Route path="/groups/:groupId" element={<GroupDetail />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App