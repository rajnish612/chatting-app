import React from "react";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePassword } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import { FaUserTag, FaQuoteLeft } from "react-icons/fa";
import { useCallback } from "react";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import Modal from "@mui/material/Modal";

const SEND_REGISTRATION_OTP = gql`
  mutation SendRegistrationOTP($email: String!, $password: String!, $username: String!, $name: String, $bio: String) {
    sendRegistrationOTP(email: $email, password: $password, username: $username, name: $name, bio: $bio)
  }
`;

const VERIFY_REGISTRATION_OTP = gql`
  mutation VerifyRegistrationOTP($email: String!, $otp: String!) {
    verifyRegistrationOTP(email: $email, otp: $otp)
  }
`;

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    email: "",
    password: "",
    username: "",
    name: "",
    bio: "",
    confirmPassword: "",
    otp: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(1); // 1: Registration form, 2: OTP verification
  const [otpSent, setOtpSent] = React.useState(false);

  const [sendOtpMutation] = useMutation(SEND_REGISTRATION_OTP, {
    onCompleted: (data) => {
      console.log("OTP sent:", data);
      setOtpSent(true);
      setStep(2);
      setLoading(false);
      alert("OTP sent to your email! Please check your inbox.");
    },
    onError: (err) => {
      console.error("Send OTP error:", err);
      alert("Failed to send OTP: " + err.message);
      setLoading(false);
    },
  });

  const [verifyOtpMutation] = useMutation(VERIFY_REGISTRATION_OTP, {
    onCompleted: (data) => {
      console.log("Registration completed:", data);
      alert("Registration successful! Please login.");
      navigate("/login");
    },
    onError: (err) => {
      console.error("OTP verification error:", err);
      alert("OTP verification failed: " + err.message);
      setLoading(false);
    },
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      
      if (step === 1) {
        // First step: Send OTP
        if (
          !form.email ||
          !form.password ||
          !form.username ||
          !form.confirmPassword
        ) {
          return alert("Please fill all required fields");
        } else if (form.password !== form.confirmPassword) {
          return alert("Passwords do not match");
        }

        setLoading(true);
        try {
          await sendOtpMutation({
            variables: {
              email: form.email,
              password: form.password,
              username: form.username,
              name: form.name || form.username,
              bio: form.bio || "",
            },
          });
        } catch (error) {
          // Error is handled in onError callback
          setLoading(false);
        }
      } else if (step === 2) {
        // Second step: Verify OTP
        if (!form.otp) {
          return alert("Please enter the OTP");
        }

        setLoading(true);
        try {
          await verifyOtpMutation({
            variables: {
              email: form.email,
              otp: form.otp,
            },
          });
        } catch (error) {
          // Error is handled in onError callback
          setLoading(false);
        }
      }
    },
    [form, sendOtpMutation, verifyOtpMutation, step]
  );

  const handleBackToForm = useCallback(() => {
    setStep(1);
    setOtpSent(false);
    setForm(prev => ({ ...prev, otp: "" }));
  }, []);

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

        .simple-bg {
          background: #f8fafc;
        }


        .simple-card {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .input-container {
          background: white;
          border: 2px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .input-container:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-container input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          padding: 0;
        }

        .btn-premium {
          background: #3b82f6;
          border: none;
          cursor: pointer;
        }

        .btn-premium:hover {
          background: #2563eb;
        }
      `}</style>

      <div className="simple-bg w-screen flex justify-center items-center flex-col gap-6 overflow-x-hidden h-screen relative p-4">

        <div className="w-full flex justify-center items-center flex-col gap-6 overflow-x-hidden h-full">
          {/* Enhanced Logo Section */}
          <div
            className="mt-12 flex gap-5 font-bold text-gray-800 text-4xl lg:text-6xl md:text-5xl items-center"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: "900" }}
          >
            CHAT ME
            <div className="bg-blue-500/10 p-3 rounded-full backdrop-blur-sm border border-blue-200">
              <img
                className="w-10 h-10 lg:w-12 lg:h-12 md:w-11 md:h-11"
                src="/images/chat.png"
                alt="Chat icon"
              />
            </div>
          </div>

          {/* Enhanced Register Card */}
          <div
            className="simple-card max-w-lg w-full mx-4 p-6 rounded-xl gap-4 flex flex-col justify-center items-center"
          >
            {/* Header */}
            <div className="w-full text-center">
              <span
                className="text-2xl lg:text-3xl md:text-3xl font-black text-gray-800 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent"
              >
                {step === 1 ? "Create Account" : "Verify Email"}
              </span>
              <p
                className="text-gray-600 mt-1 font-medium text-sm"
              >
                {step === 1 ? "Join our community today" : "Enter the OTP sent to your email"}
              </p>
            </div>

            {/* Enhanced Form */}
            <form
              className="flex w-full justify-center gap-3 items-center flex-col"
            >
              {step === 1 ? (
                <>
                  {/* Registration Form Fields */}
                  {/* Email Input */}
                  <div
                    className="input-container flex w-full items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <MdOutlineMail className="text-blue-500 text-xl flex-shrink-0" />
                    <input
                      onChange={handleChange}
                      name="email"
                      value={form.email}
                      className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                      placeholder="Enter your email"
                      type="email"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Username Input */}
                  <div
                    className="input-container flex w-full items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <CiUser className="text-green-500 text-xl flex-shrink-0" />
                    <input
                      onChange={handleChange}
                      name="username"
                      value={form.username}
                      className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                      placeholder="Choose a username"
                      type="text"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Name Input */}
                  <div
                    className="input-container flex w-full items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <FaUserTag className="text-orange-500 text-xl flex-shrink-0" />
                    <input
                      onChange={handleChange}
                      name="name"
                      value={form.name}
                      className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                      placeholder="Enter your full name (optional)"
                      type="text"
                      disabled={loading}
                    />
                  </div>

                  {/* Bio Input */}
                  <div
                    className="input-container flex w-full items-start gap-3 rounded-xl px-4 py-3"
                  >
                    <FaQuoteLeft className="text-indigo-500 text-xl flex-shrink-0 mt-1" />
                    <textarea
                      onChange={handleChange}
                      name="bio"
                      value={form.bio}
                      className="text-gray-800 font-medium placeholder-gray-500 text-lg resize-none"
                      placeholder="Tell us about yourself (optional)"
                      rows="2"
                      maxLength="200"
                      disabled={loading}
                    />
                  </div>

                  {/* Password Input */}
                  <div
                    className="input-container flex w-full items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <MdOutlinePassword className="text-purple-500 text-xl flex-shrink-0" />
                    <input
                      onChange={handleChange}
                      name="password"
                      value={form.password}
                      className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                      placeholder="Create password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Confirm Password Input */}
                  <div
                    className="input-container flex w-full items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <MdOutlinePassword className="text-red-500 text-xl flex-shrink-0" />
                    <input
                      onChange={handleChange}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      className="text-gray-800 font-medium placeholder-gray-500 text-lg"
                      placeholder="Confirm password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* OTP Verification Form */}
                  <div className="w-full text-center mb-4">
                    <p className="text-gray-600 text-sm">
                      We sent a 6-digit verification code to:
                    </p>
                    <p className="text-blue-600 font-semibold">{form.email}</p>
                  </div>

                  {/* OTP Input */}
                  <div
                    className="input-container flex w-full items-center gap-3 rounded-xl px-4 py-3"
                  >
                    <svg className="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <input
                      onChange={handleChange}
                      name="otp"
                      value={form.otp}
                      className="text-gray-800 font-medium placeholder-gray-500 text-lg text-center tracking-widest"
                      placeholder="Enter 6-digit OTP"
                      type="text"
                      maxLength="6"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Back to Form Button */}
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    disabled={loading}
                  >
                    ← Back to registration form
                  </button>
                </>
              )}

              {/* Enhanced Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`btn-premium !w-full !px-6 !py-3 !text-white !font-bold !rounded-xl !text-base !mt-3 ${
                  loading ? "!opacity-50 !cursor-not-allowed" : ""
                }`}
                type="submit"
              >
                <span className="flex items-center justify-center gap-3">
                  {loading ? 
                    (step === 1 ? "Sending OTP..." : "Verifying...") : 
                    (step === 1 ? "Send OTP" : "Verify & Create Account")
                  }
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
                        d={step === 1 ? 
                          "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" :
                          "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        }
                      />
                    </svg>
                  )}
                </span>
              </button>
            </form>

            {/* Footer Links */}
            <div
              className="w-full text-center space-y-3"
            >
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="!text-blue-600 !font-semibold !cursor-pointer hover:!text-blue-700"
                >
                  Sign in
                </span>
              </p>
              <p className="text-gray-500 text-xs">
                By registering, you agree to our{" "}
                <span className="text-blue-600 cursor-pointer hover:text-blue-700">
                  Terms & Privacy Policy
                </span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Register;
