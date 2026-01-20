import React from "react";
import { FileText, UserCheck, Droplet } from "lucide-react";

const steps = [
  {
    icon: <FileText className="w-5 h-5 text-indigo-600" />,
    title: "আবেদন করুন",
    desc: "প্রয়োজন অনুযায়ী ফর্ম পূরণ করে সহজেই আবেদন করুন",
  },
  {
    icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
    title: "অনুমোদন পান",
    desc: "আমরা যাচাই ও অনুমোদনের প্রক্রিয়া সম্পন্ন করি",
  },
  {
    icon: <Droplet className="w-5 h-5 text-indigo-600" />,
    title: "রক্ত গ্রহণ করুন",
    desc: "দ্রুত সময়ে নিকটবর্তী রক্তদাতা থেকে রক্ত পান",
  },
];

const HTW = () => {
  return (
    <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-3xl">
        {/* Section Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          এটি কীভাবে কাজ করে
        </h2>

        {/* Steps */}
        <div className="space-y-5">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Icon box */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 shrink-0">
                {step.icon}
              </div>

              {/* Text */}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HTW;
