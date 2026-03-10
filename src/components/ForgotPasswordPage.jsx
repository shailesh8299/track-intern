import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResetLink("");

    try {
      const response = await fetch("http://localhost:4000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message || "If an account exists, a reset link has been sent.");
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setMessage("Unable to process request right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row w-full h-screen">
      <div className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
        <p className="text-white font-medium m-4 text-2xl h-1/2">TrackIntern App</p>
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
          <h1 className="text-3xl font-bold mb-3">Forgot Password</h1>
          <p className="text-gray-600 mb-6">Enter your registered email to get a reset link.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
          {resetLink && (
            <p className="mt-2 text-xs break-all text-blue-700">
              Dev reset link: <a className="underline" href={resetLink}>{resetLink}</a>
            </p>
          )}

          <div className="flex mt-6">
            <p className="mr-2">Remember your password?</p>
            <button
              type="button"
              className="text-purple-700 font-medium cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
