import React from "react";

const FollowersAndFollowings = ({self}) => {
    console.log(self);
    
  return (
    <div className="bg-white h-screen flex space-x-4 justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg px-4 py-2 h-150">
        <div className="w-full text-center">
          <span className="text-black font-black ">Followers</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg  px-4 py-2  h-150">
        <div className="w-full text-center">
          <span className="text-black font-black ">Followers</span>
        </div>
      </div>
    </div>
  );
};

export default FollowersAndFollowings;
