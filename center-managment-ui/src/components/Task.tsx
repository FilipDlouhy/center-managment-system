import React, { useContext } from "react";
import { TaskSampleDto } from "../DTOS/taskSample.dto";
import axios from "axios";
import { appendToUrl } from "../consts/consts";
import CenterSystemContext from "../context/context";
function Task({ description, id }: TaskSampleDto) {
  const context = useContext(CenterSystemContext);
  const { setTask } = context;
  const { setTaskAdmin } = context;
  const { user } = context;

  return (
    <div className="w-64 h-64 shadow-xl rounded-xl m-4 p-4 flex flex-col justify-around items-center">
      <h2 className="text-lg font-semibold mb-2">Task Description</h2>
      <p className="text-gray-600 text-center">{description}</p>
      <button
        onClick={async () => {
          try {
            const response = user?.admin
              ? await axios.get(appendToUrl(`task/get-task-admin/${id}`))
              : await axios.get(appendToUrl(`task/get-task-user/${id}`));
            if (user?.admin) {
              setTaskAdmin(response.data);
            } else {
              setTask(response.data);
            }
          } catch (error: any) {
            console.error(
              "Server responded with an error:",
              error.response.data
            );
          }
        }}
        className="mt-4 w-44 mx-auto bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-semibold"
      >
        Go to Detail
      </button>
    </div>
  );
}

export default Task;
