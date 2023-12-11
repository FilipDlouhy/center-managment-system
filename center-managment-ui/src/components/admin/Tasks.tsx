import React, { useEffect, useState } from "react";
import { appendToUrl } from "../../consts/consts";
import axios from "axios";
import { TaskAdminDto } from "../../DTOS/taskAdmin.dto";
import Task from "../Task";

function Tasks() {
  const [tasks, setTasks] = useState<TaskAdminDto[]>();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(appendToUrl("task/get-all-tasks"));
        if (response.status === 200) {
          console.log(response.data);
          setTasks(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      <h1 className="font-bold text-2xl">All Tasks in the system</h1>,
      <div className="w-full flex flex-wrap">
        {tasks?.map((task) => {
          return (
            <Task description={task.description} id={task.id} key={task.id} />
          );
        })}
      </div>
    </div>
  );
}

export default Tasks;
