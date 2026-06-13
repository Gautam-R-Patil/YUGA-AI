import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/contexts/AuthContext";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setNewPassword } = useAuth();

  const [newPassword, setNewPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await setNewPassword(token!, newPassword);
      setSuccessMsg("✅ Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {errorMsg && (
          <p className="mt-4 text-red-600 text-sm text-center">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="mt-4 text-green-600 text-sm text-center">
            {successMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export { ResetPasswordPage };

