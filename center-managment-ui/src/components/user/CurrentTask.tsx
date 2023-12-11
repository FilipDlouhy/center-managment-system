import React, { useEffect, useContext, useState } from "react";
import { TaskSampleDto } from "../../DTOS/taskSample.dto";
import CenterSystemContext from "../../context/context";
import axios from "axios";
import { appendToUrl } from "../../consts/consts";
import Task from "../Task";

function CurrentTask() {
  const context = useContext(CenterSystemContext);
  const { user } = context;
  const [currentUsersTasks, setCurrentUsersTasks] = useState<TaskSampleDto[]>();
  useEffect(() => {
    async function getUsersTasks() {
      try {
        if (user) {
          const response = await axios.get(
            appendToUrl(`task/get-users-tasks-current/${user.id}`)
          );

          if (response.status === 200) {
            setCurrentUsersTasks(response.data);
          }
        }
      } catch (error: any) {
        console.error("Server responded with an error:", error.response.data);
      }
    }

    getUsersTasks();
  }, []);

  return (
    <div className="w-full h-full flex align-top flex-wrap ">
      {currentUsersTasks?.map((task: TaskSampleDto) => {
        return (
          <Task description={task.description} id={task.id} key={task.id} />
        );
      })}
    </div>
  );
}

export default CurrentTask;
