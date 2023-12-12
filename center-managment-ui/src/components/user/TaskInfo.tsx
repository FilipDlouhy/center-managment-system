import React, { useContext, useState } from "react";
import axios, { AxiosError } from "axios";
import CenterSystemContext from "../../context/context";
import {
  appendToUrl,
  formatISODate,
  formatISODateWithOffset,
} from "../../consts/consts";
import { TaskDetail } from "./TaskDetail";

function TaskInfo() {
  const { task, setTask } = useContext(CenterSystemContext);
  const [errorText, setErrorText] = useState<string>("Info about your task");
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteTask = async () => {
    if (!task) return;
    if (task.status === "doing") {
      setErrorText("You cannot delete a task because it is being processed");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await axios.get(
        appendToUrl(`task/delete-task/${task.id}`)
      );
      if (response.status === 200) {
        setTask(undefined);
        setErrorText("Task deleted successfully");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Server responded with an error:", error.response?.data);
        setErrorText(error.response?.data?.message || "An error occurred");
      } else {
        console.error("An unknown error occurred:", error);
        setErrorText("An unknown error occurred");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!task) {
    return <div>No task selected</div>;
  }

  return (
    <div>
      <div className="w-full h-16">
        <h1
          className={`text-2xl font-semibold ${
            isDeleting ? "text-gray-400" : "text-black"
          }`}
        >
          {errorText}
        </h1>
      </div>

      <div className="w-full flex items-start h-96">
        <TaskDetail title="Status" detail={task.status} />
        <TaskDetail title="Description" detail={task.description} />
        <TaskDetail title="Created at" detail={formatISODate(task.createdAt)} />
        <TaskDetail
          title="Will be processed at"
          detail={formatISODateWithOffset(task.createdAt, task.processedAt)}
        />
      </div>

      <div className="h-64 flex items-center justify-center w-full">
        <button
          onClick={deleteTask}
          type="button"
          disabled={task.status === "doing"}
          className={`rounded-md my-5 w-48 h-14 bg-indigo-600 px-3.5 py-2.5 font-semibold text-2xl text-white shadow-sm ${
            task.status === "doing"
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          }`}
        >
          Delete task
        </button>
      </div>
    </div>
  );
}

export default TaskInfo;
