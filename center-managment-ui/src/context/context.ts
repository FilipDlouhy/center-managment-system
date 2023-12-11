import { createContext, Dispatch, SetStateAction } from "react";
import { UserDto } from "../DTOS/user.dto";
import { TaskDto } from "../DTOS/task.dto";
import { TaskAdminDto } from "../DTOS/taskAdmin.dto";

type CenterSystemContextValue = {
  user?: UserDto;
  task?: TaskDto;
  taskAdmin?: TaskAdminDto; // Add task property // Add task property
  setUser: Dispatch<SetStateAction<UserDto | undefined>>;
  setTask: Dispatch<SetStateAction<TaskDto | undefined>>;
  setTaskAdmin: Dispatch<SetStateAction<TaskAdminDto | undefined>>; // Add setTask setter // Add setTask setter
};

// Providing a default value for the context
const defaultContextValue: CenterSystemContextValue = {
  user: undefined,
  task: undefined,
  taskAdmin: undefined, // Set task to undefined initially // Set task to undefined initially
  setUser: () => {},
  setTask: () => {},
  setTaskAdmin: () => {}, // Add an empty function as a placeholder for setTask // Add an empty function as a placeholder for setTask
};

const CenterSystemContext =
  createContext<CenterSystemContextValue>(defaultContextValue);

export default CenterSystemContext;
