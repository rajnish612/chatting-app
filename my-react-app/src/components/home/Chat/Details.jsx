import React from "react";

const Details = ({ selectedUserToChat }) => {
  let [bgColor, setBgColor] = React.useState("");
  const generateRandomBgColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    setBgColor(r + "," + g + "," + b + "," + "0.3");
  };
  console.log(bgColor);

  React.useEffect(() => {
    generateRandomBgColor();
  }, []);
  return (
    <>
      <style jsx>{`
        .animated-gradient {
          background: linear-gradient(
            -45deg,
            #6366f1,
            #a855f7,
            #ec4899,
            #6366f1
          );
          background-size: 400% 400%;
          animation: gradientFlow 5s ease infinite;
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .glow {
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.3),
            0 0 30px rgba(236, 72, 153, 0.4), 0 0 45px rgba(168, 85, 247, 0.5);
        }
      `}</style>
      <div className="w-full min-w-xl bg-white">
        {selectedUserToChat && (
          <div className="w-full flex flex-col space-y-4 justify-center items-center h-full py-10">
            <div className="group w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] rounded-full transition-all hover:scale-[1.1] flex justify-center items-center animated-gradient">
              <div className="w-full h-full rounded-full transition-all flex justify-center items-center glow">
                <span className="text-5xl font-bold text-white">
                  {selectedUserToChat.trim().charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-700 via-blue-500 to-blue-300 rounded-full flex justify-center text-center items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 30 30"
                    stroke-width="1.5"
                    stroke="white"
                    class="size-6 animate-bounce w-10 h-10"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </div>
                <span className="text-black  font-black text-4xl ">
                  {selectedUserToChat}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Details;
