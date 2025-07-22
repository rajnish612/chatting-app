import { gql, useQuery } from "@apollo/client";
import { errorCodes } from "@apollo/client/invariantErrorCodes";
import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const USER_QUERY = gql`
  query GetUser($username: String!) {
    getUser(username: $username) {
      _id
      username
      name
      bio
      followers {
        _id
      }
      followings {
        _id
      }
    }
  }
`;
const User = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { self } = location?.state;
  const { username } = useParams();
  const { data, error, loading } = useQuery(USER_QUERY, {
    variables: { username: username },
  });
  useEffect(() => {
    if (!self?._id) {
      navigate("/login", { replace: true });
    }
  }, [self?._id, navigate]);

  return (
    <div className="flex justify-center w-screen h-screen p-2  items-center">
      <div className="w-[90%] sm:w-[80%]  md:w-[600px]  lg:w-[600px] xl:w-[700px] py-10 rounded-2xl flex flex-col justify-start  items-center shadow-2xl ring-7 ring-blue-300/35 ring-offset-2  ">
        {loading ? (
          <>
            <div className="h-screen w-screen absolute inset-0 bg-white/10 backdrop-blur-md flex justify-center items-center">
              <div className="p-4 rounded-full border-b-3 animate-spin border-blue-400 text-black h-10 w-10"></div>
            </div>
          </>
        ) : error ? (
          <>
            <div className="h-screen w-screen absolute inset-0 flex-col bg-white/10 backdrop-blur-md flex justify-center items-center">
              <div className="bg-red-500 animate-pulse rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="white"
                  class="size-20"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>

              <span className="text-slate-500 mt-5 text-xl md:text-3xl font-black">
                USER NOT FOUND !!{" "}
              </span>
            </div>
          </>
        ) : (
          //   <>
          //     <div className="bg-red-500 animate-pulse rounded-full p-2">
          //       <svg
          //         xmlns="http://www.w3.org/2000/svg"
          //         fill="none"
          //         viewBox="0 0 24 24"
          //         stroke-width="1.5"
          //         stroke="white"
          //         class="size-20"
          //       >
          //         <path
          //           stroke-linecap="round"
          //           stroke-linejoin="round"
          //           d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          //         />
          //       </svg>
          //     </div>

          //     <span className="text-slate-500 mt-5 text-xl md:text-3xl font-black">
          //       USER NOT FOUND !!{" "}
          //     </span>
          //   </>
          <>
            <div className="rounded-full bg-slate-100 ring-1 ring-amber-300 ring-offset-3  h-30 w-30 xl:h-35 md:w-35">
              <img
                className="object-center object-contain h-full w-full"
                src="/images/avatar.png"
              />
            </div>
            <div className="flex flex-col mt-5 items-center">
              <div className="flex space-x-1 items-center justify-center">
                <div className="bg-slate-200 rounded-full p-1">
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="blue"
                    class="size-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <span className="font-black  bg-gradient-to-r text-transparent from-black/80 to-black/70 bg-clip-text text-2xl">
                  {data?.getUser?.name}
                </span>
              </div>
              <span className="text-slate-500 font-medium">
                @{data?.getUser?.username}
              </span>
              <div className="max-h-30 w-[70%] mt-5 scroll-smooth text-center  overflow-y-scroll">
                <span className="text-slate-400 font-medium">
                  {data?.getUser?.bio}
                </span>
              </div>
            </div>
            <div className="flex h-20 space-x-5 mt-10">
              <div className="h-10 flex rounded-lg justify-center items-center px-2 outline-1 outline-blue-400">
                <span className="text-black">
                  Followers: {data?.getUser?.followers?.length}
                </span>
              </div>
              <div className="h-10 flex  rounded-lg justify-center items-center px-2 outline-1 outline-blue-400">
                <span className="text-black">
                  Followings: {data?.getUser?.followings?.length}
                </span>
              </div>
            </div>
            <button className="!bg-gradient-to-r !p-2  !outline-none !transition-transform hover:scale-[1.1] !rounded-lg !from-blue-500 !to-blue-300">
              {(self?._id !== data?.getUser?._id &&
                self?.followings?.some(
                  (following) => following?._id === data?.getUser?._id
                ) &&
                data?.getUser?.followings?.some(
                  (following) => following?._id === self?._id
                )) ||
              (self?.followings?.some(
                (following) => following?._id === data?.getUser?._id
              ) &&
                !data?.getUser?.followings?.some(
                  (following) => following?._id === self?._id
                )) ? (
                <span>Following</span>
              ) : !self?.followings?.some(
                  (following) => following?._id === data?.getUser?._id
                ) &&
                data?.getUser?.followings?.some(
                  (following) => following?._id === self?._id
                ) ? (
                <span>Follow back</span>
              ) : (
                <span>Follow</span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default User;
