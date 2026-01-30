import React, { useContext, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";

const BASE_URL = "https://loan-server-seven.vercel.app";

const Password = () => {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();


  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: must be logged in
    if (!user?.phone) {
      Swal.fire({
        icon: "error",
        title: "লগইন দরকার",
        text: "পাসওয়ার্ড পরিবর্তন করতে আগে লগইন করুন।",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    // Basic required validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Swal.fire({
        icon: "warning",
        title: "সবগুলো ফিল্ড পূরণ করুন",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    // Current password must match user.password
    if (String(currentPassword) !== String(user?.password)) {
      Swal.fire({
        icon: "error",
        title: "বর্তমান পাসওয়ার্ড ভুল",
        text: "আপনার বর্তমান পাসওয়ার্ড মিলেনি।",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    // New & Confirm match
    if (newPassword !== confirmNewPassword) {
      Swal.fire({
        icon: "error",
        title: "নতুন পাসওয়ার্ড মিলছে না",
        text: "নতুন পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড একই হতে হবে।",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    // New password must be different from current
    if (newPassword === currentPassword) {
      Swal.fire({
        icon: "warning",
        title: "নতুন পাসওয়ার্ড আলাদা হতে হবে",
        text: "আগের পাসওয়ার্ডের মতো একই পাসওয়ার্ড দেওয়া যাবে না।",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    // Length constraints
    if (newPassword.length < 6 || newPassword.length > 32) {
      Swal.fire({
        icon: "warning",
        title: "পাসওয়ার্ডের দৈর্ঘ্য ঠিক নয়",
        text: "পাসওয়ার্ড ৬ থেকে ৩২ অক্ষরের মধ্যে হতে হবে।",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(
        `${BASE_URL}/update-user-pass/${encodeURIComponent(user.phone)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }), // ✅ only password
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Password update failed");
      }

      await Swal.fire({
        icon: "success",
        title: "পাসওয়ার্ড পরিবর্তন সফল ✅",
        text: "আপনার পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।",
        confirmButtonColor: "#1B2B8F",
      });

      // reset fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      navigate("/dashboard");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "আপডেট ব্যর্থ",
        text: err?.message || "কিছু একটা সমস্যা হয়েছে",
        confirmButtonColor: "#1B2B8F",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl py-8">
        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#111827]">
          পাসওয়ার্ড পরিবর্তন
        </h1>
        <p className="text-sm text-gray-500 mt-1">আমরা এখানে সাহায্য করতে প্রস্তুত</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Current */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              বর্তমান পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="আপনার পাসওয়ার্ড দিন"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30"
              />
            </div>
          </div>

          {/* New */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              নতুন পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন"
                className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                aria-label="Toggle new password visibility"
              >
                {showNew ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              নিশ্চিত নতুন পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="পুনরায় নতুন পাসওয়ার্ড দিন"
                className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "আপডেট হচ্ছে..." : "নিশ্চিত পাসওয়ার্ড"}
          </button>

          {/* Bottom help */}
          <p className="text-center text-sm text-gray-500 pt-2">
            পাসওয়ার্ড ভুলে গেছেন?{" "}
            <span className="text-[#1B2B8F] font-semibold cursor-pointer hover:underline">
              হেল্প ও সাপোর্ট
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Password;
