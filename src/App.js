import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Test from "./components/inbox/chatbody/Test";
import PrivateRoute from "./components/Routes/PrivateRoute";
import PublicRoute from "./components/Routes/PublicRoute";
import useAuthCheck from "./hooks/useAuthCheck";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";

function App() {
  const authChecked = useAuthCheck();
  return !authChecked ? (
    <h1>Checking authentication</h1>
  ) : (
    <Router>
      <Routes>
        <Route path='*' element={<NotFound />} />
        <Route
          path='/'
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path='/register'
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path='/inbox'
          element={
            <PrivateRoute>
              <Conversation />
            </PrivateRoute>
          }
        />
        <Route
          path='/inbox/:id'
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          }
        />
        <Route
          path='/test'
          element={
            <PrivateRoute>
              <Test />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
