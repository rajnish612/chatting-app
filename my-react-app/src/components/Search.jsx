import React, { useEffect } from "react";
import { MdSearch } from "react-icons/md";

const Search = () => {
  let [users, setUsers] = React.useState([]);
  async function handleSearch() {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.log(error);
    }
  }
  function handleChange(e) {
    const { value } = e.target;
  }
  useEffect(() => {
    handleSearch();
  }, []);
  return (
    <div className="h-screen w-screen flex justify-center items-center  bg-slate-100">
      <div className="bg-white gap-6 w-100 lg:w-200 md:w-150 p-4 h-150 rounded-2xl flex flex-col justify-start items-center">
        <div className="shadow-lg gap-7 h-10 rounded-full w-[90%] flex justify-start items-center px-5">
          <MdSearch size={20} color="grey" />
          <input
            onChange={handleChange}
            className="outline-none w-full text-black"
            type="text"
            placeholder="search by username"
          />
        </div>

        <button className="!bg-white !border-b-1 !rounded-none !border-slate-200  !border-0 w-[80%] h-20 !transition-all  focus:!border-l-4 focus:!border-blue-500   !outline-0 text-black flex justify-start items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img
              src="/images/avatar.png"
              className="w-full object-contain h-full"
            />
          </div>
          Name
          <button className="!bg-blue-400 !rounded-full flex items-center justify-center !transition-transform !outline-none hover:scale-[1.1]  text-white w-15 !text-xs md:!text-sm md:w-20 md:h-10 ml-auto">
            Follow
          </button>
        </button>
      </div>
    </div>
  );
};

export default Search;
