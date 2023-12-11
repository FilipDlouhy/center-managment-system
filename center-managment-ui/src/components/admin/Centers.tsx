import React, { useEffect, useState } from "react";
import { appendToUrl } from "../../consts/consts";
import axios from "axios";
import { CenterDto } from "../../DTOS/center.dto";
import Center from "./Center";
import Task from "../Task";

function Centers() {
  const [centers, setCenters] = useState<CenterDto[]>();
  const [center, setCenter] = useState<CenterDto>();
  const [inputValue, setInputValue] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(appendToUrl("center/get-all-centers"));
        if (response.status === 200) {
          setCenters(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const createCenter = async () => {
    if (inputValue.length === 0) {
      return;
    }

    try {
      const response = await axios.post(appendToUrl("center/create-center"), {
        name: inputValue,
      });

      setInputValue("");

      if (response.status === 200) {
        setCenters((prevCenters) => [...(prevCenters ?? []), response.data]);
        setErrorText("");
      }
    } catch (error: any) {
      setErrorText(error.response.data.message);
    }
  };

  const deleteCenter = async () => {
    try {
      const response = await axios.delete(
        appendToUrl(`center/delete-center/${center?.id}`)
      );

      if (response.status === 200) {
        setCenter(undefined);
        setCenters((prevCenters) =>
          prevCenters?.filter((c) => c.id !== center?.id)
        );
      }
    } catch (error: any) {
      setErrorText(error.response.data.message);
    }
  };

  return (
    <div>
      <div className="w-full h-28">
        <h1 className="text-2xl font-semibold ">
          {!center ? " Centers" : "Center detail"}
        </h1>
        {!center && (
          <div className="w-full flex  flex-wrap items-start">
            {centers?.map((center: CenterDto) => {
              return (
                <Center
                  name={center.name}
                  id={center.id}
                  key={center.id}
                  setCenter={setCenter}
                />
              );
            })}
          </div>
        )}
        {!center && (
          <div>
            <div className="w-full h-20 flex">
              <input
                className="w-64 mx-4 h-9 bg-slate-300"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
              />
              <button
                onClick={() => {
                  createCenter();
                }}
                className="flex h-9  w-72 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create center
              </button>
            </div>
            <h1 className="text-2xl font-extrabold text-red-800">
              {errorText}
            </h1>
          </div>
        )}
        {center && (
          <div className="w-full mt-10">
            <div className="w-full mb-6">
              <h1 className="text-2xl font-extrabold text-center text-gray-800">
                Center name: {center.name}
              </h1>
            </div>
            <div className="w-full mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
              <p className="text-lg font-semibold text-gray-700 mb-4">
                Maximum number of tasks that can be in the front:
                <span className="font-normal ml-2">
                  {center.front.maxTasks}
                </span>
              </p>
              <p className="text-lg font-semibold text-gray-700 mb-4">
                Total estimated time to complete all tasks:
                <span className="font-normal ml-2">
                  {(center.front.timeToCompleteAllTasks / 3600000).toFixed(1) +
                    " h"}
                </span>
              </p>
              <p className="text-lg font-semibold text-gray-700">
                Total number of tasks in the front:
                <span className="font-normal ml-2">
                  {center.front.taskTotal}
                </span>
              </p>
            </div>
            <div className="w-full h-96">
              {center.front.tasks.map((task) => {
                return <Task description={task.description} id={task.id} />;
              })}
            </div>
            <div className="w-full flex justify-between">
              <button
                onClick={() => {
                  deleteCenter();
                }}
                className="flex w-72 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Delete center
              </button>
              <button
                onClick={() => {
                  setCenter(undefined);
                }}
                className="flex  w-72 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Centers;
