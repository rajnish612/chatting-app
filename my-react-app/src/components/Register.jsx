import React from "react";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePassword } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import { useCallback } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $username: String!) {
    register(email: $email, password: $password, username: $username)
  }
`;

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = React.useState(false);

  const [registerMutation] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      console.log("Registration successful:", data);
      alert("Registration successful! Please login.");
      navigate("/login");
    },
    onError: (err) => {
      console.error("Registration error:", err);
      alert("Registration failed: " + err.message);
      setLoading(false);
    }
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (
        !form.email ||
        !form.password ||
        !form.username ||
        !form.confirmPassword
      ) {
        return alert("Please fill all fields");
      } else if (form.password !== form.confirmPassword) {
        return alert("Passwords do not match");
      }

      setLoading(true);
      try {
        await registerMutation({
          variables: {
            email: form.email,
            password: form.password,
            username: form.username
          }
        });
      } catch (error) {
        // Error is handled in onError callback
        setLoading(false);
      }
    },
    [form, registerMutation]
  );

  const handleChange = useCallback(
    (e) => {
      e.preventDefault();
      const { name, value } = e.target;
      setForm((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    },
    [setForm]
  );

  console.log(form);

  return (
    <>
      {/* Inline Styles for Animations */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        .gradient-bg {
          background: linear-gradient(
            -45deg,
            #f8fafc,
            #e2e8f0,
            #f1f5f9,
            #ffffff,
            #f0f9ff
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          background: rgba(100, 116, 139, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .particle:nth-child(1) {
          width: 80px;
          height: 80px;
          left: 5%;
          top: 15%;
          animation-delay: 0s;
        }
        .particle:nth-child(2) {
          width: 120px;
          height: 120px;
          right: 5%;
          top: 25%;
          animation-delay: 2s;
        }
        .particle:nth-child(3) {
          width: 60px;
          height: 60px;
          left: 80%;
          top: 70%;
          animation-delay: 4s;
        }
        .particle:nth-child(4) {
          width: 100px;
          height: 100px;
          right: 75%;
          top: 80%;
          animation-delay: 1s;
        }
        .particle:nth-child(5) {
          width: 40px;
          height: 40px;
          left: 40%;
          top: 10%;
          animation-delay: 3s;
        }
        .particle:nth-child(6) {
          width: 90px;
          height: 90px;
          left: 15%;
          top: 60%;
          animation-delay: 5s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 116, 139, 0.2);
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.05);
        }

        .input-container {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(100, 116, 139, 0.2);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .input-container:focus-within {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.2);
          transform: translateY(-2px);
        }

        .input-container input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          padding: 0;
        }

        .btn-premium {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8, #2563eb);
          background-size: 200% 200%;
          animation: gradientPulse 3s ease infinite;
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.2);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
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

        .stagger-animation:nth-child(1) {
          animation-delay: 0.1s;
        }
        .stagger-animation:nth-child(2) {
          animation-delay: 0.2s;
        }
        .stagger-animation:nth-child(3) {
          animation-delay: 0.3s;
        }
        .stagger-animation:nth-child(4) {
          animation-delay: 0.4s;
        }

        .icon-pulse {
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>

      <div className="gradient-bg w-screen flex justify-center items-center flex-col gap-6 overflow-x-hidden h-screen relative">
        {/* Floating Particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <motion.div
          className="w-full flex justify-center items-center flex-col gap-6 overflow-x-hidden h-full"
          initial={{ opacity: 0, width: 0 }}
          transition={{ duration: 4, delay: 0.5 }}
          animate={{ opacity: 1, width: "100%" }}
        >
          {/* Enhanced Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="fade-in mt-12 flex gap-5 font-bold text-gray-800 text-4xl lg:text-6xl md:text-5xl items-center logo-glow"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: "900" }}
          >
            CHAT ME
            <div className="chat-icon-bounce bg-blue-500/10 p-3 rounded-full backdrop-blur-sm border border-blue-200">
              <img
                className="w-10 h-10 lg:w-12 lg:h-12 md:w-11 md:h-11"
                src="/images/chat.png"
                alt="Chat icon"
              />
            </div>
          </motion.div>

          {/* Enhanced Register Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="slide-up glass-card max-w-lg w-full mx-4 p-8 rounded-3xl gap-8 flex flex-col justify-center items-center shadow-2xl"
          >
            {/* Header */}
            <div className="w-full text-center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl lg:text-4xl md:text-4xl font-black text-gray-800 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent"
              >
                Create Account
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600 mt-2 font-medium"
              >
                Join our community today
              </motion.p>
            </div>

            {/* Enhanced Form */}
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
              className="flex w-full justify-center gap-6 items-center flex-col"
            >
              {/* Email Input */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="input-container stagger-animation flex w-full items-center gap-4 rounded-2xl px-6 py-4"
              >
                <MdOutlineMail className="text-blue-500 text-xl icon-pulse flex-shrink-0" />
                <input
                  onChange={handleChange}
                  name="email"
                  value={form.email}
                  className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                  placeholder="Enter your email"
                  type="email"
                  required
                />
              </motion.div>

              {/* Username Input */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="input-container stagger-animation flex w-full items-center gap-4 rounded-2xl px-6 py-4"
              >
                <CiUser className="text-green-500 text-xl icon-pulse flex-shrink-0" />
                <input
                  onChange={handleChange}
                  name="username"
                  value={form.username}
                  className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                  placeholder="Choose a username"
                  type="text"
                  required
                />
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="input-container stagger-animation flex w-full items-center gap-4 rounded-2xl px-6 py-4"
              >
                <MdOutlinePassword className="text-purple-500 text-xl icon-pulse flex-shrink-0" />
                <input
                  onChange={handleChange}
                  name="password"
                  value={form.password}
                  className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                  placeholder="Create password"
                  type="password"
                  required
                />
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="input-container stagger-animation flex w-full items-center gap-4 rounded-2xl px-6 py-4"
              >
                <MdOutlinePassword className="text-red-500 text-xl icon-pulse flex-shrink-0" />
                <input
                  onChange={handleChange}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                  placeholder="Confirm password"
                  type="password"
                  required
                />
              </motion.div>

              {/* Enhanced Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`btn-premium w-full px-8 py-4 text-white font-bold rounded-2xl text-lg mt-4 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                type="submit"
              >
                <span className="flex items-center justify-center gap-3">
                  {loading ? "Creating Account..." : "Create Account"}
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </motion.form>

            {/* Footer Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="w-full text-center space-y-3"
            >
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <span 
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors"
                >
                  Sign in
                </span>
              </p>
              <p className="text-gray-500 text-xs">
                By registering, you agree to our{" "}
                <span className="text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
                  Terms & Privacy Policy
                </span>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Decorative Elements */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-gray-200/40 rounded-full blur-2xl"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
          className="absolute top-1/2 right-5 w-16 h-16 bg-blue-300/20 rounded-full blur-xl"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.6, duration: 1 }}
          className="absolute top-1/4 left-1/4 w-12 h-12 bg-purple-200/30 rounded-full blur-lg"
        />
      </div>
    </>
  );
};

export default Register;
