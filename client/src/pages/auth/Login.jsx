import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUserInfo } from "../../redux/slice/authSlice";
import { useLoginMutation } from "../../redux/api/authApiSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ ...formData }).unwrap();
      dispatch(setUserInfo({ ...res }));
      navigate("/");
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error("Invalid email or password!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-orange-500 mb-8">
          Welcome Back!
        </h2>

        {/* Email Field */}
        <div className="mb-6">
          <label className="block text-sm text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full p-3 bg-gray-100 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label className="block text-sm text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full p-3 bg-gray-100 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition"
          disabled={isLoading}
        >
          {isLoading ? "Logging In ..." : "Log In"}
        </button>

        {/* Signup Redirect */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign Up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
