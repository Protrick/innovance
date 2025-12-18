import { NextResponse } from "next/server";
import { dbConnect } from "../../../dbConfig/dbConfig.js";
import User from "../../../models/users.models.js";
import { verifyUserToken } from "../../../lib/userAuth.js";

export async function GET(req) {
  try {
    const token = req.cookies.get?.("userToken")?.value ?? null;
    const payload = token ? verifyUserToken(token) : null;
    if (!payload || !payload.rollNumber) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ rollNumber: payload.rollNumber })
      .select(
        "rollNumber firstName lastName kiitEmail phoneNumber whatsappNumber isPaymentSuccessful paymentScreenshot upiId"
      )
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("GET /api/user error:", err);
    return NextResponse.json(
      { error: err.message || "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const token = req.cookies.get?.("userToken")?.value ?? null;
    const payload = token ? verifyUserToken(token) : null;
    if (!payload || !payload.rollNumber) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const allowed = [
      "firstName",
      "lastName",
      "kiitEmail",
      "phoneNumber",
      "whatsappNumber",
    ];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key))
        updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOneAndUpdate(
      { rollNumber: payload.rollNumber },
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select(
        "rollNumber firstName lastName kiitEmail phoneNumber whatsappNumber"
      )
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/user error:", err);
    return NextResponse.json(
      { error: err.message || "Failed" },
      { status: 500 }
    );
  }
}
