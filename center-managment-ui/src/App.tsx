import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CenterSystemContext from "./context/context";
import { useState, useEffect } from "react";
import { UserDto } from "./DTOS/user.dto";
import UserTaskPage from "./pages/UserTaskPage";
import { TaskDto } from "./DTOS/task.dto";
import { io } from "socket.io-client";

function App() {
  const [user, setUser] = useState<UserDto | undefined>(undefined);
  const [task, setTask] = useState<TaskDto | undefined>(undefined);
  useEffect(() => {
    const socket = io("http://localhost:3000"); // Replace with your WebSocket server URL

    socket.on("message", (data) => {
      console.log("Message from server:", data);
      // Handle the message. For example, update the task
      if (data.task) {
        setTask(data.task);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <CenterSystemContext.Provider
      value={{
        user: user,
        setUser,
        task: task,
        setTask,
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
        </Routes>
      </Router>
    </CenterSystemContext.Provider>
  );
}

export default App;
