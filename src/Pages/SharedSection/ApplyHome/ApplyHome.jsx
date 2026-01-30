import React from "react";
import { Link } from "react-router-dom";

const ApplyHome = () => {
  return (
    <section className="w-full bg-[#E8EAF6] py-14">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Content */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              শুরু করতে প্রস্তুত?
            </h2>

            <p className="text-sm text-gray-500 text-center mt-8">
              ইতোমধ্যে ১০,০০০+ স্বেচ্ছাসেবকের সাথে যুক্ত হন।
              মানবতার কাজে আপনিও অংশ নিন!
            </p>
          </div>

          {/* Right CTA + Stats */}
          <div className="flex flex-col">
            
            {/* Button */}
            <Link to={'/signup'} className="px-6 py-3 rounded-lg bg-[#1E2A8A] text-white font-semibold hover:bg-[#16206B] transition">
              এখনই আবেদন করুন
            </Link>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-700 w-full justify-center mt-6">
              <div>
                <p className="font-bold text-gray-900">৩০ লাখ</p>
                <p className="text-gray-500">মানুষ</p>
              </div>

              <span className="w-px h-8 bg-gray-300"></span>

              <div>
                <p className="font-bold text-gray-900">৫ মিনিট</p>
                <p className="text-gray-500">প্রক্রিয়া</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplyHome;
