import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";

// ✅ imgbb key
const IMGBB_KEY = "31305da6f416afe11565950430cdcbbb";
const BASE_URL = "https://loan-server-seven.vercel.app";

/* ---------------------- Reusable UI Components (Outside) ---------------------- */

const Field = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  disabled = false,
}) => (
  <div>
    <label className="block text-sm font-semibold text-[#111827] mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-11 px-4 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30
        ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}
        ${error ? "border-red-400" : "border-gray-200"}
      `}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const UploadBox = ({ label, name, file, onPick, error, disabled = false }) => (
  <div>
    <label className="block text-sm font-semibold text-[#111827] mb-2">
      {label}
    </label>

    <div
      className={`w-full rounded-lg border border-dashed px-4 py-6 flex items-center justify-center gap-2 select-none
        ${disabled
          ? "bg-gray-100 cursor-not-allowed border-gray-200"
          : "bg-[#EEF1FA] cursor-pointer border-[#C7D2FE]"}
        ${error ? "border-red-400" : ""}
      `}
      onClick={() => {
        if (disabled) return;
        document.getElementById(`file-${name}`)?.click();
      }}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3v10"
          stroke="#1B2B8F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 7l4-4 4 4"
          stroke="#1B2B8F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
          stroke="#1B2B8F"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <span className="text-sm font-semibold text-[#1B2B8F]">
        {file
          ? file.name
          : disabled
            ? "প্রোফাইল সম্পূর্ণ—আপলোড বন্ধ"
            : "এখানে আপলোড করতে ক্লিক করুন"}
      </span>
    </div>

    <input
      id={`file-${name}`}
      type="file"
      accept="image/*"
      className="hidden"
      disabled={disabled}
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        onPick(f);
      }}
    />

    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const Stepper = ({ step }) => {
  const active = "#1B2B8F";
  const inactive = "#D9E1F5";

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500">
        আজকে আপনার পক্ষ আবেদনগুলো শুরু করতে পারেন
      </p>

      <div className="mt-4 flex items-center gap-0">
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: step >= 1 ? active : inactive }}
        />
        <div
          className="flex-1 h-[6px] rounded-full mx-2"
          style={{ background: step >= 2 ? active : inactive }}
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: step >= 2 ? active : inactive }}
        />
        <div
          className="flex-1 h-[6px] rounded-full mx-2"
          style={{ background: step >= 3 ? active : inactive }}
        />
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: step >= 3 ? active : inactive }}
        />
      </div>
    </div>
  );
};

/* ------------------------------- Simple Success Modal ------------------------------ */

const SuccessModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 text-center">
          <div className="text-3xl">✅</div>
          <h3 className="mt-2 text-lg font-extrabold text-[#111827]">
            সাবমিট সফল হয়েছে
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            আপনার প্রোফাইল আপডেট সম্পন্ন হয়েছে।
          </p>

          <button
            onClick={onClose}
            className="mt-5 w-full h-11 rounded-xl bg-[#1B2B8F] text-white font-bold hover:bg-[#16206B] transition"
          >
            ড্যাশবোর্ডে যান
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------- Main Component ------------------------------ */

const Verify = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ true হলে সব field lock
  const isLocked = user?.isProfileComplete === true;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const [successOpen, setSuccessOpen] = useState(false);

  // Step 1
  const [s1, setS1] = useState(() => ({
    fullName: user?.isProfileComplete ? user?.userInfo?.fullName || "" : "",
    nid: user?.isProfileComplete ? user?.userInfo?.nid || "" : "",
    mobile: user?.isProfileComplete ? user?.userInfo?.mobile || "" : "",
    profession: user?.isProfileComplete ? user?.userInfo?.profession || "" : "",
    presentAddress: user?.isProfileComplete ? user?.userInfo?.presentAddress || "" : "",
    permanentAddress: user?.isProfileComplete ? user?.userInfo?.permanentAddress || "" : "",
    loanReason: user?.isProfileComplete ? user?.userInfo?.loanReason || "" : "",
  }));


  // Step 2
  const [s2, setS2] = useState(() => ({
    nomineeName: user?.isProfileComplete ? user?.userInfo?.nomineeName || "" : "",
    relation: user?.isProfileComplete ? user?.userInfo?.relation || "" : "",
    nomineeMobile: user?.isProfileComplete ? user?.userInfo?.nomineeMobile || "" : "",
    nomineeNid: user?.isProfileComplete ? user?.userInfo?.nomineeNid || "" : "",
    nomineeAddress: user?.isProfileComplete ? user?.userInfo?.nomineeAddress || "" : "",
  }));


  // Step 3
  const [s3, setS3] = useState({
    photo: null,
    nidFront: null,
    nidBack: null,
    incomeDoc: null,
    signatureFile: null,
  });

  const title = useMemo(() => {
    if (step === 1) return "আপনার তথ্য";
    if (step === 2) return "নমিনির তথ্য";
    return "সংযুক্তি";
  }, [step]);

  const isBlank = (v) => !String(v ?? "").trim();

  const validateStep = (which) => {
    const e = {};

    if (which === 1) {
      if (isBlank(s1.fullName)) e.fullName = "পূর্ণ নাম দিন";
      if (isBlank(s1.nid)) e.nid = "জাতীয় পরিচয় পত্র নম্বর দিন";
      if (isBlank(s1.mobile)) e.mobile = "মোবাইল নম্বর দিন";
      if (isBlank(s1.profession)) e.profession = "পেশা দিন";
      if (isBlank(s1.presentAddress)) e.presentAddress = "বর্তমান ঠিকানা দিন";
      if (isBlank(s1.permanentAddress)) e.permanentAddress = "স্থায়ী ঠিকানা দিন";
      if (isBlank(s1.loanReason)) e.loanReason = "ঋণের কারণ লিখুন";
    }

    if (which === 2) {
      if (isBlank(s2.nomineeName)) e.nomineeName = "নমিনির নাম দিন";
      if (isBlank(s2.relation)) e.relation = "সম্পর্ক দিন";
      if (isBlank(s2.nomineeMobile)) e.nomineeMobile = "নমিনির মোবাইল নম্বর দিন";
      if (isBlank(s2.nomineeNid)) e.nomineeNid = "নমিনির এনআইডি দিন";
      if (isBlank(s2.nomineeAddress)) e.nomineeAddress = "নমিনির ঠিকানা দিন";
    }

    if (which === 3) {
      if (!s3.photo) e.photo = "ছবি আপলোড করুন";
      if (!s3.nidFront) e.nidFront = "জাতীয় পরিচয় পত্রের সামনের অংশ আপলোড করুন";
      if (!s3.nidBack) e.nidBack = "জাতীয় পরিচয় পত্রের পিছনের অংশ আপলোড করুন";
      if (!s3.incomeDoc) e.incomeDoc = "আয়ের ডকুমেন্ট আপলোড করুন";
      if (!s3.signatureFile) e.signatureFile = "স্বাক্ষর (ছবি) আপলোড করুন";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    setDraftSaved(false);
    if (!validateStep(step)) return;
    setErrors({});
    setStep((p) => Math.min(3, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setDraftSaved(false);
    setErrors({});
    setStep((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadToImgbb = async (file) => {
    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: "POST",
      body: form,
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || "Image upload failed");
    }

    return json?.data?.url; // ✅ only image link
  };

  const saveDraft = () => {
    if (isLocked) return;
    setDraftSaved(true);
    console.log("DRAFT:", { step1: s1, step2: s2, step3: s3 });
  };

  const handleSubmit = async () => {
    if (isLocked) return;

    if (!user?.phone) {
      setErrors((p) => ({ ...p, submit: "ইউজার ফোন পাওয়া যায়নি। লগইন চেক করুন।" }));
      return;
    }

    if (!validateStep(3)) return;

    setSubmitting(true);
    try {
      // ✅ Upload all images -> only URL
      const [photoUrl, nidFrontUrl, nidBackUrl, incomeDocUrl, signatureUrl] =
        await Promise.all([
          uploadToImgbb(s3.photo),
          uploadToImgbb(s3.nidFront),
          uploadToImgbb(s3.nidBack),
          uploadToImgbb(s3.incomeDoc),
          uploadToImgbb(s3.signatureFile),
        ]);

      const updatedUserInfo = {
        ...s1,
        ...s2,
        photoUrl,
        nidFrontUrl,
        nidBackUrl,
        incomeDocUrl,
        signatureUrl,
      };

      const payload = {
        userInfo: updatedUserInfo,
        isProfileComplete: true,
        profileCompletedAt: new Date().toISOString(),
      };

      // ✅ PATCH request
      const res = await fetch(
        `${BASE_URL}/update-user-info/${encodeURIComponent(user.phone)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Update failed");

      // ✅ update AuthContext user (only required 2 fields)
      setUser((prev) => ({
        ...prev,
        userInfo: updatedUserInfo,
        isProfileComplete: true,
      }));

      // ✅ show success modal
      setSuccessOpen(true);
      setErrors({});
    } catch (err) {
      console.error(err);
      setErrors((p) => ({
        ...p,
        submit: err?.message || "ইমেজ আপলোড/সাবমিট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
        <h1 className="text-2xl font-extrabold text-[#111827]">{title}</h1>
        <Stepper step={step} />

        {isLocked && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">

            এই ডকুমেন্টগুলো আগেই সাবমিট করা হয়েছে

          </div>
        )}

        {errors.submit && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        <div className="mt-6 space-y-5">
          {/* Step 1 */}
          {step === 1 && (
            <>
              <Field
                label="পূর্ণ নাম লিখুন"
                placeholder="আপনার পূর্ণ নাম লিখুন"
                value={s1.fullName}
                onChange={(v) => setS1((p) => ({ ...p, fullName: v }))}
                error={errors.fullName}
                disabled={isLocked}
              />

              <Field
                label="জাতীয় পরিচয় পত্র নম্বর"
                placeholder="জাতীয় পরিচয় পত্র নম্বর লিখুন"
                value={s1.nid}
                onChange={(v) => setS1((p) => ({ ...p, nid: v }))}
                error={errors.nid}
                disabled={isLocked}
              />

              <Field
                label="মোবাইল নম্বর"
                placeholder="১১ সংখ্যার মোবাইল নম্বর দিন"
                value={s1.mobile}
                onChange={(v) => setS1((p) => ({ ...p, mobile: v }))}
                error={errors.mobile}
                disabled={isLocked}
              />

              <Field
                label="পেশা"
                placeholder="পেশা লিখুন"
                value={s1.profession}
                onChange={(v) => setS1((p) => ({ ...p, profession: v }))}
                error={errors.profession}
                disabled={isLocked}
              />

              <Field
                label="বর্তমান ঠিকানা"
                placeholder="বর্তমান ঠিকানা দিন"
                value={s1.presentAddress}
                onChange={(v) => setS1((p) => ({ ...p, presentAddress: v }))}
                error={errors.presentAddress}
                disabled={isLocked}
              />

              <Field
                label="স্থায়ী ঠিকানা"
                placeholder="স্থায়ী ঠিকানা দিন"
                value={s1.permanentAddress}
                onChange={(v) => setS1((p) => ({ ...p, permanentAddress: v }))}
                error={errors.permanentAddress}
                disabled={isLocked}
              />

              <Field
                label="ঋণের কারণ"
                placeholder="ঋণের কারণ লিখুন"
                value={s1.loanReason}
                onChange={(v) => setS1((p) => ({ ...p, loanReason: v }))}
                error={errors.loanReason}
                disabled={isLocked}
              />

              <button
                onClick={goNext}
                className="w-full h-12 rounded-lg bg-[#1B2B8F] text-white font-bold hover:bg-[#16206B] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                পরবর্তী
              </button>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <Field
                label="নমিনির নাম"
                placeholder="নমিনির নাম লিখুন"
                value={s2.nomineeName}
                onChange={(v) => setS2((p) => ({ ...p, nomineeName: v }))}
                error={errors.nomineeName}
                disabled={isLocked}
              />

              <Field
                label="সম্পর্ক"
                placeholder="সম্পর্ক লিখুন"
                value={s2.relation}
                onChange={(v) => setS2((p) => ({ ...p, relation: v }))}
                error={errors.relation}
                disabled={isLocked}
              />

              <Field
                label="নমিনির মোবাইল নম্বর"
                placeholder="নমিনির মোবাইল নম্বর লিখুন"
                value={s2.nomineeMobile}
                onChange={(v) => setS2((p) => ({ ...p, nomineeMobile: v }))}
                error={errors.nomineeMobile}
                disabled={isLocked}
              />

              <Field
                label="নমিনির এনআইডি"
                placeholder="নমিনির এনআইডি লিখুন"
                value={s2.nomineeNid}
                onChange={(v) => setS2((p) => ({ ...p, nomineeNid: v }))}
                error={errors.nomineeNid}
                disabled={isLocked}
              />

              <Field
                label="নমিনির ঠিকানা"
                placeholder="নমিনির ঠিকানা লিখুন"
                value={s2.nomineeAddress}
                onChange={(v) => setS2((p) => ({ ...p, nomineeAddress: v }))}
                error={errors.nomineeAddress}
                disabled={isLocked}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={goBack}
                  type="button"
                  className="h-12 rounded-lg bg-[#EEF1FA] text-[#111827] font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  ফিরে যান
                </button>
                <button
                  onClick={goNext}
                  className="h-12 rounded-lg bg-[#1B2B8F] text-white font-bold hover:bg-[#16206B] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  পরবর্তী
                </button>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <UploadBox
                label="ছবি"
                name="photo"
                file={s3.photo}
                onPick={(f) => setS3((p) => ({ ...p, photo: f }))}
                error={errors.photo}
                disabled={isLocked}
              />

              <UploadBox
                label="জাতীয় পরিচয় পত্রের সামনের অংশ"
                name="nidFront"
                file={s3.nidFront}
                onPick={(f) => setS3((p) => ({ ...p, nidFront: f }))}
                error={errors.nidFront}
                disabled={isLocked}
              />

              <UploadBox
                label="জাতীয় পরিচয় পত্রের পিছনের অংশ"
                name="nidBack"
                file={s3.nidBack}
                onPick={(f) => setS3((p) => ({ ...p, nidBack: f }))}
                error={errors.nidBack}
                disabled={isLocked}
              />

              <UploadBox
                label="আয়ের ডকুমেন্ট"
                name="incomeDoc"
                file={s3.incomeDoc}
                onPick={(f) => setS3((p) => ({ ...p, incomeDoc: f }))}
                error={errors.incomeDoc}
                disabled={isLocked}
              />

              <UploadBox
                label="স্বাক্ষর (সিগনেচার ছবি)"
                name="signatureFile"
                file={s3.signatureFile}
                onPick={(f) => setS3((p) => ({ ...p, signatureFile: f }))}
                error={errors.signatureFile}
                disabled={isLocked}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isLocked}
                  className="h-11 rounded-lg bg-[#EEF1FA] text-[#111827] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-[#1B2B8F]">✎</span> খসড়া
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  className="h-11 rounded-lg bg-[#EEF1FA] text-[#111827] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-[#1B2B8F]">↩</span> ফিরে যান
                </button>
              </div>

              {draftSaved && (
                <p className="text-xs text-green-600 -mt-2">
                  খসড়া সেভ হয়েছে (console এ দেখুন)
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || isLocked}
                className="w-full h-12 rounded-lg bg-[#1B2B8F] text-white font-bold hover:bg-[#16206B] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLocked ? "প্রোফাইল সম্পূর্ণ" : submitting ? "আপলোড হচ্ছে..." : "নিশ্চিত"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✅ Success Modal (no info) + navigate dashboard */}
      <SuccessModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          navigate("/dashboard");
        }}
      />
    </div>
  );
};

export default Verify;
