import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [errors, setErrors] = useState([]);
  const [nickname, setNickname] = useState("");
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });

      const data = await response.json();
      console.log("", data);

      if (response.ok) {
        localStorage.setItem("authUser", JSON.stringify(data.user));

        if (response.status === 201) {
          Swal.fire({
            title: "Welcome Home!",
            text: "Your account has been successfully created.",
            icon: "success",
            confirmButtonText: "Continue",
          }).then(() => {
            navigate("/board");
          });
        } else if (response.status === 200) {
          Swal.fire({
            title: "Welcome back!",
            text: "Glad to see you again.",
            icon: "success",
            confirmButtonText: "Continue",
          }).then(() => {
            navigate("/board");
          });
        }
      } else {
        setErrors([
          data.message ||
            "An unexpected error occurred. Please try again later.",
        ]);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors(["An unexpected error occurred. Please try again later."]);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-100 to-teal-100 h-screen w-screen flex justify-center items-center">
      <div className="2xl:w-1/4 lg:w-1/3 md:w-1/2 w-full">
        <div className="bg-white border overflow-hidden sm:rounded-md rounded-none">
          <div className="p-6">
            {errors.length > 0 && (
              <div className="mb-4">
                <div className="text-red-600 dark:text-red-400 text-sm">
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-600 dark:text-gray-200 mb-2"
                  htmlFor="LoggingEmailAddress"
                >
                  Nickname
                </label>
                <input
                  id="nickname"
                  className="p-2 text-sm border bg-slate-50 rounded-md w-full"
                  type="name"
                  placeholder="AwesomeNickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  name="nickname"
                />
              </div>
              <div className="flex justify-center mt-6 mb-4">
                <button
                  type="submit"
                  className="rounded-md p-2 w-full text-white bg-blue-500"
                >
                  Log In
                </button>
              </div>
            </form>
            <div className="flex items-center my-6">
              <div className="flex-auto mt-px border-t border-dashed border-gray-200"></div>
              <div className="mx-4 text-secondary"></div>
              <div className="flex-auto mt-px border-t border-dashed border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
