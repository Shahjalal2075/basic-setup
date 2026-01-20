import React from "react";

const Banner = () => {
  return (
    <section
      className="w-full bg-[#F3F5FB] relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-white/80"></div>

      <div className="relative mx-auto max-w-3xl py-16 text-left">
        {/* small pill */}
        <span className="inline-block mb-4 px-4 py-1 text-sm font-medium text-[#1E3A8A] border border-[#1E3A8A] rounded-full">
          নির্ভরযোগ্য প্ল্যাটফর্ম
        </span>

        {/* heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight flex flex-col gap-6">
          <span className="text-black">দ্রুত সহজ</span>
          <span className="text-[#1A237E]">নিরাপদ</span>
        </h1>

        {/* description */}
        <p className="mt-4 text-[#4E6481]">
          আপনাকে এগিয়ে নিয়ে যাওয়ার জন্য ডিজাইন করা দ্রুত, স্বচ্ছ এবং নির্ভরযোগ্য ঋণ সমাধানগুলি অ্যাক্সেস করুন।
        </p>

        {/* buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
          <button className="px-8 w-full py-3 rounded-lg bg-[#1A237E] text-white font-semibold hover:bg-[#0f1985] transition">
            লগইন
          </button>

          <button className="w-full px-8 py-3 rounded-lg border border-[#1A237E] text-[#1A237E] font-semibold hover:bg-[#1A237E] hover:text-white transition">
            এখনই আবেদন করুন
          </button>
        </div>
      </div>
    </section>
  );
};

export default Banner;
