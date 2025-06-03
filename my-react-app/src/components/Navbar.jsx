import React from "react";
import { Link, Outlet } from "react-router-dom";

const Navbar = () => {
  return (
    <div>
      <nav className="flex fixed top-0 md:px-20 bg-[rgba(0,0,0,0.4)]  h-20 md:h-30 w-screen ">
        <ul className="w-full gap-7 rounded-lg p-2 flex px-10  justify-center  items-center">
          <li className="mr-auto">
            <a className="bg-black rounded-lg p-2" href="/login">
              <span className="text-white">About</span>
            </a>
          </li>
          <li>
            <a className="bg-white border-black border-2  rounded-lg p-2" href="/login">
              <span className="text-black"> Login</span>
            </a>
          </li>
          <li>
            <a className="bg-white border-black border-2 rounded-lg p-2" href="/register">
              <span className="text-black"> Register</span>
            </a>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Navbar;
