import React, { useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import { loginSuccess,loginFailure,loginStart } from "../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);


    const validateForm = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Email is required!";
        if (!password.trim()) newErrors.password = "Password is required!";
        setError(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        dispatch(loginStart());
        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                dispatch(loginSuccess(data.user));
                navigate("/chat");
            } else {
                dispatch(loginFailure(data.message));
            }
        } catch (err) {
            dispatch(loginFailure("Server error, please try again!"));
        }
    };


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
            <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
           
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    className={`w-full px-4 py-2 border rounded focus:outline-none ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                
                <input
                    type="password"
                    placeholder="Password"
                    className={`w-full px-4 py-2 border rounded focus:outline-none ${errors.password ? "border-red-500" : "border-gray-300"}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

                {errors && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "LOGIN"}
                </button>
            </form>
            <p className="text-center mt-4 text-gray-500">
                Don't have an account? <Link to="/signup" className="text-blue-500">Sign Up</Link>
            </p>
        </div>
    </div>
    );
};

export default LoginPage;
