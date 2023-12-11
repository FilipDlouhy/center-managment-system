import React, { useContext } from "react";
import CenterSystemContext from "../../context/context";
import { formatISODate, formatISODateWithOffset } from "../../consts/consts";

export default function TaskAdmin() {
  const context = useContext(CenterSystemContext);
  const { taskAdmin } = context;

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <p className="text-gray-700 font-semibold">
            When it was created:
            <span className="ml-1 text-gray-600">
              {formatISODate(taskAdmin?.createdAt)}
            </span>
          </p>
          <p className="text-gray-700 font-semibold">
            When it will be processed at:
            <span className="ml-1 text-gray-600">
              {formatISODateWithOffset(
                taskAdmin?.createdAt,
                taskAdmin?.processedAt
              )}
            </span>
          </p>
          <p className="text-gray-700 font-semibold">
            Status:
            <span className="ml-1 text-gray-600">{taskAdmin?.status}</span>
          </p>
          <p className="text-gray-700 font-semibold">
            Description:
            <span className="ml-1 text-gray-600">{taskAdmin?.description}</span>
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-gray-700 font-semibold">
            User name:
            <span className="ml-1 text-gray-600">{taskAdmin?.user.name}</span>
          </p>
          <p className="text-gray-700 font-semibold">
            Email:
            <span className="ml-1 text-gray-600">{taskAdmin?.user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
