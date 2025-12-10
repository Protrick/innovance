// import { NextResponse } from "next/server";
// import { dbConnect } from "../../../dbConfig/dbConfig.js";
// import User from "../../../models/users.models.js";
// export async function POST(req) {
//   try {
//     await dbConnect();
//     const body = await req.json();

//     // Fix year type
//     body.year = Number(body.year);

//     // Ensure kiitEmail is generated
//     body.kiitEmail = `${body.rollNumber}@kiit.ac.in`;

//     const user = new User(body);

//     try {
//   await user.save();
// } catch (err) {
//   if (err.code === 11000) {
//     const field = Object.keys(err.keyPattern)[0]; // e.g. "username", "rollNumber", "kiitEmail"
//     return NextResponse.json(
//       { error: `Duplicate ${field}. Please use a different ${field}.` },
//       { status: 400 }
//     );
//   }
//   throw err;
// }
//     return NextResponse.json({ message: "Registration successful!" }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: error.message || "Failed to register" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { dbConnect } from "../../../dbConfig/dbConfig.js";
import User from "../../../models/users.models.js";
import { sendOtpEmail, generateOTP } from "../../../lib/mail.js";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    // Ensure types and required fields
    const payload = body;
    // {
    //   ...body,
    //   year: Number(body.year),
    //   kiitEmail: `${body.rollNumber}@kiit.ac.in`, // derived institutional email
    // };

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = new User({
      ...payload,
      otp,
      otpExpiry,
    });

    try {
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        return NextResponse.json(
          { error: `Duplicate ${field}. Please use a different ${field}.` },
          { status: 400 }
        );
      }
      throw err;
    }

    // Send OTP email (to kiitEmail)
    try {
      await sendOtpEmail(user.kiitEmail, otp);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      // You can decide whether to fail or allow retry
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    // Return a success and hint the frontend where to go next
    return NextResponse.json(
      {
        message: "Registration initiated. OTP sent to your email.",
        rollNumber: user.rollNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/register:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}