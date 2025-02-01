import Users from "../models/Users.js";
import bcrypt from "bcryptjs";
import {createToken} from "../middlewares/createToken.js";

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Please fill all required fields");
  }

  const userExists = await Users.findOne({ email });
  if (userExists) return res.status(400).send("User already exists");

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new Users({ name, email, password: hashedPassword });

  try {
    await newUser.save();
    createToken(res, newUser._id);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await Users.findOne({ email });

  if (!existingUser) return res.status(401).json({ message: "User not found" });

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (isPasswordValid) {
      createToken(res, existingUser._id);
      return res.status(201).json({
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      });
    } else {
      return res.status(401).json({ message: "Invalid Password" });
    }
  } else {
    return res.status(401).json({ message: "User not found" });
  }
};

export const logOut = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({ message: "Logged Out Successfully" });
};
