import React from "react";
import { CenterDto } from "../../DTOS/center.dto";
import axios from "axios";
import { appendToUrl } from "../../consts/consts";

export default function Center({
  id,
  name,
  setCenter,
}: {
  id: number;
  name: string;
  setCenter: React.Dispatch<React.SetStateAction<CenterDto | undefined>>;
}) {
  return (
    <div className="w-60 h-60 m-3 flex flex-col items-center justify-around shadow-xl">
      <h1 className="font-bold text-xl">Center name</h1>
      <p className="font-bold text-xl">{name}</p>

      <button
        onClick={async () => {
          const response = await axios.get(
            appendToUrl(`center/get-center/${id}`)
          );

          setCenter(response.data);
        }}
        className="mt-4 w-40 mx-auto bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-semibold"
      >
        Go to Detail
      </button>
    </div>
  );
}
