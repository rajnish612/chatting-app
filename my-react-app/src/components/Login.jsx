import React from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);

  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      console.log("Login successful:", data);
      navigate("/home");
    },
    onError: (err) => {
      console.error("Login error:", err);
      alert("Login failed: " + err.message);
      setLoading(false);
    }
  });

  function handleChange(e) {
    e.preventDefault();
    const { name, value } = e.target;

    setForm((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      return alert("Please fill all fields");
    }
    
    setLoading(true);
    try {
      await loginMutation({
        variables: {
          email: form.email,
          password: form.password
        }
      });
    } catch (error) {
      // Error is handled in onError callback
      setLoading(false);
    }
  }

  return (
    <>
      {/* Inline Styles for Animations */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        .simple-bg {
          background: #f8fafc;
        }


        .simple-card {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .input-glow {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(100, 116, 139, 0.2);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .input-glow:focus {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
          outline: none;
        }

        .btn-premium {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8, #2563eb);
          background-size: 200% 200%;
          animation: gradientPulse 3s ease infinite;
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.2);
          transition: all 0.3s ease;
        }

        .btn-premium:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
        }

        @keyframes gradientPulse {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .logo-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.3),
            0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1);
          animation: logoFloat 4s ease-in-out infinite;
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .slide-up {
          animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in {
          animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .chat-icon-bounce {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>

      <div className="simple-bg w-screen flex justify-center items-center gap-8 flex-col overflow-x-hidden h-screen relative p-4">

        {/* Logo Section with Enhanced Styling */}
        <div className="fade-in mt-20 flex gap-5 font-bold text-gray-800 text-4xl lg:text-6xl md:text-5xl items-center logo-glow">
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: "900" }}>
            CHAT ME
          </span>
          <div className="chat-icon-bounce bg-blue-500/10 p-3 rounded-full backdrop-blur-sm border border-blue-200">
            <img
              className="w-10 h-10 lg:w-12 lg:h-12 md:w-11 md:h-11 filter grayscale-0"
              src="/images/chat.png"
              alt="Chat icon"
            />
          </div>
        </div>

        {/* Enhanced Login Card */}
        <div className="slide-up simple-card max-w-md w-full mx-4 p-8 rounded-xl gap-8 flex flex-col justify-center items-center">
          {/* Header */}
          <div className="w-full text-center">
            <span className="text-3xl lg:text-4xl md:text-4xl font-black text-gray-800 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
            <p className="text-gray-600 mt-2 font-medium">
              Sign in to continue your journey
            </p>
          </div>

          {/* Enhanced Form */}
          <form className="flex w-full justify-center gap-6 items-center flex-col">
            {/* Email Input with Enhanced Styling */}
            <div className="relative w-full">
              <input
                onChange={handleChange}
                name="email"
                value={form.email}
                className="input-glow rounded-2xl w-full px-6 py-4 text-gray-800 font-medium placeholder-gray-500 text-lg focus:placeholder-gray-400"
                placeholder="Enter your email"
                type="email"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
            </div>

            {/* Password Input with Enhanced Styling */}
            <div className="relative w-full">
              <input
                onChange={handleChange}
                name="password"
                value={form.password}
                className="input-glow rounded-2xl w-full px-6 py-4 text-gray-800 font-medium placeholder-gray-500 text-lg focus:placeholder-gray-400"
                placeholder="Enter your password"
                type="password"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`btn-premium w-full px-8 py-4 text-white font-bold rounded-2xl text-lg cursor-pointer border-none ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Sign In"
              type="submit"
            >
              <span className="flex items-center justify-center gap-3">
                {loading ? "Signing In..." : "Sign In"}
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                )}
              </span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="w-full text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <span 
                onClick={() => navigate("/register")}
                className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors"
              >
                Sign up
              </span>
            </p>
            <p className="text-gray-500 text-xs cursor-pointer hover:text-gray-700 transition-colors">
              Forgot your password?
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default Login;
