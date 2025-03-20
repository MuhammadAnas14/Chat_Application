import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Canvas, useFrame } from "@react-three/fiber";


// / 3D Animated Rotating Cube Component
const RotatingCube = () => {
    const cubeRef = useRef();

    useFrame(() => {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;
    });

    return (
        <mesh ref={cubeRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="green" />
        </mesh>
    );
};


const SignupPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: uuidv4(), // Generate unique ID for each user
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [showPopup, setShowPopup] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.password.trim()) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.status === 200) {
                dispatch(loginSuccess(formData)); // Save user in Redux
                setShowPopup(true); // Show success popup

                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    setShowPopup(false);
                    navigate("/login");
                }, 3000);
            } else {
                setErrors({ form: data.message });
            }
        } catch (error) {
            console.error("Signup failed:", error);
            setErrors({ form: "Something went wrong. Try again!" });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 relative">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            className={`w-full px-4 py-2 border rounded-lg ${errors.name ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    {/* Email Input */}
                    <div className="mb-4">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className={`w-full px-4 py-2 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className={`w-full px-4 py-2 border rounded-lg ${errors.password ? "border-red-500" : "border-gray-300"}`}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div className="mb-4">

                        {errors && <p className="text-red-500 text-sm">{errors.form}</p>}
                    </div>

                    {/* Signup Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:opacity-90 transition"
                    >
                        Sign Up
                    </button>
                </form>

                {/* Already have an account */}
                <p className="text-center mt-4 text-gray-600">
                    Already have an account? <a href="/login" className="text-blue-500">Login</a>
                </p>
            </div>
            {/* Success Popup with Animated 3D Cube */}
            {showPopup && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center relative space-y-4">
                        <Canvas style={{ width: 120, height: 120 }}>
                            <ambientLight />
                            <pointLight position={[10, 10, 10]} />
                            <RotatingCube />
                        </Canvas>
                        <p className="text-green-600 text-lg font-bold mt-4">
                            Sign Up Successful!
                        </p>
                        <p className="text-gray-600 mt-2">You can now login.</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SignupPage;
