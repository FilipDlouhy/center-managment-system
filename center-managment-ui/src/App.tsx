import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CenterSystemContext from "./context/context";
import { useState } from "react";
import { UserDto } from "./DTOS/user.dto";
import UserTaskPage from "./pages/UserTaskPage";

function App() {
  const [user, setUser] = useState<UserDto | undefined>(undefined);

  return (
    <CenterSystemContext.Provider
      value={{
        user: user,
        setUser,
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/user/task-page" element={<UserTaskPage />} />
        </Routes>
      </Router>
    </CenterSystemContext.Provider>
  );
}

export default App;
