import React from "react";
import { useNavigate } from "react-router-dom";

const Avatar = ({ email }) => {
  const navigate = useNavigate();
  const [avatar, setAvatar] = React.useState("");
  const [preview, setPreview] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const handleFileChange = (e) => {
    setAvatar("");
    setPreview("");
    if (!e.target.files[0].type.startsWith("image")) {
      return alert("accepts only image files");
    }

    if (e.target.files) {
      setAvatar(e.target.files[0]);
      const fileReader = new FileReader();

      fileReader.readAsDataURL(e.target.files[0]);
      fileReader.onload = (ev) => {
        setPreview(ev.target.result);
      };
    }
  };
  const handleUpload = async () => {
    setLoading(true);
    if (!avatar) {
      return;
    }
    const formData = new FormData();
    formData.append("avatar", avatar);
    formData.append("email", email);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/upload", {
        method: "POST",

        body: formData,
      });
      const data = await res.json();
      navigate("/login");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className=" absolute inset-0 bg-gradient-to-r flex justify-center items-center p-2 from-teal-100 to-white">
      <div className="flex flex-col bg-gradient-to-r from-teal-100 to-white py-10 xl:w-200 rounded-lg shadow-lg items-center space-y-10 justify-center">
        <input
          onChange={handleFileChange}
          type="file"
          id="file"
          className="hidden"
        />
        <label htmlFor="file">
          <div className="w-40 h-40 cursor-pointer overflow-hidden  hover:scale-[1.1] transition-transform flex justify-center items-center  bg-amber-300 rounded-full ring-1 ring-amber-300 ring-offset-1">
            {!preview ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-10"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                />
              </svg>
            ) : (
              <img
                className="w-full h-full object-cover object-center  rounded-full"
                src={preview}
                alt="Avatar preview"
              />
            )}
          </div>
        </label>
        <span className=" text-4xl bg-gradient-to-r from-teal-500 font-black to-blue-400 bg-clip-text text-transparent">
          Choose A Profile Pic
        </span>
        <button className="bg-gradient-to-r flex items-center justify-center font-bold !px-10 shadow-2xl !outline-none !border-none from-yellow-300 hover:scale-[1.1] !transition-all to-yellow-400">
          Later
        </button>
        <button
          onClick={handleUpload}
          className="bg-gradient-to-r flex items-center justify-center space-x-2 font-bold  !px-10 shadow-2xl !outline-none !border-none from-purple-500  hover:scale-[1.1] !transition-all to-purple-400"
        >
          {loading ? (
            <div className="h-10 w-10 rounded-full border-b-2 animate-spin border-white" />
          ) : (
            <>
              Confirm
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Avatar;
