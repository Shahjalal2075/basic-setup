import React, { useContext, useMemo, useState, useEffect } from "react";
import { AuthContext } from "../../Providers/AuthProvider";
import { Link } from "react-router-dom";

/* ---------------- Helpers ---------------- */

const API_BASE = "https://loan-server-seven.vercel.app";

const bnNumber = (n) => {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
    return Number(n).toLocaleString("bn-BD");
};

const bnMoney = (n) => `${bnNumber(n)} টাকা`;

const toNumberSafe = (v) => {
    const num = Number(String(v).replace(/[^\d.]/g, ""));
    return Number.isFinite(num) ? num : 0;
};

const addMonths = (date, months) => {
    const d = new Date(date);
    const m = Number(months) || 0;
    const newDate = new Date(d);
    newDate.setMonth(newDate.getMonth() + m);
    return newDate;
};

const formatDateBN = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    // dd/mm/yyyy in bn digits
    const str = `${dd}/${mm}/${yyyy}`;
    // convert to bn digits using locale
    return str.replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[Number(x)]);
};

// Try to fetch existing apply IDs and ensure uniqueness.
async function generateUniqueApplyId() {
    const makeId = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

    // Try get existing loans to avoid duplicates
    try {
        const res = await fetch(`${API_BASE}/loan`, { method: "GET" });
        if (!res.ok) throw new Error("GET /loan failed");
        const list = await res.json();

        const used = new Set(
            (Array.isArray(list) ? list : [])
                .map((x) => String(x?.apply_id ?? ""))
                .filter(Boolean)
        );

        for (let i = 0; i < 25; i++) {
            const id = makeId();
            if (!used.has(id)) return id;
        }

        // very unlikely fallback
        return makeId();
    } catch {
        // If server doesn't allow GET or fails, fallback to low-collision method
        // Still 6 digits: combine time last digits + random, retry a bit
        for (let i = 0; i < 20; i++) {
            const timePart = String(Date.now()).slice(-4); // last 4
            const randPart = String(Math.floor(10 + Math.random() * 90)); // 2 digits
            const id = `${timePart}${randPart}`; // 6 digits
            if (id.length === 6) return id;
        }
        return String(Math.floor(100000 + Math.random() * 900000));
    }
}

/* ---------------- UI bits ---------------- */

const Stepper = ({ step }) => {
    const active = "#1B2B8F";
    const inactive = "#D9E1F5";

    return (
        <div className="mt-3">
            <p className="text-xs text-gray-500">আজকে আপনার পক্ষ আবেদনগুলো শুরু করতে পারেন</p>

            <div className="mt-4 flex items-center gap-0">
                <div className="w-3 h-3 rounded-full" style={{ background: step >= 1 ? active : inactive }} />
                <div className="flex-1 h-[6px] rounded-full mx-2" style={{ background: step >= 2 ? active : inactive }} />
                <div className="w-3 h-3 rounded-full" style={{ background: step >= 2 ? active : inactive }} />
                <div className="flex-1 h-[6px] rounded-full mx-2" style={{ background: step >= 3 ? active : inactive }} />
                <div className="w-3 h-3 rounded-full" style={{ background: step >= 3 ? active : inactive }} />
            </div>
        </div>
    );
};

const Pill = ({ active, children, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`h-9 px-4 rounded-full text-sm font-semibold border transition ${active
            ? "bg-[#1B2B8F] text-white border-[#1B2B8F]"
            : "bg-white text-[#111827] border-gray-200 hover:bg-gray-50"
            }`}
    >
        {children}
    </button>
);

const MethodBtn = ({ active, label, onClick, icon }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-2 w-full h-11 rounded-lg border px-4 transition ${active ? "border-[#1B2B8F] bg-[#EEF1FA]" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
    >
        <div className="border border-[#1a237e] p-1.5 rounded-full">
            <img className="w-5" src={label === "বিকাশ" ? "https://i.ibb.co.com/MxX9qpNf/2630-vector.png" : label === "নগদ" ? "https://i.ibb.co.com/whGHsN87/2640-vector.png" : "https://i.ibb.co.com/Vcvd6Yvm/Vector.png"} alt="" />
        </div>
        <span className="text-sm font-bold text-[#111827]">{label}</span>
        {active && <span className="ml-auto w-2 h-2 rounded-full bg-[#1B2B8F]" />}
    </button>
);

/* ---------------- Main ---------------- */

const LoanApply = () => {
    const { user } = useContext(AuthContext);

    const [applyId, setApplyId] = useState(""); // ✅ show in step-3


    const userPhone =
        user?.phone;

    const PROFIT_RATE = 8.4; // % (as your UI)

    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [posting, setPosting] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const ensureId = async () => {
            if (step !== 3) return;
            if (applyId) return;
            const id = await generateUniqueApplyId();
            if (!cancelled) setApplyId(id);
        };

        ensureId();

        return () => {
            cancelled = true;
        };
    }, [step, applyId]);


    // Step 1
    const [payType, setPayType] = useState("বিকাশ");
    const [accName, setAccName] = useState("");
    const [accNumber, setAccNumber] = useState("");

    // Step 2
    const amountPresets = useMemo(() => [10000, 20000, 30000, 40000, 50000], []);
    const monthPresets = useMemo(() => [3, 6, 9, 12], []);

    const [amount, setAmount] = useState(50000);
    const [months, setMonths] = useState(6);

    const today = useMemo(() => new Date(), []);
    const expireDate = useMemo(() => addMonths(today, months), [today, months]);

    const totalProfit = useMemo(() => Math.round((Number(amount) * PROFIT_RATE) / 100), [amount]);
    const totalPay = useMemo(() => Number(amount) + Number(totalProfit), [amount, totalProfit]);
    const monthly = useMemo(() => {
        const m = Number(months) || 1;
        return Math.round(totalPay / m);
    }, [totalPay, months]);

    // Step 3
    const [agree, setAgree] = useState(false);

    const title = useMemo(() => {
        if (step === 1) return "ঋণ পরিশোধের মাধ্যম";
        if (step === 2) return "ঋণ আবেদনের ধরন";
        return "ঋণ আবেদনের ফর্ম";
    }, [step]);

    const validate = () => {
        const e = {};

        if (step === 1) {
            if (!payType) e.payType = "পেমেন্ট মাধ্যম নির্বাচন করুন";
            if (!accName.trim()) e.accName = "অ্যাকাউন্টের নাম দিন";
            if (!accNumber.trim()) e.accNumber = "অ্যাকাউন্টের নম্বর দিন";
            if (!userPhone) e.phone = "ব্যবহারকারীর ফোন নেই";
        }

        if (step === 2) {
            if (!amount || Number(amount) <= 0) e.amount = "সঠিক পরিমাণ দিন";
            if (!months || Number(months) <= 0) e.months = "মেয়াদ দিন";
        }

        if (step === 3) {
            if (!agree) e.agree = "নিয়ম ও শর্তাবলী গ্রহণ করুন";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => {
        if (!validate()) return;
        setErrors({});
        setStep((p) => Math.min(3, p + 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const back = () => {
        setErrors({});
        setStep((p) => Math.max(1, p - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const submit = async () => {
        if (!validate()) return;

        setPosting(true);
        try {
            const apply_id = applyId || (await generateUniqueApplyId());

            const payload = {
                apply_id, // 6 digit unique
                date: new Date().toISOString(),
                amount: Number(amount),
                monthly: Number(monthly),
                loan_length: Number(months),
                expire: expireDate,
                profit_rate: PROFIT_RATE,
                total_profit: Number(totalProfit),
                total_pay: Number(totalPay),
                pay_type: payType,
                acc_name: accName.trim(),
                acc_number: accNumber.trim(),
                phone: userPhone,
                transection_fee: [0],
                transection_secrenshot: [""],
                loan_status: "Pending",
                fullName: user.userInfo.fullName
            };

            const res = await fetch(`${API_BASE}/loan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.message || "Loan apply failed");
            }

            console.log("LOAN APPLY SUBMIT:", payload);
            setSuccessOpen(true);
        } catch (err) {
            console.error(err);
            setErrors((p) => ({
                ...p,
                submit: "সাবমিট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
            }));
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
                <h1 className="text-2xl font-extrabold text-[#111827] text-center">{title}</h1>
                <Stepper step={step} />

                {errors.submit && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {errors.submit}
                    </div>
                )}

                {/* ---------------- STEP 1: Payment ---------------- */}
                {step === 1 && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-[#111827] mb-2">পদ্ধতি</label>
                            <div className="grid grid-cols-3 gap-3">
                                <MethodBtn
                                    active={payType === "বিকাশ"}
                                    label="বিকাশ"
                                    onClick={() => setPayType("বিকাশ")}
                                    icon={<span className="text-[10px] font-extrabold text-[#1B2B8F]">ব</span>}
                                />
                                <MethodBtn
                                    active={payType === "ব্যাংক"}
                                    label="ব্যাংক"
                                    onClick={() => setPayType("ব্যাংক")}
                                    icon={<span className="text-[10px] font-extrabold text-[#1B2B8F]">R</span>}
                                />
                                <MethodBtn
                                    active={payType === "নগদ"}
                                    label="নগদ"
                                    onClick={() => setPayType("নগদ")}
                                    icon={<span className="text-[10px] font-extrabold text-[#1B2B8F]">N</span>}
                                />
                            </div>
                            {errors.payType && <p className="mt-1 text-xs text-red-500">{errors.payType}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#111827] mb-2">অ্যাকাউন্টের নাম</label>
                            <input
                                value={accName}
                                onChange={(e) => setAccName(e.target.value)}
                                placeholder="আপনার পূর্ণ নাম লিখুন"
                                className={`w-full h-11 px-4 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30 ${errors.accName ? "border-red-400" : "border-gray-200"
                                    }`}
                            />
                            {errors.accName && <p className="mt-1 text-xs text-red-500">{errors.accName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#111827] mb-2">অ্যাকাউন্টের নং</label>
                            <input
                                value={accNumber}
                                onChange={(e) => setAccNumber(e.target.value)}
                                placeholder="১১ সংখ্যার মোবাইল নম্বর দিন"
                                className={`w-full h-11 px-4 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30 ${errors.accNumber ? "border-red-400" : "border-gray-200"
                                    }`}
                            />
                            {errors.accNumber && <p className="mt-1 text-xs text-red-500">{errors.accNumber}</p>}
                        </div>

                        <button
                            onClick={next}
                            className="mt-2 w-full h-12 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition"
                        >
                            পরবর্তী
                        </button>
                    </div>
                )}

                {/* ---------------- STEP 2: Type ---------------- */}
                {step === 2 && (
                    <div className="mt-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-start">
                            <div>
                                <label className="block text-sm font-extrabold text-[#111827] mb-2">ঋণ পরিমাণ (টাকা)</label>
                                <p className="text-xs text-gray-500 mb-2">১০,০০০ - ৩০,০০,০০০ টাকা</p>

                                <div className="flex flex-wrap gap-2">
                                    {amountPresets.map((a) => (
                                        <Pill key={a} active={Number(amount) === a} onClick={() => setAmount(a)}>
                                            {bnNumber(a)}
                                        </Pill>
                                    ))}
                                </div>
                                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-extrabold text-[#111827] mb-2">মনে পছন্দের পরিমাণ</label>
                                <input
                                    value={amount}
                                    onChange={(e) => setAmount(toNumberSafe(e.target.value))}
                                    placeholder="আপনি পরিমাণ লিখুন"
                                    className={`w-full h-11 px-4 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30 ${errors.amount ? "border-red-400" : "border-gray-200"
                                        }`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 items-start">
                            <div>
                                <label className="block text-sm font-extrabold text-[#111827] mb-2">ঋণ মেয়াদ (মাস)</label>
                                <p className="text-xs text-gray-500 mb-2">১ - ৩৬ মাস</p>

                                <div className="flex flex-wrap gap-2">
                                    {monthPresets.map((m) => (
                                        <Pill key={m} active={Number(months) === m} onClick={() => setMonths(m)}>
                                            {bnNumber(m)} মাস
                                        </Pill>
                                    ))}
                                </div>
                                {errors.months && <p className="mt-1 text-xs text-red-500">{errors.months}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-extrabold text-[#111827] mb-2">মেয়াদ (মাস) লিখুন</label>
                                <input
                                    value={months}
                                    onChange={(e) => setMonths(toNumberSafe(e.target.value))}
                                    placeholder="আপনি মাস লিখুন"
                                    className={`w-full h-11 px-4 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30 ${errors.months ? "border-red-400" : "border-gray-200"
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Summary box (like screenshot) */}
                        <div className="rounded-xl bg-[#EEF1FA] p-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 font-semibold">মাসিক কিস্তি</p>
                                <p className="text-2xl font-extrabold text-[#1B2B8F] mt-1">
                                    {bnMoney(monthly)}
                                </p>
                            </div>

                            <div className="mt-4 flex items-start justify-between text-sm">
                                <div>
                                    <p className="text-gray-500">সুদের পরিমাণ</p>
                                    <p className="font-extrabold text-[#111827]">{bnMoney(totalPay - amount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500">মোট পরিশোধযোগ্য</p>
                                    <p className="font-extrabold text-[#111827]">{bnMoney(totalPay)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={next}
                            className="w-full h-12 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition"
                        >
                            পরবর্তী
                        </button>

                        <button
                            onClick={back}
                            type="button"
                            className="w-full h-11 rounded-xl bg-[#EEF1FA] text-[#111827] font-semibold"
                        >
                            ফিরে যান
                        </button>
                    </div>
                )}

                {/* ---------------- STEP 3: Final Form ---------------- */}
                {step === 3 && (
                    <div className="mt-6">
                        <div className="rounded-2xl bg-[#EEF1FA] border border-[#E5E7EB] overflow-hidden">
                            {/* Header */}
                            <div className="px-5 pt-5">
                                <div className="relative">
                                    <h2 className="text-center text-[18px] font-extrabold text-[#111827]">
                                        ঋণ আবেদন ফর্ম
                                    </h2>
                                    <button
                                        type="button"
                                        className="absolute right-0 top-0 text-[#111827]/70 hover:text-[#111827] transition"
                                        onClick={() => back()} // চাইলে edit এ step-2 এ পাঠাবে
                                        aria-label="Edit"
                                        title="Edit"
                                    >
                                        ✎
                                    </button>
                                    <p className="text-center text-[12px] text-gray-500 mt-1">
                                        নিচের তথ্য যাচাই করে নিশ্চিত করুন
                                    </p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-5 pb-5 pt-4 text-[13px]">
                                {/* Section: আবেদনের তথ্য */}
                                <h3 className="font-extrabold text-[#111827] mb-2">আবেদনের তথ্য</h3>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">আবেদনের নম্বর</span>
                                        <span className="font-extrabold text-[#1B2B8F]">
                                            {applyId ? applyId.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) : "......"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">আবেদনের তারিখ</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{formatDateBN(new Date())}</span>
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className="h-4" />

                                {/* Section: ঋণের তথ্য */}
                                <h3 className="font-extrabold text-[#111827] mb-2">ঋণের তথ্য</h3>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">ঋণ পরিমাণ</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{bnMoney(amount)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">মাসিক কিস্তি</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{bnMoney(monthly)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">ঋণের মেয়াদ</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{bnNumber(months)} মাস</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">সুদের হার</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{bnNumber(PROFIT_RATE)} %</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">সুদের পরিমাণ</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{bnMoney(totalProfit)}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">মোট পরিশোধযোগ্য</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{bnMoney(totalPay)}</span>
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className="h-4" />

                                {/* Section: পরিশোধের মাধ্যম */}
                                <h3 className="font-extrabold text-[#111827] mb-2">পরিশোধের মাধ্যম</h3>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">পদ্ধতি</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{payType}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">অ্যাকাউন্টের নাম</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{accName}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">অ্যাকাউন্ট নং</span>
                                        <span className="font-extrabold text-[#1B2B8F]">{accNumber}</span>
                                    </div>
                                </div>

                                {/* Spacer */}
                                <div className="h-4" />

                                {/* Rules */}
                                <h3 className="font-extrabold text-[#111827] mb-2">নিয়ম ও শর্তাবলী</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                    <li>নির্ধারিত সময়ের মধ্যে ঋণ পরিশোধ করতে হবে।</li>
                                    <li>ভুল বা অসম্পূর্ণ তথ্য প্রদান করলে আবেদন বাতিল হতে পারে।</li>
                                    <li>আপনার তথ্য সফলভাবে যাচাই করা হয়েছে। এখন আপনি আবেদন সম্পন্ন করতে পারবেন।</li>
                                </ul>

                                {/* Checkbox row */}
                                <div className="mt-4 flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        checked={agree}
                                        onChange={(e) => setAgree(e.target.checked)}
                                        className="mt-1 w-4 h-4 accent-[#1B2B8F]"
                                    />
                                    <p className="text-gray-700 leading-relaxed">
                                        এই ফর্ম জমা দেওয়ার মাধ্যমে আমি প্রযোজ্য নিয়ম ও শর্তাবলীতে সম্মতি প্রদান করছি।
                                    </p>
                                </div>
                                {errors.agree && <p className="mt-1 text-xs text-red-500">{errors.agree}</p>}
                            </div>

                            {/* Bottom Button (outside card body like screenshot) */}
                            <div className="px-5 pb-5">
                                <button
                                    onClick={submit}
                                    disabled={posting}
                                    className="w-full h-12 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition disabled:opacity-60"
                                >
                                    {posting ? "সাবমিট হচ্ছে..." : "নিশ্চিত"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Success modal */}
                {successOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setSuccessOpen(false)}
                        />
                        <div className="relative w-full max-w-lg rounded-2xl bg-white border shadow-xl overflow-hidden">
                            <div className="p-5 border-b">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-extrabold text-[#111827]">আবেদন সফল ✅</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            আপনার ঋণ আবেদন জমা হয়েছে। Console এ payload দেখুন।
                                        </p>
                                    </div>
                                    <button
                                        className="w-9 h-9 rounded-lg hover:bg-gray-100"
                                        onClick={() => setSuccessOpen(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="rounded-xl bg-[#EEF1FA] p-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">পরিমাণ</span>
                                        <span className="font-extrabold">{bnMoney(amount)}</span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-gray-500">মাসিক কিস্তি</span>
                                        <span className="font-extrabold">{bnMoney(monthly)}</span>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-center items-center">
                                    <Link
                                        className=" px-6 py-3 rounded-xl bg-[#1B2B8F] text-white font-extrabold"
                                        to={'/dashboard'}
                                    >
                                        ঠিক আছে
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanApply;
