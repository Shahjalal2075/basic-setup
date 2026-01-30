import React, { useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { X, Trash2 } from "lucide-react";
import { AuthContext } from "../../Providers/AuthProvider";

const BASE_URL = "https://loan-server-seven.vercel.app";

const bankLabelBn = (t) => {
  const v = String(t || "").toLowerCase();
  if (v === "bkash") return "বিকাশ";
  if (v === "nagad") return "নগদ";
  if (v === "bank") return "ব্যাংক";
  return t || "অ্যাকাউন্ট";
};

const Bank = () => {
  const { user } = useContext(AuthContext);

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // modal
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    holderName: "",
    accountNumber: "",
    accountType: "bkash",
  });
  const [isSaving, setIsSaving] = useState(false);

  const phone = useMemo(() => user?.phone, [user?.phone]);

  const fetchAccounts = async () => {
    if (!phone) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/bank-ac/${encodeURIComponent(phone)}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Failed to load");

      // server response: array হলে data, নাহলে data.data ধরে নিলাম
      const list = Array.isArray(data) ? data : data?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setItems([]);
      Swal.fire({
        icon: "error",
        title: "লোড করা যায়নি",
        text: err?.message || "কিছু একটা সমস্যা হয়েছে",
        confirmButtonColor: "#1B2B8F",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const onDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ডিলিট করবেন?",
      text: "এই অ্যাকাউন্টটি ডিলিট হলে আর ফেরত আনা যাবে না।",
      showCancelButton: true,
      confirmButtonText: "ডিলিট",
      cancelButtonText: "ক্যানসেল",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#1B2B8F",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${BASE_URL}/bank-ac/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      Swal.fire({
        icon: "success",
        title: "ডিলিট সফল ✅",
        confirmButtonColor: "#1B2B8F",
      });

      // refresh
      fetchAccounts();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ডিলিট ব্যর্থ",
        text: err?.message || "কিছু একটা সমস্যা হয়েছে",
        confirmButtonColor: "#1B2B8F",
      });
    }
  };

  const openModal = () => {
    if (!phone) {
      Swal.fire({
        icon: "error",
        title: "লগইন দরকার",
        text: "নতুন অ্যাকাউন্ট যোগ করতে আগে লগইন করুন।",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }
    setForm({ holderName: "", accountNumber: "", accountType: "bkash" });
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handleCreate = async (e) => {
    e.preventDefault();

    const holderName = form.holderName.trim();
    const accountNumber = form.accountNumber.trim();
    const accountType = String(form.accountType || "").toLowerCase();

    if (!holderName || !accountNumber) {
      Swal.fire({
        icon: "warning",
        title: "সবগুলো ফিল্ড পূরণ করুন",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    if (!["bank", "nagad", "bkash"].includes(accountType)) {
      Swal.fire({
        icon: "warning",
        title: "অ্যাকাউন্ট টাইপ সঠিক নয়",
        confirmButtonColor: "#1B2B8F",
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        phone: phone, // ✅ required
        holderName,
        accountNumber,
        accountType,
      };

      const res = await fetch(`${BASE_URL}/bank-ac`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Create failed");

      await Swal.fire({
        icon: "success",
        title: "অ্যাকাউন্ট যোগ হয়েছে ✅",
        confirmButtonColor: "#1B2B8F",
      });

      closeModal();
      fetchAccounts();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "অ্যাকাউন্ট যোগ হয়নি",
        text: err?.message || "কিছু একটা সমস্যা হয়েছে",
        confirmButtonColor: "#1B2B8F",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // UI helper: map possible server field names
  const getHolder = (it) => it?.holderName || it?.accountHolderName || it?.name || "";
  const getNumber = (it) => it?.accountNumber || it?.number || it?.acNumber || "";
  const getType = (it) => it?.accountType || it?.type || it?.method || "";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#111827]">ব্যাংক অ্যাকাউন্ট</h1>
        <p className="text-sm text-gray-500 mt-1">আমরা এখানে সাহায্য করতে প্রস্তুত</p>

        {/* List */}
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-xl bg-[#EEF1FA] p-4 text-sm text-gray-600">
              লোড হচ্ছে...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl bg-[#EEF1FA] p-4 text-sm text-gray-600">
              কোনো অ্যাকাউন্ট পাওয়া যায়নি।
            </div>
          ) : (
            items.map((it) => (
              <div key={it?._id} className="rounded-xl bg-[#EEF1FA] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#111827]">
                      {bankLabelBn(getType(it))}
                    </p>

                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>{getHolder(it) || "—"}</p>
                      <p>{getNumber(it) || "—"}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">ব্যবহারকারীর ফোন</p>
                    <p className="mt-1 text-sm font-bold text-[#1B2B8F]">
                      {it?.phone || phone || "—"}
                    </p>

                    <button
                      type="button"
                      onClick={() => onDelete(it?._id)}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/70 hover:bg-white text-red-600 text-xs font-bold transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      ডিলিট
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Button */}
        <button
          type="button"
          className="mt-8 w-full h-12 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition"
          onClick={openModal}
        >
          নতুন অ্যাকাউন্ট
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* overlay */}
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-black/40"
            aria-label="Close modal overlay"
          />

          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5">
            {/* header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#111827]">
                নতুন অ্যাকাউন্ট যোগ করুন
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-xl hover:bg-gray-50 flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              {/* Holder name */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Account Holder Name
                </label>
                <input
                  value={form.holderName}
                  onChange={(e) => setForm((p) => ({ ...p, holderName: e.target.value }))}
                  placeholder="নাম লিখুন"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30"
                />
              </div>

              {/* Account number */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Account number
                </label>
                <input
                  value={form.accountNumber}
                  onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                  placeholder="নম্বর লিখুন"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30"
                />
              </div>

              {/* Account type */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">
                  Account type
                </label>
                <select
                  value={form.accountType}
                  onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#1B2B8F]/30 bg-white"
                >
                  <option value="Bank">Bank</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bkash">Bkash</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full h-12 rounded-xl bg-[#1B2B8F] text-white font-extrabold hover:bg-[#16206B] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? "যোগ হচ্ছে..." : "অ্যাকাউন্ট যোগ করুন"}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bank;
