import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Upload,
  Loader2,
  Copy,
  Headphones,
  Wallet,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { AuthContext } from "../../Providers/AuthProvider";

const BASE_URL = "https://loan-server-seven.vercel.app";
const IMGBB_KEY = "31305da6f416afe11565950430cdcbbb";

/* ---------------- Helpers ---------------- */

const formatBDT = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "৳0";
  return `${num.toLocaleString("en-BD")} টাকা`;
};

const formatDateOnly = (d) => {
  if (!d) return "N/A";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "N/A";
  const day = String(dt.getDate()).padStart(2, "0");
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const year = dt.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTimeOnly = (d) => {
  if (!d) return "N/A";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "N/A";
  return dt.toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeScreens = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => String(x || "").trim()).filter(Boolean);
};

const getStatusMeta = (statusRaw) => {
  const s = String(statusRaw || "").toLowerCase();
  if (s === "approved")
    return {
      label: "Approved",
      className: "bg-green-100 text-green-700 border-green-200",
    };
  if (s === "pending")
    return {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    };
  if (s === "rejected")
    return {
      label: "Rejected",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  return {
    label: statusRaw || "Unknown",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };
};

/* ---------------- Component ---------------- */

const LoanInfo = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [error, setError] = useState("");

  // Payment inputs
  const [fee, setFee] = useState("0");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Selected image local preview
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
  });
  const openModal = (type, title, message) =>
    setModal({ open: true, type, title, message });
  const closeModal = () => setModal((p) => ({ ...p, open: false }));

  useEffect(() => {
    if (!user?.phone) {
      setLoading(false);
      setError("ইউজার ফোন নাম্বার পাওয়া যায়নি।");
      return;
    }

    const fetchLoan = async () => {
      setLoading(true);
      setError("");
      setLoan(null);

      try {
        const res = await fetch(`${BASE_URL}/user-loan/${user.phone}`);
        if (!res.ok) {
          setError("ঋণের তথ্য লোড করা যায়নি।");
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setError("কোনো ঋণ আবেদন পাওয়া যায়নি।");
          return;
        }

        const first = data[0];
        setLoan(first);

        // Fee from API (transection_fee: [0])
        const apiFee =
          Array.isArray(first?.transection_fee) && first.transection_fee.length > 0
            ? first.transection_fee[0]
            : 0;
        setFee(String(apiFee ?? 0));
      } catch (err) {
        setError("ডাটা লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [user?.phone]);

  // Cleanup object URL on unmount / change
  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    };
  }, [selectedPreviewUrl]);

  const statusMeta = useMemo(
    () => getStatusMeta(loan?.loan_status),
    [loan?.loan_status]
  );
  const isApproved = String(loan?.loan_status || "").toLowerCase() === "approved";

  const paymentAccounts = useMemo(() => {
    const list = [];
    if (loan?.acc_number) {
      const pt = String(loan?.pay_type || "").toLowerCase();
      let type = "wallet";
      if (pt.includes("bkash")) type = "bkash";
      else if (pt.includes("nagad")) type = "nagad";
      else if (pt.includes("bank") || pt.includes("ব্যাংক")) type = "bank";

      list.push({
        label: loan?.pay_type || "পেমেন্ট",
        name: loan?.acc_name || "",
        value: loan.acc_number,
        type,
      });
    }
    return list;
  }, [loan]);

  const existingScreens = useMemo(
    () => normalizeScreens(loan?.transection_secrenshot),
    [loan?.transection_secrenshot]
  );

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;

    // reset old preview
    if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    setSelectedPreviewUrl("");

    if (!f) {
      setFile(null);
      return;
    }

    const ok = /^image\/(png|jpe?g|webp|bmp)$/i.test(f.type);
    if (!ok) {
      openModal(
        "warning",
        "ফাইল ভুল",
        "শুধু ছবি ফাইল (jpg, png, jpeg, webp, bmp) সিলেক্ট করুন।"
      );
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(f);
    setSelectedPreviewUrl(URL.createObjectURL(f)); // ✅ local preview
  };

  const uploadToImgbb = async (imageFile) => {
    const fd = new FormData();
    fd.append("image", imageFile);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      {
        method: "POST",
        body: fd,
      }
    );

    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error?.message || "Image upload failed");
    }
    return data?.data?.display_url || data?.data?.url;
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    if (!loan?._id) {
      openModal("error", "সমস্যা", "লোড করা লোন পাওয়া যায়নি।");
      return;
    }
    if (!isApproved) {
      openModal(
        "warning",
        "অনুমোদিত নয়",
        "লোন Approved না হলে পেমেন্ট জমা দেয়া যাবে না।"
      );
      return;
    }
    if (!file) {
      openModal("warning", "স্ক্রিনশট", "পেমেন্টের স্ক্রিনশট আপলোড করুন।");
      return;
    }

    try {
      setSubmitting(true);
      const imgUrl = await uploadToImgbb(file);

      const prev = normalizeScreens(loan?.transection_secrenshot);
      const updated = [...prev, imgUrl];

      const patchRes = await fetch(`${BASE_URL}/loan-transection/${user.phone}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transection_secrenshot: updated,
        }),
      });

      if (!patchRes.ok) {
        throw new Error("পেমেন্ট জমা দেয়া যায়নি।");
      }

      setLoan((p) => ({
        ...(p || {}),
        transection_secrenshot: updated,
        transection_fee: Array.isArray(p?.transection_fee)
          ? p.transection_fee
          : [Number(fee) || 0],
      }));

      setFile(null);

      // clear preview
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
      setSelectedPreviewUrl("");

      openModal("success", "সফল ✅", "পেমেন্ট তথ্য জমা হয়েছে।");
    } catch (err) {
      openModal("error", "ব্যর্থ", err?.message || "কিছু একটা সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(String(txt));
      //openModal("success", "কপি হয়েছে", `${txt} কপি করা হয়েছে।`);
    } catch {
      //openModal("error", "ব্যর্থ", "কপি করা যায়নি।");
    }
  };

  const clearSelectedFile = () => {
    if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    setSelectedPreviewUrl("");
    setFile(null);
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-slate-800 pb-20">
      <div className="max-w-3xl mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e293b]">ঋণ আবেদনের অবস্থা</h1>
          <p className="text-sm text-slate-500 mt-1">
            আপনার আবেদন ও পেমেন্ট স্ট্যাটাস এখানে দেখা যাবে
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl mb-6">
            {error}
          </div>
        )}

        {!loading && loan && (
          <>
            {/* Administrative Message */}
            <div className="bg-[#FFFBF0] border border-[#FDE68A] rounded-xl p-5 mb-6 relative overflow-hidden">
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#92400E] text-lg">প্রশাসনিক বার্তা</h3>

                  {isApproved ? (
                    <p className="text-sm text-[#92400E]/90 mt-2 leading-relaxed text-justify">
                      আপনার ঋণ অ্যাকাউন্টটি অনুমোদিত হয়েছে। প্রক্রিয়া সম্পূর্ণ করতে নির্ধারিত{" "}
                      <span className="font-bold">{formatBDT(fee)}</span> প্রসেসিং ফি
                      পরিশোধ করুন।
                    </p>
                  ) : (
                    <p className="text-sm text-[#92400E]/90 mt-2 leading-relaxed text-justify">
                      আপনার ঋণ আবেদনটি বর্তমানে <span className="font-bold">{statusMeta.label}</span> অবস্থায় আছে।
                      Approved হলে পেমেন্ট অপশন দেখাবে।
                    </p>
                  )}

                  <button className="mt-4 flex items-center gap-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#172554] transition shadow-md">
                    <Headphones className="w-4 h-4" />
                    সাহায্য কেন্দ্র
                  </button>
                </div>
              </div>
            </div>

            {/* Main Loan Status Card */}
            <div className="bg-[#E3E8F8] rounded-xl p-6 mb-6">
              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-3 mb-4 border-b border-blue-200/50 pb-2">
                  <h2 className="text-xl font-bold text-[#1e293b]">ঋণ আবেদনের অবস্থা</h2>
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-full border ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="space-y-2">
                  <Row label="নাম" value={loan?.fullName || "N/A"} valueClass="text-blue-700 font-semibold" />
                  <Row label="স্ট্যাটাস" value={statusMeta.label} valueClass="text-blue-700 font-bold" />
                  <Row label="সময়" value={formatTimeOnly(loan?.date)} valueClass="text-blue-700" />
                  <Row label="তারিখ" value={formatDateOnly(loan?.date)} valueClass="text-blue-700" />
                </div>
              </div>

              {/* Application Info */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1e293b] mb-3 border-b border-blue-200/50 pb-2">
                  আবেদনের তথ্য
                </h2>
                <div className="space-y-2">
                  <Row label="আবেদনের নম্বর" value={loan.apply_id || "N/A"} valueClass="text-blue-700 font-medium" />
                  <Row label="ফোন নম্বর" value={loan.phone || user?.phone || "N/A"} valueClass="text-blue-700 font-medium" />
                  <Row label="মেয়াদ শেষ" value={formatDateOnly(loan?.expire)} valueClass="text-blue-700 font-medium" />
                </div>
              </div>

              {/* Loan Info */}
              <div>
                <h2 className="text-lg font-bold text-[#1e293b] mb-3 border-b border-blue-200/50 pb-2">
                  ঋণের তথ্য
                </h2>
                <div className="space-y-2">
                  <Row label="ঋণ পরিমাণ" value={formatBDT(loan.amount)} valueClass="text-blue-700 font-bold" />
                  <Row label="মাসিক কিস্তি" value={formatBDT(loan.monthly)} valueClass="text-blue-700 font-bold" />
                  <Row label="ঋণের মেয়াদ" value={`${loan.loan_length ?? "N/A"} মাস`} valueClass="text-blue-700 font-medium" />
                  <Row label="সুদের হার" value={`${loan.profit_rate ?? 0}%`} valueClass="text-blue-700 font-medium" />
                  <Row label="সুদের পরিমাণ" value={formatBDT(loan.total_profit)} valueClass="text-blue-700 font-bold" />
                  <Row label="মোট পরিশোধযোগ্য" value={formatBDT(loan.total_pay)} valueClass="text-blue-700 font-bold" />
                </div>
              </div>
            </div>

            {/* Red Warning Strip */}
            <div className="bg-[#FFF5F5] border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-8">
              <div className="w-8 h-8 rounded bg-[#FEF2F2] border border-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <p className="text-xs sm:text-sm text-red-500 font-medium leading-relaxed">
                শুধুমাত্র সাইটে এই পেজে দেওয়া অফিসিয়াল নাম্বারে লেনদেন করুন। সাইটের বাইরে বা ব্যক্তিগত লেনদেনের দায়ভার
                কর্তৃপক্ষ নেবে না।
              </p>
            </div>

            {/* Payment Section */}
            {isApproved && (
              <div>
                <h2 className="text-xl font-bold text-[#1e293b] mb-4">পেমেন্টের তথ্য</h2>

                {/* Fee */}
                <div className="bg-[#E6EAF5] rounded-lg px-4 py-3 flex justify-between items-center mb-4">
                  <span className="text-slate-700 font-semibold">লেনদেন ফি</span>
                  <span className="text-blue-700 font-bold">
                    {formatBDT(fee).replace(" টাকা", "")} টাকা
                  </span>
                </div>

                {/* Accounts */}
                <div className="space-y-3 mb-6">
                  {paymentAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            acc.type === "bkash"
                              ? "bg-pink-100 text-pink-600"
                              : acc.type === "nagad"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            {acc.label} {acc.name ? `- ${acc.name}` : ""} (সেন্ড মানি)
                          </p>
                          <p className="text-lg font-bold text-slate-800">{acc.value}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => copyText(acc.value)}
                        className="flex items-center gap-1 bg-[#EFF6FF] text-[#1E3A8A] px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
                      >
                        <Copy className="w-4 h-4" />
                        কপি
                      </button>
                    </div>
                  ))}

                  {paymentAccounts.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-2">
                      কোনো পেমেন্ট অ্যাকাউন্ট পাওয়া যায়নি
                    </div>
                  )}
                </div>

                {/* Inputs & Upload */}
                <div className="bg-[#F8FAFC] p-5 rounded-xl border border-dashed border-blue-200">
                  
                  {/* Upload */}
                  <label className="cursor-pointer block">
                    <div className="h-32 rounded-xl bg-[#EFF6FF] border-2 border-dashed border-[#BFDBFE] flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition">
                      {file ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                          <p className="text-sm font-semibold text-green-700">{file.name}</p>
                          <p className="text-xs text-green-600">চেঞ্জ করতে ক্লিক করুন</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#1E3A8A]" />
                          <p className="text-sm font-bold text-[#1E3A8A]">
                            স্ক্রিনশট আপলোড করতে ক্লিক করুন
                          </p>
                        </>
                      )}
                    </div>

                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp"
                      onChange={handleFileChange}
                    />
                  </label>

                  {/* ✅ Preview */}
                  <div className="mt-5">
                    <p className="text-sm font-bold text-slate-700 mb-2">স্ক্রিনশট প্রিভিউ</p>

                    {/* New selected preview */}
                    {selectedPreviewUrl && (
                      <div className="mb-4 rounded-xl border border-blue-200 bg-white p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-blue-700">
                            নতুন সিলেক্ট করা স্ক্রিনশট
                          </p>
                          <button
                            type="button"
                            onClick={clearSelectedFile}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
                          >
                            <X className="w-3 h-3" /> রিমুভ
                          </button>
                        </div>
                        <img
                          src={selectedPreviewUrl}
                          alt="Selected preview"
                          className="w-full max-h-72 object-contain rounded-lg bg-slate-50"
                        />
                      </div>
                    )}

                    {/* Existing screenshots */}
                    {existingScreens.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {existingScreens.map((url, i) => (
                          <a
                            key={url + i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl overflow-hidden border border-slate-200 bg-white hover:shadow-md transition"
                            title="ক্লিক করলে নতুন ট্যাবে ওপেন হবে"
                          >
                            <img
                              src={url}
                              alt={`screenshot-${i + 1}`}
                              className="w-full h-28 sm:h-32 object-cover bg-slate-50"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="p-2">
                              <p className="text-xs text-slate-600 font-semibold">
                                স্ক্রিনশট #{i + 1}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">এখনো কোনো সাবমিট করা স্ক্রিনশট নেই</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmitPayment}
                  disabled={submitting}
                  className="w-full mt-6 bg-[#1E3A8A] text-white h-12 rounded-lg font-bold text-lg hover:bg-[#172554] transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> অপেক্ষা করুন...
                    </>
                  ) : (
                    "পেমেন্ট জমা দিন"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                modal.type === "success"
                  ? "bg-green-100 text-green-600"
                  : modal.type === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {modal.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{modal.title}</h3>
            <p className="text-gray-600 mt-2 mb-6">{modal.message}</p>
            <button
              onClick={closeModal}
              className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold hover:bg-[#172554]"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanInfo;

const Row = ({ label, value, valueClass = "" }) => (
  <div className="flex justify-between items-center text-sm sm:text-base">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className={`text-right ${valueClass}`}>{value}</span>
  </div>
);
