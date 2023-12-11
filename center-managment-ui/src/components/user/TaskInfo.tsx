import React, { useContext, useState } from "react";
import CenterSystemContext from "../../context/context";
import {
  appendToUrl,
  formatISODate,
  formatISODateWithOffset,
} from "../../consts/consts";
import axios from "axios";

function TaskInfo() {
  const context = useContext(CenterSystemContext);
  const { task } = context;
  const { setTask } = context;
  const [errorText, setErrorText] = useState<string>(" Info about your task");

  const deleteTask = async () => {
    if (task?.status === "doing") {
      setErrorText("You cannot delete a task because he is being processed");
      return;
    }
    try {
      const response = await axios.get(
        appendToUrl(`task/delete-task/${task?.id}`)
      );
      if (response.status === 200) {
        setTask(undefined);
      }
    } catch (error: any) {
      console.error("Server responded with an error:", error.response.data);
      setErrorText(error.response.data.message);
    }
  };

  return (
    <div>
      <div className="w-full h-16">
        <h1 className="text-2xl font-semibold text-black">{errorText}</h1>
      </div>

      <div className="w-full flex items-start h-96">
        <div className="w-40 h-28 m-5 shadow-2xl flex flex-col items-center justify-around">
          <h1 className="font-bold text-xl">Status</h1>
          <h1>{task?.status}</h1>
        </div>

        <div className="w-64 h-28 m-5 shadow-2xl flex flex-col items-center justify-around">
          <h1 className="font-bold text-xl">Description</h1>
          <h1>{task?.description}</h1>
        </div>

        <div className="w-48 h-28 m-5 shadow-2xl flex flex-col items-center justify-around">
          <h1 className="font-bold text-xl">Created at</h1>
          <h1>{formatISODate(task?.createdAt)}</h1>
        </div>

        <div className="w-56 h-28 m-5 shadow-2xl flex flex-col items-center justify-around">
          <h1 className="font-bold text-xl">Will be proccesed at</h1>
          <h1>{formatISODateWithOffset(task?.createdAt, task?.processedAt)}</h1>
        </div>
      </div>
      <div className="h-64 flex items-center justify-center w-full">
        <button
          onClick={() => {
            deleteTask();
          }}
          type="button"
          className="rounded-md my-5 w-48 h-14 bg-indigo-600 px-3.5 py-2.5  font-semibold text-2xl text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Delete task
        </button>
      </div>
    </div>
  );
}

export default TaskInfo;
