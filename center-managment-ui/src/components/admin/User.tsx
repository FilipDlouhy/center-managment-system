import React from "react";
import { UserDto } from "../../DTOS/user.dto";
import axios from "axios";
import { appendToUrl } from "../../consts/consts";

function User({
  name,
  id,
  email,
  setUserShow,
}: {
  name: string;
  id: number | undefined;
  email: string;
  setUserShow: React.Dispatch<React.SetStateAction<UserDto | undefined>>;
}) {
  return (
    <div className="w-64 h-64 shadow-xl rounded-xl m-4 p-4 flex flex-col justify-around items-center">
      <h2 className="text-lg font-semibold mb-2">{name}</h2>
      <p className="text-gray-600 text-center">{email}</p>
      <button
        onClick={async () => {
          try {
            const response = await axios.get(
              appendToUrl(`user/get-user/${id}`)
            );
            if (response.status === 200) {
              setUserShow(response.data);
            }
          } catch (error) {
            console.error("An error occurred while fetching user data:", error);
          }
        }}
        className="mt-4 w-44 mx-auto bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-semibold"
      >
        Go to Detail
      </button>
    </div>
  );
}

export default User;
