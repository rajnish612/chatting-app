import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
const randomUsersQuery = gql`
  query {
    getRandomUsers {
      _id
      email
      username
      followings
      followers
    }
  }
`;
const searchUsersQuery = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      _id
      username
      email
      followers
      followings
    }
  }
`;
const Search = ({ setRefreshUsers, self }) => {
  const {
    data,

    loading: userLoading,
  } = useQuery(randomUsersQuery, {
    fetchPolicy: "network-only",
  });
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchUsers, { data: searchData, error, loading: searchLoading }] =
    useLazyQuery(searchUsersQuery, {
      onCompleted: async (data) => {
        setSearchedUsers(data.searchUsers);
      },
      fetchPolicy: "network-only",
    });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  console.log("search users", searchedUsers);

  const handleSearch = (value) => {
    if (value.trim()) {
      searchUsers({ variables: { query: searchTerm } });
    }
  };
  async function handleFollow(username, set) {
    setRefreshUsers(true);
    setLoading(true);
    set((prev) => {
      return prev.map((user) => {
        console.log(user);

        if (user.username === username) {
          return {
            ...user,

            followers: user.followers.includes(self?.username)
              ? user.followers.filter(
                  (followers) => followers !== self?.username
                )
              : [...user.followers, self?.username],
          };
        } else {
          return user;
        }
      });
    });
    try {
      const res = await fetch(
        import.meta.env.VITE_API_URL + "/api/users/follow",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username }),
        }
      );
      const data = await res.json();
      setRefreshUsers((prev) => !prev);
      console.log(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setRefreshUsers(false);
    }
  }
  useEffect(() => {
    setUsers(data?.getRandomUsers);
  }, [data]);
  if (userLoading) return <h1>Loading</h1>;
  return (
    <div className="h-screen w-screen flex justify-center items-center  bg-slate-100">
      <div className="bg-white gap-6 w-100 lg:w-200 md:w-150 p-4 h-150 rounded-2xl flex flex-col justify-start items-center">
        <div className="w-full flex justify-center relative ">
          <div className="shadow-lg gap-7 h-10 rounded-full w-[90%] flex justify-start items-center px-5">
            <MdSearch size={20} color="grey" />
            <input
              onChange={(e) => {
                handleSearch(e.target.value);
                setSearchTerm(e.target.value);
              }}
              className="outline-none w-full text-black"
              type="text"
              placeholder="search by username"
            />
            <button onClick={() => handleSearch(searchTerm)}>search</button>
          </div>
          {searchTerm && (
            <div className="bg-white overflow-y-scroll items-center flex flex-col h-100 shadow-lg rounded-lg absolute top-15 w-full">
              {searchedUsers && searchedUsers?.length !== 0 ? (
                searchedUsers?.map((user, idx) => {
                  return (
                    <div
                      key={idx}
                      className="!bg-white !border-b-1 !rounded-none !border-slate-200  !border-0 w-[80%] h-20 !transition-all  focus:!border-l-4 focus:!border-blue-500   !outline-0 text-black flex justify-start items-center"
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden">
                        <img
                          src="/images/avatar.png"
                          className="w-full object-contain h-full"
                        />
                      </div>
                      {user.username}
                      <button
                        onClick={() => {
                          handleFollow(user.username, setSearchedUsers);
                        }}
                        type="button"
                        className="!bg-blue-400 p-2 !rounded-full flex items-center justify-center !transition-transform !outline-none hover:scale-[1.1]  text-white w-15 !text-xs md:!text-sm md:w-20 md:h-10 ml-auto"
                      >
                        {loading
                          ? "Loading..."
                          : user.followers.includes(self.username)
                          ? "Following"
                          : self.followers.includes(user.username) &&
                            !self.followings.includes(user.username)
                          ? "Follow Back"
                          : "Follow"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <h1>User not found</h1>
              )}
            </div>
          )}
        </div>
        {users &&
          users?.length !== 0 &&
          users?.map((user, idx) => {
            return (
              <div
                key={idx}
                className="!bg-white !border-b-1 !rounded-none !border-slate-200  !border-0 w-[80%] h-20 !transition-all  focus:!border-l-4 focus:!border-blue-500   !outline-0 text-black flex justify-start items-center"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img
                    src="/images/avatar.png"
                    className="w-full object-contain h-full"
                  />
                </div>
                {user.username}
                <button
                  onClick={() => {
                    handleFollow(user.username, setUsers);
                  }}
                  type="button"
                  className="!bg-blue-400 p-2 !rounded-full flex items-center justify-center !transition-transform !outline-none hover:scale-[1.1]  text-white w-15 !text-xs md:!text-sm md:w-20 md:h-10 ml-auto"
                >
                  {loading
                    ? "Loading..."
                    : user.followers.includes(self.username)
                    ? "Following"
                    : self.followers.includes(user.username) &&
                      !self.followings.includes(user.username)
                    ? "Follow Back"
                    : "Follow"}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Search;
