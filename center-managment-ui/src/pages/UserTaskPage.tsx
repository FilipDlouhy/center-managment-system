import React, { Fragment, useContext, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import CenterSystemContext from "../context/context";
import CreateTask from "../components/user/CreateTask";
import CurrentTask from "../components/user/CurrentTask";
import UsersTasks from "../components/user/UsersTasks";
import TaskInfo from "../components/user/TaskInfo";
import { NavigationBar } from "../components/user/NavigationBar";

interface MenuItem {
  name: string;
  current: boolean;
  title: string;
}

const initialNavigation: MenuItem[] = [
  {
    name: "Current task",
    current: true,
    title: "Task or Tasks which are being done",
  },
  { name: "Your tasks", current: false, title: "Tasks you created" },
  { name: "Create task", current: false, title: "Create your task" },
];

const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");

export default function UserTaskPage() {
  const { setUser, setTask, task } = useContext(CenterSystemContext);
  const [navigation, setNavigation] = useState(initialNavigation);
  const navigate = useNavigate();

  const logout = () => {
    setUser(undefined);
    navigate("/");
  };

  const getActiveItemTitle = (navigationItems: MenuItem[]) => {
    if (task) {
      return "";
    }
    return navigationItems.find((item) => item.current)?.title;
  };

  const handleNavItemClick = (itemName: string) => {
    setNavigation(
      navigation.map((item) => ({
        ...item,
        current: item.name === itemName,
      }))
    );
    setTask(undefined);
  };

  return (
    <>
      <Disclosure as="nav" className="bg-indigo-600">
        {({ open }) => (
          <>
            <div className="mx-auto justify-between max-w-7xl flex  px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="hidden md:block">
                    <NavigationBar
                      navigation={navigation}
                      handleNavItemClick={handleNavItemClick}
                    />
                  </div>
                </div>
              </div>
              <button
                className="text-xl text-white font-bold"
                onClick={() => {
                  logout();
                }}
              >
                Logout
              </button>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    className={classNames(
                      item.current
                        ? "bg-indigo-700 text-white"
                        : "text-white hover:bg-indigo-500 hover:bg-opacity-75",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold leading-6 text-gray-900">
            {getActiveItemTitle(navigation)}
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {navigation[0].current && !task && <CurrentTask />}
          {navigation[1].current && !task && <UsersTasks />}
          {navigation[2].current && !task && <CreateTask />}
          {task && <TaskInfo />}
        </div>
      </main>
    </>
  );
}
