import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Header = () => {
  const [lang, setLang] = useState("বাংলা");
  const [open, setOpen] = useState(false);

  const langs = ["বাংলা"];

  return (
    <header className="w-full max-w-3xl mx-auto">
      <div className="py-4 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2 select-none">
          <img className="w-32" src="/image/logo.png" alt="" />
        </div>

        {/* RIGHT: Language pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 border border-[#4C6FFF] rounded-full px-3 py-[6px] bg-white shadow-sm hover:shadow transition"
          >
            {/* small status dot */}
           <img className="w-4" src="/image/bd_flag.png" alt="" />

            <span className="text-[13px] font-medium text-[#1F2937]">
              {lang}
            </span>

            <ChevronDown className="w-4 h-4 text-[#1F2937]" />
          </button>

          {/* Dropdown (optional) */}
          {open && (
            <div
              className="absolute right-0 mt-2 w-36 bg-white border rounded-xl shadow-lg overflow-hidden z-50"
              onMouseLeave={() => setOpen(false)}
            >
              {langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLang(l);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    l === lang ? "bg-gray-50 font-semibold" : ""
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
