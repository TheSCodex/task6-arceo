import { useRoutes, BrowserRouter as Router, Navigate } from "react-router-dom";
import PropTypes from "prop-types" ;
import Login from "./pages/Login.jsx";
import Board from "./pages/Board.jsx";
import Canvas from "./pages/Canvas.jsx";

function ProtectedRoute({ element }) {
  const isAuthenticated = localStorage.getItem("authUser");
  return isAuthenticated ? element : <Navigate to="/" />;
}

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

const AppRoutes = () => {
  const routes = useRoutes([
    { path: "/", element: <Login /> },
    {
      path: "/board",
      element: <ProtectedRoute element={<Board />} />,
    },
    {
      path: "/canvas",
      element: <ProtectedRoute element={<Canvas />} />,
    },
  ]);
  return routes;
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
