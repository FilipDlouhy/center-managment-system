import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { appendToUrl } from "../../consts/consts";
import CenterSystemContext from "../../context/context";
import { TaskSampleDto } from "../../DTOS/taskSample.dto";
import Task from "../Task";
function UsersTasks() {
  const context = useContext(CenterSystemContext);
  const { user } = context;
  const { task } = context;
  const [usersTasks, setUsersTasks] = useState<TaskSampleDto[]>();

  useEffect(() => {
    async function getUsersTasks() {
      try {
        if (user) {
          const response = await axios.get(
            appendToUrl(`task/get-users-tasks/${user.id}`)
          );

          if (response.status === 200) {
            setUsersTasks(response.data);
          }
        }
      } catch (error: any) {
        console.error("Server responded with an error:", error.response.data);
      }
    }

    getUsersTasks();
  }, [task]);

  return (
    <div className="w-full h-full flex align-top flex-wrap ">
      {usersTasks?.map((task: TaskSampleDto) => {
        return (
          <Task description={task.description} id={task.id} key={task.id} />
        );
      })}
    </div>
  );
}

export default UsersTasks;
