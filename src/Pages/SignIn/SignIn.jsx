import React, { useState } from "react";
import { User, Phone, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const SignIn = () => {

    const [formData, setFormData] = useState({
        mobile: "",
        password: "",
      });
    
      const handleChange = (e) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
    
        console.log("Sign Up Data:", formData);
      };

    return (
        <section className="mt-16">
      <div className="w-full max-w-3xl mx-auto py-6">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          লগ ইন
        </h1>

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
            className="w-full mt-4 py-3 rounded-lg bg-[#1E2A8A] text-white font-semibold text-sm hover:bg-[#16206B] transition"
          >
            লগ ইন
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
          <Link to={'/signup'} className="text-indigo-600 font-semibold cursor-pointer hover:underline">
            নতুন আকাউন্ট খুলুন
          </Link>
        </p>
      </div>
    </section>
    );
};

export default SignIn;