"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const userId = searchParams.get("user_id");
    const [countdown, setCountdown] = useState(5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function verifyPayment() {
            if (!sessionId || !userId) {
                setError("Invalid session.");
                return;
            }

            try {
                const res = await fetch("/api/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId, user_id: userId }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to verify payment");

                setTimeout(() => router.push("/dashboard"), 5000);
            } catch (err: any) {
                setError(err.message);
                console.error("Payment verification failed:", err);
            } finally {
                setLoading(false);
            }
        }

        verifyPayment();
    }, [sessionId, userId, router]);

    useEffect(() => {
        if (countdown <= 0) return;
        const interval = setInterval(() => {
            setCountdown((prev) => Math.max(prev - 1, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [countdown]);

    return (
        <div className="h-screen flex items-center justify-center bg-gray-950 text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6 bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-700"
            >
                {loading ? (
                    <p className="text-lg animate-pulse text-gray-400">Verifying payment...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <>
                        <h1 className="text-4xl font-extrabold text-green-400">🎉 Payment Successful!</h1>
                        <p className="text-gray-300">Thank you for subscribing!</p>
                        <p className="text-gray-400">
                            Redirecting to your dashboard in{" "}
                            <span className="text-green-300 font-bold text-xl">{countdown}</span> seconds...
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push("/dashboard")}
                            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-md"
                        >
                            Go to Dashboard Now
                        </motion.button>
                    </>
                )}
            </motion.div>
        </div>
    );
}