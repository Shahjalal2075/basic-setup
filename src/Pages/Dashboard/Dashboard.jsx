import React, { useContext } from "react";
import {
  Wallet,
  CreditCard,
  User,
  FileText,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { AuthContext } from "../../Providers/AuthProvider";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-[20px] md:text-[22px] font-extrabold text-[#111827]">
            স্বাগতম, {user.name} !
          </h1>
          <p className="text-[12.5px] text-[#6B7280] mt-1">
            আজকে আপনার পক্ষ আবেদনগুলো শুরু করতে পারেন
          </p>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#172B9B] to-[#2A2C87] p-5 shadow-sm">
          {/* subtle circles */}
          <div className="absolute -right-16 -top-10 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute -right-8 top-10 w-40 h-40 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[12px] text-white/80 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                মোট ব্যালেন্স
              </p>

              <div className="flex items-end gap-2">
                <span className="text-[30px] md:text-[34px] font-extrabold text-white leading-none">
                  {user.totalBal}
                </span>
                <span className="text-[14px] text-white/90 pb-1">টাকা</span>
              </div>

              <p className="mt-2 text-[12px] text-white/80">
                বকেয়া ঋণ: <span className="font-semibold">{user.totalLoan} টাকা</span>
              </p>
            </div>

            <div className="text-white/80">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5">
          <p className="text-[12px] font-semibold text-[#111827] mb-2">
            একশন
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to={'profile'} className="flex items-center gap-3 rounded-lg bg-[#1B2B8F] text-white px-4 py-3 shadow-sm hover:opacity-95 transition">
              <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              <span className="font-semibold text-[13px]">প্রোফাইল আপডেট</span>
            </Link>

            <Link to={'loan'} className="flex items-center gap-3 rounded-lg bg-[#1B2B8F] text-white px-4 py-3 shadow-sm hover:opacity-95 transition">
              <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </span>
              <span className="font-semibold text-[13px]">লোন আবেদন</span>
            </Link>
          </div>
        </div>

        {/* Notices */}
        {
          (user.pin === "" || !user.isProfileComplete) &&
          < div className="mt-5">
            <p className="text-[12px] font-semibold text-[#111827] mb-2">
              নোটিশ
            </p>

            <div className="space-y-3">
              {/* Notice 1 */}
              {
                user.pin === "" &&
                <div className="rounded-lg border border-[#F3E1B0] bg-[#FFF7E3] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B45309]">
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-[13px] font-bold text-[#111827]">
                        পিন সেট করা নেই
                      </h3>
                      <p className="text-[12px] text-[#6B7280] mt-1">
                        পিন সেট করে আপনার একাউন্ট আরও সুরক্ষিত করুন
                      </p>

                      <button className="mt-3 inline-flex items-center gap-2 h-8 px-3 rounded-md bg-[#1B2B8F] text-white text-[12px] font-semibold hover:opacity-95 transition">
                        <HelpCircle className="w-4 h-4" />
                        সাহায্য কেন্দ্র
                      </button>
                    </div>
                  </div>
                </div>
              }

              {/* Notice 2 */}
              {
                !user.isProfileComplete &&
                <div className="rounded-lg border border-[#F3E1B0] bg-[#FFF7E3] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#B45309]">
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-[13px] font-bold text-[#111827]">
                        প্রোফাইল সম্পন্ন করা হয়নি
                      </h3>
                      <p className="text-[12px] text-[#6B7280] mt-1">
                        প্রোফাইল সম্পন্ন করতে এখানে দেখানো ধাপগুলো অনুসরণ করুন
                      </p>

                      <button className="mt-3 inline-flex items-center gap-2 h-8 px-3 rounded-md bg-[#1B2B8F] text-white text-[12px] font-semibold hover:opacity-95 transition">
                        <HelpCircle className="w-4 h-4" />
                        সাহায্য কেন্দ্র
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        {/* Recent updates */}
        <div className="mt-6">
          <h2 className="text-[13px] font-bold text-[#111827] mb-2">
            সাম্প্রতিক আপডেট
          </h2>

          <ul className="space-y-3 text-[12.5px] text-[#111827]">
            <li className="flex gap-3">
              <span className="mt-2 w-2 h-2 rounded-full bg-[#1B2B8F] shrink-0" />
              <div>
                <p className="font-semibold">লোন আবেদন শুরু হয়েছে</p>
                <p className="text-[#6B7280] mt-0.5">
                  নির্দিষ্ট সময়ের মধ্যে আবেদন ফর্ম পূরণ করুন। আবেদন শেষ হলে
                  পরবর্তী ধাপে অগ্রসর হবে।
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="mt-2 w-2 h-2 rounded-full bg-[#1B2B8F] shrink-0" />
              <div>
                <p className="font-semibold">অ্যাকাউন্ট অনুমোদন করা হয়েছে</p>
                <p className="text-[#6B7280] mt-0.5">
                  আপনার একাউন্ট অনুমোদিত হয়েছে। এখন আপনি আমাদের সব সেবা ব্যবহার
                  করতে পারবেন।
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="mt-2 w-2 h-2 rounded-full bg-[#1B2B8F] shrink-0" />
              <div>
                <p className="font-semibold">অ্যাকাউন্ট অনুমোদন করা হয়েছে</p>
                <p className="text-[#6B7280] mt-0.5">
                  আপনার একাউন্ট অনুমোদিত হয়েছে। এখন আপনি আমাদের সব সেবা ব্যবহার
                  করতে পারবেন।
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
