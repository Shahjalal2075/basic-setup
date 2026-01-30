import React, { useContext, useMemo, useState } from "react";
import { User, Phone, Lock, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";

const API_URL = "https://loan-server-seven.vercel.app/user-list";

const SignUp = () => {
  const { setUser, user } = useContext(AuthContext);

  const navigate = useNavigate();

  if (user) {
    navigate("/dashboard");
  }

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: "success", // success | error | warning
    title: "",
    message: "",
  });

  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  const openModal = (type, title, message) => {
    setModal({ open: true, type, title, message });
  };

  const sanitizePhone = (value) => value.replace(/\D/g, ""); // digits only
  const isValidBDPhone11 = (phone) => /^\d{11}$/.test(phone);

  const trimmedName = useMemo(() => formData.fullName.trim(), [formData.fullName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const onlyDigits = sanitizePhone(value);
      // max 11 digits
      const trimmed = onlyDigits.slice(0, 11);
      setFormData((p) => ({ ...p, mobile: trimmed }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!trimmedName || !formData.mobile || !formData.password) {
      openModal("warning", "ফর্ম অসম্পূর্ণ", "সবগুলো ঘর পূরণ করুন।");
      return false;
    }

    if (trimmedName.length < 4) {
      openModal("warning", "নাম ভুল", "পূর্ণ নাম কমপক্ষে ৪ অক্ষরের হতে হবে।");
      return false;
    }

    // phone: only digits + exactly 11
    if (!isValidBDPhone11(formData.mobile)) {
      openModal("warning", "মোবাইল নম্বর ভুল", "মোবাইল নম্বর অবশ্যই ১১ সংখ্যার হতে হবে (শুধু সংখ্যা)।");
      return false;
    }

    if (formData.password.length < 6) {
      openModal("warning", "পাসওয়ার্ড দুর্বল", "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const ok = validate();
    if (!ok) return;

    setIsSubmitting(true);

    try {
      // 1) check existing users
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("User list fetch failed");

      const users = await res.json();
      const exists = Array.isArray(users)
        ? users.some((u) => String(u?.phone || "") === String(formData.mobile))
        : false;

      if (exists) {
        openModal("error", "অ্যাকাউন্ট আছে", "এই মোবাইল নম্বর দিয়ে আগেই একটি অ্যাকাউন্ট তৈরি করা আছে।");
        setIsSubmitting(false);
        return;
      }

      // 2) create account
      const payload = {
        name: trimmedName,
        phone: formData.mobile,
        password: formData.password,
        userInfo: {},
        isVerify: false,
        totalBal: 0,
        totalLoan: 0,
        pin: "",
        isProfileComplete: false,
        createdAt: new Date().toISOString()
      };

      const postRes = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!postRes.ok) {
        let msg = "Account create failed";
        try {
          const errData = await postRes.json();
          msg = errData?.message || msg;
        } catch { }
        throw new Error(msg);
      }

      setTimeout(() => {
        closeModal();
        navigate("/dashboard");
      }, 2500);

      // success
      localStorage.setItem("loan-user", formData.mobile);

      setUser(payload);

      openModal("success", "সফল হয়েছে!", "আপনার অ্যাকাউন্ট তৈরি হয়েছে। আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");

      // 2-3 sec then redirect


      // Optional: reset form (not necessary)
      // setFormData({ fullName: "", mobile: "", password: "" });
    } catch (err) {
      openModal("error", "সমস্যা হয়েছে", err?.message || "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalColor = modal.type === "success"
    ? "border-green-200"
    : modal.type === "warning"
      ? "border-yellow-200"
      : "border-red-200";

  const modalTitleColor = modal.type === "success"
    ? "text-green-700"
    : modal.type === "warning"
      ? "text-yellow-700"
      : "text-red-700";

  return (
    <section className="mt-16">
      <div className="w-full max-w-3xl mx-auto py-6 px-3">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">নতুন একাউন্ট</h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          আপনাকে এগিয়ে নিয়ে যাওয়ার জন্য ডিজাইন করা দ্রুত, স্বচ্ছ এবং নির্ভরযোগ্য ঋণ সমাধানগুলি অ্যাক্সেস করুন।
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পূর্ণ নাম</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={4}
              />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নং</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="১১ সংখ্যার মোবাইল নম্বর দিন"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                minLength={11}
                maxLength={11}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
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
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-4 py-3 rounded-lg bg-[#1E2A8A] text-white font-semibold text-sm transition
              ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-[#16206B]"}`}
          >
            {isSubmitting ? "প্রসেসিং..." : "এখনই আবেদন করুন"}
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
          ইতোমধ্যে একাউন্ট আছে?{" "}
          <Link to={"/signin"} className="text-indigo-600 font-semibold cursor-pointer hover:underline">
            লগইন করুন
          </Link>
        </p>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className={`w-full max-w-md bg-white rounded-2xl shadow-xl border ${modalColor}`}>
            <div className="flex items-start justify-between p-5">
              <div>
                <h3 className={`text-lg font-bold ${modalTitleColor}`}>{modal.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{modal.message}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={closeModal}
                className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black transition"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SignUp;
