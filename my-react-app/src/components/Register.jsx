import React from "react";
import { motion } from "motion/react";
import { MdOutlineMail } from "react-icons/md";
import { MdOutlinePassword } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import { useCallback } from "react";
const Register = () => {
  const [form, setForm] = React.useState({
    email: "",
    password: "",
    username: "",
    confirmPassword: "",
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

      try {
        const res = await fetch(
          import.meta.env.VITE_API_URL + "/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          }
        );
        const data = await res.json();
        console.log(data);
      } catch (err) {
        alert("Error during registration: " + err.message);
        console.error("Error during registration:", err.message);
      }
    },
    [form]
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
    <div className="w-screen flex justify-center items-center flex-col gap-6 overflow-x-hidden h-screen">
      <div
        className="w-full flex justify-center items-center flex-col gap-6 overflow-x-hidden h-full"
        initial={{ opacity: 0, width: 0 }}
        transition={{ duration: 4, delay: 0.5 }}
        animate={{ opacity: 1, width: "100%" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 4 }}
          style={{ fontFamily: "arial" }}
          className="mt-20 flex  font-bold gap-5 text-white-400 text-4xl"
        >
          CHAT ME
          <img className="w-10 h-10" src="/images/chat.png" />
        </motion.div>
        {/* </div> */}
        <div className="md:w-150 sm:w-100 p-4 w-80 rounded-lg bg-[rgba(0,0,0,0.3)] mr-auto ml-auto gap-10 flex flex-col justify-center items-center ">
          <div className=" w-[90%]  md:w-[70%]">
            {" "}
            <span className="text-2xl font-bold md:text-4xl">Register</span>
          </div>
          <motion.form
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, easings: "linear" }}
            className="flex  w-full justify-center gap-5 sm:gap-8 items-center flex-col"
          >
            <div className="flex w-full justify-center items-center gap-2">
              <MdOutlineMail size={20} />
              <input
                onChange={handleChange}
                name="email"
                className="rounded-2xl md:w-[70%] w-[80%] border-amber-200 border-1 p-2"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex w-full justify-center items-center gap-2">
              <CiUser size={20} />
              <input
                onChange={handleChange}
                name="username"
                className="rounded-2xl md:w-[70%] w-[80%] border-amber-200 border-1 p-2"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex w-full justify-center items-center gap-2">
              <MdOutlinePassword size={20} />
              <input
                onChange={handleChange}
                name="password"
                className="rounded-2xl md:w-[70%] w-[80%] border-amber-200 border-1 p-2"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex w-full justify-center items-center gap-2">
              <MdOutlinePassword size={20} />
              <input
                onChange={handleChange}
                name="confirmPassword"
                className="rounded-2xl md:w-[70%] w-[80%] border-amber-200 border-1 p-2"
                placeholder="Confirm your password"
              />
            </div>
            <input
              onClick={handleSubmit}
              className=" bg-red-600 px-2  text-white font-bold rounded-2xl md:px-3 py-1  cursor-pointer hover:scale-[1.1] transition-transform "
              title="register"
              type="submit"
            />
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Register;
