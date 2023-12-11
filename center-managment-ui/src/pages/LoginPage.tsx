import React, { useState, ChangeEvent, useContext } from "react";
import { Link } from "react-router-dom";
import { LoginUserDTO } from "../DTOS/loginUser.dto";
import { appendToUrl } from "../consts/consts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CenterSystemContext from "../context/context";

export default function LoginPage() {
  const initialFormData: LoginUserDTO = {
    email: "",
    password: "",
  };
  const context = useContext(CenterSystemContext);
  const [formData, setFormData] = useState<LoginUserDTO>(initialFormData);
  const [errorText, setErrorText] = useState<string>(
    " Login into your accoount"
  );
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);

    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorText("Please fill in all fields.");
      return;
    }
    try {
      console.log(appendToUrl("user/create-user"));
      const response = await axios.post(
        appendToUrl("user/user-login"),
        formData
      );
      if (response.status === 200) {
        const { setUser } = context;
        console.log(response.data);
        setUser(response.data);
        navigate("/user/tasks-page");
      }
    } catch (error: any) {
      console.error("Server responded with an error:", error.response.data);
      setErrorText(error.response.data.message);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {errorText}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                onClick={(e) => {
                  handleSubmit(e);
                }}
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
              <Link
                to="/register"
                className="flex w-full justify-center rounded-md my-4  bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
