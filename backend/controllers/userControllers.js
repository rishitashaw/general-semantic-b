const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
const generateToken = require("../config/generateToken");
const nodemailer = require("nodemailer");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
  // console.log(users);
});

// Generate OTP
function generateOTPcode() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  try {
    // Create a transporter using your email service provider credentials
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "alexandra.walter35@ethereal.email",
        pass: "hVBDmbkMfzs7es3rJf",
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Alexandra Walter" <alexandra.walter35@ethereal.email>', // Replace with your email address
      to: email,
      subject: "OTP Verification",
      text: `Your OTP: ${ otp }`,
      html: `<p>Your OTP: <strong>${ otp }</strong></p>`,
    });
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
  }
}

//verify email otp
const verifyOTP = asyncHandler(async (req, res) => {
  const { username, otp } = req.body;
  const storedOTP = req.session.otp;

  if (storedOTP && storedOTP === otp) {
    // OTP is correct
    req.session.otp = null; // Clear the OTP from session after successful verification

    // Perform additional actions here (e.g., update user data, grant access, etc.)
    res.json({ success: true, message: "OTP verification successful" });
  } else {
    // OTP is incorrect
    res.status(401).json({ success: false, message: "Invalid OTP" });
  }
});

//generate otp
const generateOTP = asyncHandler(async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user) {
      const otp = generateOTPcode();

      // Store the OTP in the session
      req.session.otp = otp;

      // Send OTP email
      sendOTPEmail(user.email, otp);

      res.json({ message: "OTP generated and email sent successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Failed to generate OTP:", error);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
      gsPoints: user.gsPoints
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
      gsPoints: await Message.estimatedDocumentCount({ sender: user._id })
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = { allUsers, registerUser, authUser, verifyOTP, generateOTP };
