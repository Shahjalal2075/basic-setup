import React, { useState } from "react";
import { MapPin, Send, ChevronDown } from "lucide-react";

const faqs = [
  "আমাদের সেবা সম্পর্কে আরও জানতে চান? এবং কিভাবে আমাদের সেবা ব্যবহার করতে পারবেন?",
  "আমাদের সেবা সম্পর্কে আরও জানতে চান? এবং কিভাবে আমাদের সেবা ব্যবহার করতে পারবেন?",
  "আমাদের সেবা সম্পর্কে আরও জানতে চান? এবং কিভাবে আমাদের সেবা ব্যবহার করতে পারবেন?",
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 pb-16">
        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#111827]">
          সহায়তা কেন্দ্র
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          আমরা এখানে সাহায্য করতে প্রস্তুত
        </p>

        {/* Banner Image */}
        <div className="mt-4 rounded-xl overflow-hidden">
          <img
            src="/image/help-bg.png"
            alt="Help Banner"
            className="w-full h-40 object-cover"
          />
        </div>

        {/* Address */}
        <div className="mt-5 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EEF1FA] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#1B2B8F]" />
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            UBS Group AG Global Headquarters, Aeschenvorstadt 1, CH-4051 Basel,
            Basel-Stadt, Switzerland
          </div>
        </div>

        {/* Telegram */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EEF1FA] flex items-center justify-center">
              <Send className="w-5 h-5 text-[#1B2B8F]" />
            </div>
            <a
              href="https://t.me/HelplineSwiss"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[#1B2B8F]"
            >
              https://t.me/HelplineSwiss
            </a>
          </div>

          {/* Language badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF1FA] text-xs font-semibold text-[#1B2B8F]">
            বাংলা
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 space-y-3">
          {faqs.map((q, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#C7D2FE] bg-[#EEF1FA]"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-semibold text-[#111827]">
                  {q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#1B2B8F] transition ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                  এখানে আপনার প্রশ্নের বিস্তারিত উত্তর দেখানো হবে। প্রয়োজনে
                  আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে পারবেন।
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
