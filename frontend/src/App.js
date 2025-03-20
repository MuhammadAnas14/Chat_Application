import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./components/LoginPage";
import ChatApplication from "./components/ChatApplication";
import SignupPage from "./components/SignupPage";

const App = () => {
    const user = useSelector((state) => state.auth.user);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/chat" element={user ? <ChatApplication /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
                <Route path="/signup" element={<SignupPage />} />
            </Routes>
        </Router>
    );
};

export default App;
