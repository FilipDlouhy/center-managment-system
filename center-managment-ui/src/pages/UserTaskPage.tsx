import React, { Fragment, useContext, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import CenterSystemContext from "../context/context";
import CreateTask from "../components/user/CreateTask";
import CurrentTask from "../components/user/CurrentTask";
import UsersTasks from "../components/user/UsersTasks";
import TaskInfo from "../components/user/TaskInfo";
interface menuItem {
  name: string;
  current: boolean;
  title: string;
}

const initialNavigation: menuItem[] = [
  {
    name: "Currents task",
    current: true,
    title: "Task or Tasks which are being done",
  },
  { name: "Your tasks", current: false, title: "Tasks you created" },
  { name: "Create task", current: false, title: "Create your task" },
];
const userNavigation = [{ name: "Sign out", href: "/" }];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const context = useContext(CenterSystemContext);
  const [navigation, setNavigation] = useState(initialNavigation);
  const navigate = useNavigate();
  const { setUser } = context;
  const { setTask } = context;
  const { task } = context;
  const logout = () => {
    setUser(undefined);
    navigate("/");
  };

  const getActiveItemTitle = (navigationItems: menuItem[]) => {
    if (task != null) {
      return "";
    }
    const activeItem = navigationItems.find(
      (item: menuItem) => item.current === true
    );
    return activeItem?.title;
  };

  // Example usage
  const activeTitle = getActiveItemTitle(initialNavigation);
  console.log(activeTitle); // This will log the title of the active item or an empty string if no active item is found

  const handleNavItemClick = (itemName: string) => {
    const updatedNavigation = navigation.map((item) => ({
      ...item,
      current: item.name === itemName,
    }));
    setTask(undefined);
    setNavigation(updatedNavigation);
  };
  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-indigo-600">
          {({ open }: { open: boolean }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleNavItemClick(item.name)}
                            className={classNames(
                              item.current
                                ? "bg-indigo-700 text-white"
                                : "text-white hover:bg-indigo-500 hover:bg-opacity-75",
                              "rounded-md px-3 py-2 text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="relative flex max-w-xs items-center justify-center bg-indigo-600 text-sm focus:outline-none focus:ring-2">
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">Open user menu</span>
                            <div className="h-8 w-14 rounded-full flex justify-center items-center text-white font-bold text-xl">
                              Profile
                            </div>
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item key={userNavigation[0].name}>
                              {({ active }: { active: boolean }) => (
                                <button
                                  onClick={() => {
                                    logout();
                                  }}
                                  className={
                                    "block px-4 py-2 text-sm text-gray-700 w-full"
                                  }
                                >
                                  {userNavigation[0].name}
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
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
                <div className="border-t border-indigo-700 pb-3 pt-4">
                  <div className="flex items-center px-5">
                    <button
                      type="button"
                      className="relative ml-auto flex-shrink-0 rounded-full bg-indigo-600 p-1 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-indigo-500 hover-bg-opacity-75"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
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
      </div>
    </>
  );
}
