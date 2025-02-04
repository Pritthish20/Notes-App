import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setUserInfo } from "../../redux/slice/authSlice";
import { useSignupMutation } from "../../redux/api/authApiSlice";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();

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
      // console.log(formData);
      const res = await signup({ ...formData }).unwrap();
      dispatch(setUserInfo({ ...res }));
      navigate("/");
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error("Signup failed", error);
      toast.error("Error occurred, please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl text-center text-orange-500 mb-6">Sign Up</h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-3 mb-4 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-md bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="w-full p-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
          disabled={isLoading}
        >
          {isLoading ? "Signing Up ..." : "Sign Up"}
        </button>

        {/* Login Redirect */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-orange-500 hover:text-orange-600"
            >
              Log In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
