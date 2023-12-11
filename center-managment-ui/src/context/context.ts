import { createContext, Dispatch, SetStateAction } from "react";
import { UserDto } from "../DTOS/user.dto";
import { TaskDto } from "../DTOS/task.dto";

type CenterSystemContextValue = {
  user?: UserDto;
  task?: TaskDto; // Add task property
  setUser: Dispatch<SetStateAction<UserDto | undefined>>;
  setTask: Dispatch<SetStateAction<TaskDto | undefined>>; // Add setTask setter
};

// Providing a default value for the context
const defaultContextValue: CenterSystemContextValue = {
  user: undefined,
  task: undefined, // Set task to undefined initially
  setUser: () => {},
  setTask: () => {}, // Add an empty function as a placeholder for setTask
};

const CenterSystemContext =
  createContext<CenterSystemContextValue>(defaultContextValue);

export default CenterSystemContext;
