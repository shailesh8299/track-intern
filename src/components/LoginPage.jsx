import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import Snackbar from "@mui/joy/Snackbar";
import IconButton from "@mui/joy/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/joy/Alert";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      setShowSuccess(true);
      const timeout = setTimeout(() => {
        setShowSuccess(false);
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "supervisor") navigate("/supervisor");
        else if (user.role === "intern") navigate("/intern");
        else navigate("/");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setError("");
    const success = await login({ email: data.email, password: data.password });
    if (!success) setError("Invalid email or password.");
  };
  function signUp(e) {
    e.preventDefault();
    navigate("/signup");
  }

  function forgotPassword(e) {
    e.preventDefault();
    navigate("/forgot-password");
  }

  if (user && !showSuccess) return <></>;

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
        <p className="text-white font-medium m-4 text-2xl h-1/2">
          TrackIntern App
        </p>
      </div>
      <div
        className="flex-1 flex items-center justify-center bg-gray-100"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d2hpdGUlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-4xl font-bold mb-3">Welcome Back!</h1>
          <h2 className="text-xl font-medium mb-6">
            Please enter your details
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-2">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-4 bg-transparent text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <img
                      src="https://static.thenounproject.com/png/1069529-200.png"
                      className="w-5 h-5"
                      alt="Hide"
                    />
                  ) : (
                    <img
                      src="https://static.thenounproject.com/png/1069530-200.png"
                      className="w-5 h-5"
                      alt="Show"
                    />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="mb-4 text-right">
              <button
                type="button"
                className="text-sm text-purple-700 font-medium cursor-pointer"
                onClick={forgotPassword}
              >
                Forgot password?
              </button>
            </div>
            <Snackbar
              open={!!error}
              onClose={() => setError("")}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              sx={[{ mb: 0, ml: 1, padding: 0 }]}
            >
              <Alert
                variant="outlined"
                color="danger"
                sx={{
                  backgroundColor: "white",
                  borderColor: "red",
                  borderWidth: 1,
                  borderStyle: "solid",
                  minWidth: 350,
                  height: 40,
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
                endDecorator={
                  <IconButton
                    variant="plain"
                    color="neutral"
                    size="sm"
                    onClick={() => setError("")}
                    aria-label="close"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                <p className="font-medium text-lg p-4">{error}</p>
              </Alert>
            </Snackbar>
            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
              Login
            </button>
            <div className="flex mt-6">
              <p className="mr-2">Don't have an account?</p>
              <button
                type="button"
                className="text-purple-700 font-medium cursor-pointer"
                onClick={signUp}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 text-center border-green-600 border-4">
            <p className="text-green-600 text-2xl font-semibold">
              Login Successful!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
