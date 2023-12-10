import { createContext, Dispatch, SetStateAction } from "react";
import { UserDto } from "../DTOS/user.dto";

type CenterSystemContextValue = {
  user?: UserDto;
  setUser: Dispatch<SetStateAction<UserDto | undefined>>;
};

// Providing a default value for the context
const defaultContextValue: CenterSystemContextValue = {
  user: undefined, // or some default user value
  setUser: () => {}, // an empty function as a placeholder
};

const CenterSystemContext =
  createContext<CenterSystemContextValue>(defaultContextValue);

export default CenterSystemContext;
