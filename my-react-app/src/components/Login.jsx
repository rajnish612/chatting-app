import React from "react";

const Login = () => {
  const [form, setForm] = React.useState({
    email: "",
    password: "",
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
    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
          credentials: "include", 
        }
      );
      const data = await res.json();
      console.log(data);
    } catch (err) {
      alert("Error during login: " + err.message);
      console.error("Error during login:", err.message);
    }
  }
  return (
    <div className="w-screen flex justify-center items-center gap-8 flex-col overflow-x-hidden h-screen">
      <span
        style={{ fontFamily: "arial" }}
        className="mt-20 flex gap-5 font-bold  text-white-400 text-4xl"
      >
        CHAT ME <img className="w-10 h-10" src="/images/chat.png" />
      </span>
      <div className="md:w-150 sm:w-100 p-4 w-80 rounded-lg bg-[rgba(0,0,0,0.3)] mr-auto ml-auto gap-10 flex flex-col justify-center items-center ">
        <div className=" w-[90%]  md:w-[70%]">
          {" "}
          <span className="text-2xl font-bold md:text-4xl">Login</span>
        </div>
        <form className="flex h-70  w-full  justify-center gap-15   items-center flex-col">
          <input
            onChange={handleChange}
            name="email"
            className="rounded-2xl md:w-[70%] w-[90%] border-amber-200 border-1 p-2"
            placeholder="enter your email"
          />

          <input
            onChange={handleChange}
            name="password"
            className="rounded-2xl md:w-[70%] w-[90%] border-amber-200 border-1 p-2"
            placeholder="enter your password"
          />

          <input
          onClick={handleSubmit}
            className="bg-red-500 px-2  text-white font-bold rounded-2xl md:px-3 py-1  cursor-pointer hover:scale-[1.1] transition-transform "
            title="register"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
