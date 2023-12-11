import React, { useState, useEffect } from "react";
import { UserDto } from "../../DTOS/user.dto";
import { appendToUrl } from "../../consts/consts";
import axios from "axios";
import User from "./User";
import Task from "../Task";

function Users() {
  const [users, setUsers] = useState<UserDto[]>();
  const [userToShow, setUserShow] = useState<UserDto>();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(appendToUrl("user/get-all-users"));
        if (response.status === 200) {
          console.log(response.data);
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      <h1 className="font-bold text-2xl">
        {userToShow ? "User detail" : "All users in the system"}
      </h1>
      {!userToShow && (
        <div className="w-full flex flex-wrap">
          {users?.map((user) => {
            return (
              <User
                setUserShow={setUserShow}
                email={user.email}
                id={user?.id}
                name={user.name}
              />
            );
          })}
        </div>
      )}

      {userToShow && (
        <div>
          <p>{userToShow.email}</p>
          <p>{userToShow?.name}</p>
          {userToShow.tasks?.map((task) => {
            return (
              <Task description={task.description} id={task.id} key={task.id} />
            );
          })}

          <div className="w-full mt-10 h-20">
            <button
              onClick={() => {
                setUserShow(undefined);
              }}
              className="flex  w-72 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
