import { gql, useMutation } from "@apollo/client";
import React from "react";

const tab = ["Followers", "Followings"];
const followUserMutation = gql`
  mutation FollowUser($userId: ID!) {
    follow(userId: $userId) {
      _id
      username
      name
      bio
      followers {
        _id
        username
        name
        bio
      }
      followings {
        _id
        username
        name
        bio
      }
    }
  }
`;
const FollowersAndFollowings = ({ self, setRefreshUsers }) => {
  let [selectedIdx, setSelectedIdx] = React.useState(0);
  let [loading, setLoading] = React.useState("");
  const [followUser, { loading: queryLoading }] = useMutation(
    followUserMutation,
    {
      onCompleted: (data) => {
        setRefreshUsers(true);
        setLoading("");
      },
      onError: (error) => {
        console.error("Follow mutation error:", error);
        alert("Error following user: " + (error.message || "Unknown error"));
        setLoading("");
      },
    }
  );
  async function handleFollow(userId, set) {
    console.log("handleFollow called with userId:", userId);
    console.log("Current self:", self);

    if (!self?._id) {
      alert("You must be logged in to follow users");
      return;
    }

    try {
      console.log("Calling followUser mutation with variables:", { userId });
      const result = await followUser({
        variables: { userId },
      });
      console.log("Follow mutation result:", result);
    } catch (error) {
      console.error("Follow error details:", {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
    }
  }
  return (
    <div className="bg-gradient-to-br from-sky-100 to-white h-screen flex space-y-4 p-4 flex-col justify-center items-center">
      <div className="rounded-full flex bg-gradient-to-r from-teal-500 to-blue-600 bg-white space-x-3  p-2">
        {tab.map((item, idx) => (
          <div
            onClick={() => setSelectedIdx(idx)}
            className={`p-2  rounded-full md:text-xl text-sm transition-all  font-medium ${
              selectedIdx === idx ? "bg-white text-black" : ""
            }`}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="h-150 rounded-lg px-4 py-2 shadow-md bg-white overflow-y-scroll ">
        {selectedIdx === 0 ? (
          self?.followers?.map((user) => {
            return (
              <div className="w-full flex items-center p-2 space-x-3 md:px-7 px-4 shadow-md bg-white rounded-lg">
                <div className="bg-red-400 rounded-full h-12 w-12 overflow-hidden">
                  {" "}
                  <img
                    src="/images/avatar.png"
                    alt="Avatar"
                    className="w-full h-full  rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="md:text-xl lg:text-2xl text-md text-black">
                    {user?.name}
                  </span>
                  <span className="text-sm text-slate-400">
                    @{user?.username}
                  </span>
                </div>
                <button
                  disabled={queryLoading}
                  onClick={() => {
                    setLoading(user?._id);
                    handleFollow(user?._id);
                  }}
                  className="!bg-blue-300 ml-6 !border-none !outline-none !p-2 md:p-5 md:ml-15"
                >
                  {loading === user?._id ? (
                    <div className="h-5 w-5 animate-spin border-b-2 rounded-full border-white"></div>
                  ) : self?.followings?.some(
                      (following) => following?._id === user?._id
                    ) ? (
                    "Following"
                  ) : (
                    "Follow Back"
                  )}
                </button>
              </div>
            );
          })
        ) : self?.followings?.length === 0 ? (
          <span className="text-black">You have currently 0 followers</span>
        ) : (
          self?.followings?.map((user) => {
            return (
              <div className="w-full flex items-center p-2 space-x-3 md:px-7 px-4 shadow-md bg-white rounded-lg">
                <div className="bg-red-400 rounded-full h-12 w-12 overflow-hidden">
                  {" "}
                  <img
                    src="/images/avatar.png"
                    alt="Avatar"
                    className="w-full h-full  rounded-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="md:text-xl lg:text-2xl text-md text-black">
                    {user?.name}
                  </span>
                  <span className="text-sm text-slate-400">
                    @{user?.username}
                  </span>
                </div>
                <button
                  disabled={queryLoading}
                  onClick={() => {
                    setLoading(user?._id);
                    handleFollow(user?._id);
                  }}
                  className="!bg-blue-300 ml-6 !outline-none !border-none !p-2 md:p-5 md:ml-15"
                >
                  {loading === user?._id ? (
                    <div className="h-5 w-5 animate-spin border-b-2 rounded-full border-white"></div>
                  ) : (
                    "Following"
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FollowersAndFollowings;
