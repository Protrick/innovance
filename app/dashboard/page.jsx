"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function dashboardPage() {
    const router = useRouter();
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        async function fetchUser() {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();
                    if (mounted) setUser(data.user);
                } else {
                    // not logged in or other error
                    const err = await res.json().catch(() => null);
                    console.warn('Fetch /api/user failed', err);
                }
            } catch (err) {
                console.error('Failed to fetch user:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        fetchUser();
        return () => (mounted = false);
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                router.push("/login");
            } else {
                const data = await res.json().catch(() => null);
                alert(data?.error || "Logout failed");
            }
        } catch (err) {
            console.error("Logout error:", err);
            alert("Logout failed");
        }
    };

    function Avatar({ firstName, lastName }) {
        const initials = `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase();
        return (
            <div className="w-12 h-12 rounded-full border-2 border-gray-200 text-gray-700 flex items-center justify-center font-semibold">
                {initials || "U"}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : user ? (
                <div className="bg-white rounded-lg shadow p-6">
                    {/* Profile (top) */}
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.push('/profile')} className="p-0 bg-transparent border-0 cursor-pointer">
                            <Avatar firstName={user.firstName} lastName={user.lastName} />
                        </button>
                        <div>
                            <div onClick={() => router.push('/profile')} className="font-semibold text-lg cursor-pointer text-gray-600">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-600">Roll: {user.rollNumber}</div>
                            <div className="text-sm text-gray-600">Email: {user.kiitEmail}</div>
                            {user.phoneNumber && <div className="text-sm text-gray-600">Phone: {user.phoneNumber}</div>}
                        </div>
                    </div>

                    <hr className="my-5 border-gray-200" />

                    {/* Payment (bottom) */}
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-600">Payment</h2>
                                <p className="text-gray-600">Registration fee: <span className="font-medium">₹199</span></p>
                            </div>
                            <div>
                                {user.isPaymentSuccessful ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">Paid</span>
                                ) : user.paymentScreenshot ? (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">Pending</span>
                                ) : (
                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-semibold">Not paid</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-gray-700 mb-2">Status details</p>
                            {user.isPaymentSuccessful ? (
                                <div className="text-green-700">Your payment was confirmed. Thank you!</div>
                            ) : user.paymentScreenshot ? (
                                <div className="space-y-2">
                                    <div className="text-yellow-700">We received your payment screenshot and it is under review.</div>
                                    <div>
                                        <button onClick={() => window.open(user.paymentScreenshot, '_blank')} className="text-blue-600 underline">View screenshot</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-red-700">You haven't completed payment yet.</div>
                            )}

                            <div className="mt-4">
                                {!user.isPaymentSuccessful && !user.paymentScreenshot ? (
                                    <>
                                        <button onClick={() => router.push('/payment')} className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700">Pay now</button>
                                        <p className="text-sm text-gray-500 mt-2">You can pay via UPI QR and upload screenshot on the payment page.</p>
                                    </>
                                ) : !user.isPaymentSuccessful && user.paymentScreenshot ? (
                                    <div className="text-yellow-700 font-medium">Payment submitted — pending review by admin.</div>
                                ) : (
                                    <div className="text-sm text-gray-600">No further action needed.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div>You are not logged in. <a href="/login" className="text-blue-600">Login</a></div>
            )}
        </div>
    );
}