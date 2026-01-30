import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";

const BASE_URL = "https://loan-server-seven.vercel.app";

const Loan = () => {
    const { user } = useContext(AuthContext);

    const [hasLoan, setHasLoan] = useState(false);
    const [loading, setLoading] = useState(true);

    console.log(hasLoan);

    useEffect(() => {
        const checkLoan = async () => {
            if (!user?.phone) {
                setHasLoan(false);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const res = await fetch(
                    `${BASE_URL}/user-loan/${user.phone}`
                );

                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    setHasLoan(false);
                    return;
                }

                // 👉 যদি loan data পাওয়া যায়
                if (Array.isArray(data) && data.length > 0) {
                    setHasLoan(true);
                } else {
                    setHasLoan(false);
                }
            } catch (err) {
                console.error(err);
                setHasLoan(false);
            } finally {
                setLoading(false);
            }
        };

        checkLoan();
    }, [user?.phone]);

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-3xl px-4 py-8">
                {/* Title */}
                <h1 className="text-2xl font-extrabold text-[#111827]">ঋণ আবেদন</h1>
                <p className="text-sm text-gray-500 mt-1">
                    আজকে আপনার পক্ষ আবেদনগুলো যারা করে থাকেন
                </p>

                {/* Info box */}
                <div className="mt-6">
                    <h2 className="text-sm font-extrabold text-[#111827] mb-3">
                        ঋণ আবেদনের তথ্য
                    </h2>

                    <ul className="space-y-4">
                        <li className="flex gap-3 text-sm text-gray-700">
                            <span className="mt-2 w-2 h-2 rounded-full bg-[#1B2B8F] shrink-0"></span>
                            <div>
                                <p className="font-semibold text-[#111827]">
                                    ৩০ লক্ষ পর্যন্ত ঋণ পাওয়া যাবে
                                </p>
                                <p className="text-gray-500 mt-1">
                                    আপনার তথ্য সফলভাবে যাচাই করা হয়েছে। এখন আবেদন সম্পন্ন করে ঋণ
                                    গ্রহণ করতে পারবেন।
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-3 text-sm text-gray-700">
                            <span className="mt-2 w-2 h-2 rounded-full bg-[#1B2B8F] shrink-0"></span>
                            <div>
                                <p className="font-semibold text-[#111827]">প্রদত্ত সুদ ৮.৪%</p>
                                <p className="text-gray-500 mt-1">
                                    আপনার তথ্য সফলভাবে যাচাই করা হয়েছে। এখন আবেদন সম্পন্ন করে ঋণ
                                    গ্রহণ করতে পারবেন।
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-3 text-sm text-gray-700">
                            <span className="mt-2 w-2 h-2 rounded-full bg-[#1B2B8F] shrink-0"></span>
                            <div>
                                <p className="font-semibold text-[#111827]">
                                    আবেদন ফি ৫০০ টাকা
                                </p>
                                <p className="text-gray-500 mt-1">
                                    আপনার তথ্য সফলভাবে যাচাই করা হয়েছে। এখন আবেদন সম্পন্ন করে ঋণ
                                    গ্রহণ করতে পারবেন।
                                </p>
                            </div>
                        </li>
                    </ul>

                    {/* Button section */}
                    <div className="mt-8">
                        {loading ? (
                            <button
                                disabled
                                className="py-4 px-8 rounded-xl bg-gray-300 text-gray-600 font-extrabold cursor-not-allowed"
                            >
                                লোড হচ্ছে...
                            </button>
                        ) : hasLoan ? (
                            <Link
                                to="loan-info"
                                className="py-4 px-8 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition"
                            >
                                ঋণ তথ্য
                            </Link>
                        ) : (
                            <Link
                                to="apply"
                                className="py-4 px-8 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition"
                            >
                                এখনই আবেদন করুন
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loan;
