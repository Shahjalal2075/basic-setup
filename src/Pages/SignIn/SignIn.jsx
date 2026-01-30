import React, { useContext, useState } from "react";
import { Phone, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../../Providers/AuthProvider";

const BASE_URL = "https://loan-server-seven.vercel.app";

const SignIn = () => {
  const { setUser, user } = useContext(AuthContext);

  const navigate = useNavigate();

  if (user) {
    navigate("/dashboard");
  }

  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const sanitizePhone = (v) => String(v || "").replace(/\D/g, ""); // only digits

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phone = sanitizePhone(formData.mobile);
    const password = formData.password;

    // Basic validation
    if (phone.length !== 11) {
      Swal.fire({
        icon: "warning",
        title: "ভুল মোবাইল নম্বর",
        text: "১১ সংখ্যার মোবাইল নম্বর দিন",
        confirmButtonColor: "#1E2A8A",
      });
      return;
    }

    if (!password || password.length < 4) {
      Swal.fire({
        icon: "warning",
        title: "পাসওয়ার্ড দিন",
        text: "সঠিক পাসওয়ার্ড লিখুন",
        confirmButtonColor: "#1E2A8A",
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${BASE_URL}/user-list/${phone}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "User not found");
      }

      // তোমার AuthProvider এর মতো ধরলাম data.user বা data.data.user হতে পারে
      const userObj = data?.user || data?.data?.user || data?.data || data;

      if (!userObj) {
        Swal.fire({
          icon: "error",
          title: "ইউজার পাওয়া যায়নি",
          text: "এই নম্বর দিয়ে কোনো অ্যাকাউন্ট নেই",
          confirmButtonColor: "#1E2A8A",
        });
        return;
      }

      // password field নাম সার্ভারে বিভিন্ন হতে পারে—common গুলো চেক করলাম
      const serverPass =
        userObj?.password ?? userObj?.pass ?? userObj?.userPassword ?? "";

      if (!serverPass) {
        Swal.fire({
          icon: "error",
          title: "পাসওয়ার্ড ফিল্ড পাওয়া যায়নি",
          text: "সার্ভারের user object এ password নেই।",
          confirmButtonColor: "#1E2A8A",
        });
        return;
      }

      if (String(serverPass) !== String(password)) {
        Swal.fire({
          icon: "error",
          title: "ভুল পাসওয়ার্ড",
          text: "আপনার পাসওয়ার্ড মিলেনি",
          confirmButtonColor: "#1E2A8A",
        });
        return;
      }

      // ✅ success
      localStorage.setItem("loan-user", phone);

      await Swal.fire({
        icon: "success",
        title: "লগইন সফল ✅",
        text: "আপনি সফলভাবে লগইন করেছেন",
        confirmButtonColor: "#1E2A8A",
      });

      setUser(userObj);

      navigate("/dashboard"); // চাইলে /dashboard বা যেটা দরকার
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "লগইন ব্যর্থ",
        text: err?.message || "কিছু একটা সমস্যা হয়েছে",
        confirmButtonColor: "#1E2A8A",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-16">
      <div className="w-full max-w-3xl mx-auto py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">লগ ইন</h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          আপনাকে এগিয়ে নিয়ে যাওয়ার জন্য ডিজাইন করা দ্রুত, স্বচ্ছ এবং নির্ভরযোগ্য ঋণ সমাধানগুলি অ্যাক্সেস করুন।
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              মোবাইল নং
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="১১ সংখ্যার মোবাইল নম্বর দিন"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="আপনার পাসওয়ার্ড দিন"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 rounded-lg bg-[#1E2A8A] text-white font-semibold text-sm hover:bg-[#16206B] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "লগইন হচ্ছে..." : "লগ ইন"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <span className="flex-1 h-px bg-gray-200"></span>
          <span className="text-xs text-gray-400">অথবা</span>
          <span className="flex-1 h-px bg-gray-200"></span>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          অ্যাকাউন্ট নাই ?{" "}
          <Link
            to={"/signup"}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            নতুন আকাউন্ট খুলুন
          </Link>
        </p>
      </div>
    </section>
  );
};

export default SignIn;
