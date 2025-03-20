import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMessages, addMessage } from "../redux/chatSlice";
import { logout, setUsers } from "../redux/authSlice";
import io from "socket.io-client";
import { Canvas, useFrame } from "@react-three/fiber"; // Import useFrame
import { Sphere } from "@react-three/drei"; // Use Sphere from drei
import "tailwindcss/tailwind.css";

// Socket.io connection
const socket = io("http://localhost:5000");

const ChatApplication = () => {
    const messages = useSelector((state) => state.chat.messages);
    const users = useSelector((state) => state.auth.users);
    const currentUser = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [input, setInput] = useState("");
    const [recipient, setRecipient] = useState(null);
    const [animate, setAnimate] = useState(false); // Animation state
    const [scale, setScale] = useState(1); // Slightly bigger sphere size
    const [color, setColor] = useState("#00b5ff"); // Initial color of the sphere (blue shade)

    // Fetch Users from Backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5000/rpc", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        method: "getUsers",
                        params: [],
                        id: 1,
                    }),
                });
                const data = await response.json();
                dispatch(setUsers(data.result));
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [dispatch]);

    // Socket.io logic for receiving messages and sending messages
    useEffect(() => {
        if (currentUser) {
            socket.emit("register_user", currentUser.id); // Register user when the component is mounted
        }

        // Listen for incoming messages in real-time
        socket.on("receive_message", (msg) => {
            dispatch(addMessage(msg)); // Add received message to state
        });

        return () => {
            socket.off("receive_message"); // Clean up socket listener on component unmount
        };
    }, [currentUser, dispatch]);

    // Fetch messages for the current chat
    useEffect(() => {
        if (currentUser && recipient) {
            const fetchMessages = async () => {
                try {
                    const response = await fetch("http://localhost:5000/rpc", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            jsonrpc: "2.0",
                            method: "getMessages",
                            params: {
                                senderId: currentUser.id,
                                recipientId: recipient.id,
                            },
                            id: 1,
                        }),
                    });
                    const data = await response.json();
                    dispatch(setMessages(data.result)); // Load previous messages
                } catch (error) {
                    console.error("Error fetching messages:", error);
                }
            };

            fetchMessages();
        }
    }, [currentUser, recipient, dispatch]);

    const sendMessage = () => {
        if (!input.trim() || !recipient) return;

        const message = {
            senderId: currentUser.id,
            recipientId: recipient.id,
            text: input,
            time: new Date().toLocaleTimeString(),
        };

        socket.emit("send_message", message); // Emit the message to the server
        dispatch(addMessage(message)); // Add the message immediately to the state
        triggerAnimation(); // Trigger animation when a message is sent
        setInput(""); // Clear input field
    };

    const handleLogout = () => {
        dispatch(logout()); // Clear user state
        navigate("/login"); // Redirect to login page
    };

    const triggerAnimation = () => {
        setAnimate(true);
        setTimeout(() => {
            setAnimate(false); // Stop the animation after 3 seconds
        }, 3000); // Stop animation after 3 seconds
    };

    // Animated Sphere using React Three Fiber
    const AnimatedSphere = () => {
        const sphereRef = useRef(); // Ref for the sphere mesh

        // Handle the animation when a message is sent
        useFrame(() => {
            if (animate) {
                const newScale = Math.sin(Date.now() * 0.003) * 0.5 + 2; // Make it bigger (scale 2)
                setScale(newScale); // Update the scale dynamically
                if (sphereRef.current) {
                    sphereRef.current.scale.set(newScale, newScale, newScale);
                }
            }
        });

        return (
            <mesh ref={sphereRef}>
                <Sphere args={[1, 32, 32]} />
                <meshStandardMaterial color={color} /> {/* Use dynamic color */}
            </mesh>
        );
    };

    return (
        <div className="flex h-screen bg-[#F0F0F0] p-4 border-2 border-gray-300 rounded-lg relative">
            {/* Sidebar with logged-in user's name */}
            <div className="w-1/4 bg-white p-4 border-r shadow-lg rounded-lg">
                <div className="text-blue-600 text-xl font-bold mb-4 p-2 border-b border-blue-600">
                    {currentUser?.name}
                </div>
                <div className="space-y-2">
                    {users
                        .filter((user) => user.id !== currentUser.id) // Exclude logged-in user
                        .map((user) => (
                            <div
                                key={user.id}
                                className={`p-3 rounded-lg cursor-pointer text-blue-600 hover:bg-blue-100 transition-all duration-300 ease-in-out ${recipient?.id === user.id ? "bg-blue-200" : ""}`}
                                onClick={() => setRecipient(user)}
                            >
                                {user.name}
                            </div>
                        ))}
                </div>
            </div>

            {/* Chat Section */}
            <div className="flex flex-col flex-1 bg-white p-4 rounded-lg shadow-lg">
                <div className="bg-gradient-to-b from-blue-300 to-blue-400 text-white p-4 flex justify-between items-center shadow-md rounded-t-lg">
                    <h2 className="text-xl">{recipient ? recipient.name : "Select a User to Chat"}</h2>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 shadow-inner rounded-b-lg">
                    {messages
                        .filter(
                            (msg) =>
                                (msg.senderId === currentUser.id && msg.recipientId === recipient?.id) ||
                                (msg.senderId === recipient?.id && msg.recipientId === currentUser.id)
                        )
                        .map((msg, index) => (
                            <div
                                key={index}
                                className={`flex justify-${msg.senderId === currentUser.id ? "end" : "start"} my-2`}
                            >
                                <div
                                    className={`p-4 rounded-lg max-w-xs ${
                                        msg.senderId === currentUser.id
                                            ? "bg-blue-500 text-white rounded-l-lg"
                                            : "bg-white text-gray-800 rounded-r-lg"
                                    }`}
                                >
                                    <span className="font-semibold">
                                        {msg.senderId === currentUser.id ? "Me" : recipient?.name}
                                    </span>
                                    <p className="text-sm">{msg.text}</p>
                                    <small className="text-xs text-gray-400">{msg.time}</small>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="p-4 flex items-center space-x-2 border-t border-gray-300">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none"
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                        disabled={!input || !recipient}
                    >
                        Send
                    </button>
                </div>
            </div>

            {/* 3D Sphere animation - Positioning within the chat area */}
            {animate && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <Canvas className="h-32 w-32">
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 10]} intensity={1} />
                        <AnimatedSphere />
                    </Canvas>
                </div>
            )}
        </div>
    );
};

export default ChatApplication;
