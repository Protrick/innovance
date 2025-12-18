"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const [upiId, setUpiId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [rollNumber, setRollNumber] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [troubleshootMode, setTroubleshootMode] = useState(false);
  const [troubleshootImage, setTroubleshootImage] = useState(null);

  // Normal QR images
  const qrImages = [
    "/qrs/first.png",
    "/qrs/second.png",
    "/qrs/third.png",
    "/qrs/fourth.png",
    "/qrs/fifth.png",
  ];

  // Troubleshoot QR images
  const troubleshootImages = [
    "/troubleshoot/tone.png",
    "/troubleshoot/ttwo.png",
    "/troubleshoot/tthree.png",
  ];

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) {
          alert('Please complete registration first.');
          router.push('/register');
          return;
        }
        const data = await res.json();
        setRollNumber(data.user?.rollNumber || '');
      } catch (err) {
        console.error('Failed to fetch current user for payment page', err);
        alert('Please complete registration first.');
        router.push('/register');
        return;
      }
    }
    init();

    // --- Cyclic QR selection for normal mode ---
    let index = parseInt(localStorage.getItem("qrIndex") || "0", 10);
    setQrImage(qrImages[index]);

    const nextIndex = (index + 1) % qrImages.length;
    localStorage.setItem("qrIndex", nextIndex.toString());

    // --- Initialize troubleshoot QR ---
    let tIndex = parseInt(localStorage.getItem("troubleshootIndex") || "0", 10);
    setTroubleshootImage(troubleshootImages[tIndex]);
    localStorage.setItem(
      "troubleshootIndex",
      ((tIndex + 1) % troubleshootImages.length).toString()
    );
  }, [router]);

  // Cycle troubleshoot QR on each click
  const handleTroubleshootClick = () => {
    setTroubleshootMode(true);
    let tIndex = parseInt(localStorage.getItem("troubleshootIndex") || "0", 10);
    setTroubleshootImage(troubleshootImages[tIndex]);
    const nextTIndex = (tIndex + 1) % troubleshootImages.length;
    localStorage.setItem("troubleshootIndex", nextTIndex.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Custom validation: require at least one of UPI ID or Screenshot
    if (!upiId && !screenshot) {
      alert("Please enter UPI ID or upload a screenshot.");
      return;
    }

    const formData = new FormData();
    formData.append("rollNumber", rollNumber);
    if (upiId) formData.append("upiId", upiId);
    if (screenshot) formData.append("screenshot", screenshot);

    const res = await fetch("/api/payment-confirm", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      alert(
        "Thank you for joining! Please wait while we confirm your payment and create your ticket."
      );
      router.push("/dashboard");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-xl p-10 space-y-6 text-center">
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">
          Payment Page
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please pay <strong>₹199</strong> using the QR code below and upload your details.
        </p>

        {/* QR Image */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {troubleshootMode ? "Troubleshoot QR" : "UPI QR"}
          </h3>
          {(troubleshootMode ? troubleshootImage : qrImage) && (
            <img
              src={troubleshootMode ? troubleshootImage : qrImage}
              alt="UPI QR"
              className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md object-contain border-4 border-blue-500 rounded-xl shadow-lg transition-transform transform hover:scale-105"
            />
          )}
        </div>

        {/* Troubleshoot Button */}
        <div className="mt-4">
          <button
            onClick={handleTroubleshootClick}
            className="w-full bg-red-600 text-white font-semibold p-3 rounded-lg shadow hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            Show Troubleshoot QR
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-6 text-left">
          <input
            type="text"
            placeholder="Enter your UPI ID (optional)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files[0])}
            className="w-full border border-gray-300 dark:border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold p-3 rounded-lg shadow hover:from-green-700 hover:to-teal-700 transition-transform transform hover:scale-105"
          >
            Submit Payment
          </button>
        </form>
      </div>
    </div>
  );
}