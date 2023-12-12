import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CenterSystemContext from "./context/context";
import { useState } from "react";
import { UserDto } from "./DTOS/user.dto";
import UserTaskPage from "./pages/UserTaskPage";
import { TaskDto } from "./DTOS/task.dto";
import AdminPage from "./pages/AdminPage";
import { TaskAdminDto } from "./DTOS/taskAdmin.dto";

function App() {
  const [user, setUser] = useState<UserDto | undefined>(undefined);
  const [task, setTask] = useState<TaskDto | undefined>(undefined);
  const [taskAdmin, setTaskAdmin] = useState<TaskAdminDto | undefined>(
    undefined
  );

  return (
    <CenterSystemContext.Provider
      value={{
        user: user,
        setUser,
        task: task,
        setTask,
        taskAdmin: taskAdmin,
        setTaskAdmin,
      }}
    >
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              !user ? <LoginPage /> : <Navigate to="/user/tasks-page" replace />
            }
          />
          <Route
            path="/register"
            element={
              !user ? (
                <RegisterPage />
              ) : (
                <Navigate to="/user/tasks-page" replace />
              )
            }
          />
          <Route
            path="/user/tasks-page"
            element={user ? <UserTaskPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin/admin-page"
            element={user ? <AdminPage /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </CenterSystemContext.Provider>
  );
}

export default App;
