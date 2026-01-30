import React, { useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
    ChevronRight,
    Download,
    User,
    Building2,
    Lock,
    ShieldCheck,
    HelpCircle,
    LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";

const TEMPLATE_SRC = "https://i.ibb.co.com/VWQwqnbf/Frame-158-1.png";

const POS = {
    name: { x: 690, y: 205, size: 40 },
    phone: { x: 690, y: 285, size: 40 },
    nid: { x: 690, y: 360, size: 40 },
    address1: { x: 690, y: 435, size: 40 },
    address2: { x: 690, y: 510, size: 40 },
    verified: { x: 195, y: 525, size: 40 },
    joinDate: { x: 150, y: 705, size: 44 },
    memberId: { x: 1130, y: 705, size: 44, align: "center" },
};

function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

async function renderTemplateCardToPng({ templateSrc, avatarSrc, data }) {
    if (document?.fonts?.ready) {
        try {
            await document.fonts.ready;
        } catch { }
    }

    const template = await loadImage(templateSrc);
    const avatar = avatarSrc ? await loadImage(avatarSrc).catch(() => null) : null;

    const canvas = document.createElement("canvas");
    canvas.width = template.naturalWidth || template.width;
    canvas.height = template.naturalHeight || template.height;
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    // Draw avatar
    if (avatar) {
        const px = 93;
        const py = 158;
        const pw = 300;
        const ph = 300;
        const r = 28;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(px + r, py);
        ctx.arcTo(px + pw, py, px + pw, py + ph, r);
        ctx.arcTo(px + pw, py + ph, px, py + ph, r);
        ctx.arcTo(px, py + ph, px, py, r);
        ctx.arcTo(px, py, px + pw, py, r);
        ctx.closePath();
        ctx.clip();

        const scale = Math.max(pw / avatar.width, ph / avatar.height);
        const dw = avatar.width * scale;
        const dh = avatar.height * scale;
        const dx = px + (pw - dw) / 2;
        const dy = py + (ph - dh) / 2;

        ctx.drawImage(avatar, dx, dy, dw, dh);
        ctx.restore();
    }

    // Text styling
    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    const drawText = (text, { x, y, size, align = "left" }) => {
        ctx.font = `800 ${size}px "Noto Sans Bengali", "Hind Siliguri", Arial`;
        ctx.textAlign = align;
        ctx.fillText(String(text || ""), x, y);
    };

    drawText(data.name, POS.name);
    drawText(data.phone, POS.phone);
    drawText(data.nid, POS.nid);
    drawText(data.addressLine1, POS.address1);
    drawText(data.addressLine2, POS.address2);
    drawText(data.verifiedText, POS.verified);
    drawText(data.joinDate, POS.joinDate);
    drawText(data.memberId, POS.memberId);

    return canvas.toDataURL("image/png");
}

const Profile = () => {
    const { user, logout } = useContext(AuthContext);

    const [downloading, setDownloading] = useState(false);
    const [pngUrl, setPngUrl] = useState("");

    // ✅ card data now comes from user
    const cardData = useMemo(() => {
        // 👉 profile complete না হলে সব ফাঁকা
        if (!user || user?.isProfileComplete === false) {
            return {
                name: "",
                phone: "",
                nid: "",
                addressLine1: "",
                addressLine2: "",
                verifiedText: "",
                joinDate: "",
                memberId: "",
                avatarUrl: "", // avatar ও দেখাবে না
            };
        }

        // 👉 profile complete হলে user থেকে ডাটা নেবে
        return {
            name: user.userInfo.fullName || "",
            phone: user.userInfo.mobile || "",
            nid: user.userInfo.nid || "",
            addressLine1: user.userInfo.presentAddress || "",
            addressLine2: user.userInfo.permanentAddress || "",
            verifiedText: "",
            joinDate: user?.joinDate || "",
            memberId: ("৳" + user.totalBal) || "",
            avatarUrl: user.userInfo.photoUrl || "",
        };
    }, [user]);


    const menu = [
        { id: "personal", label: "ব্যক্তিগত তথ্য সম্পাদন", link: "verify", icon: <User className="w-5 h-5" /> },
        { id: "bank", label: "ব্যাংক অ্যাকাউন্ট", link: "bank", icon: <Building2 className="w-5 h-5" /> },
        { id: "security", label: "সিকিউরিটি ও পাসওয়ার্ড", link: "password", icon: <Lock className="w-5 h-5" /> },
        { id: "policy", label: "নিয়ম ও নীতিমালা", link: "policy", icon: <ShieldCheck className="w-5 h-5" /> },
        { id: "support", label: "হেল্প ও সাপোর্ট", link: "help", icon: <HelpCircle className="w-5 h-5" /> },
    ];

    const generate = async () => {
        try {
            const png = await renderTemplateCardToPng({
                templateSrc: TEMPLATE_SRC,
                avatarSrc: cardData.avatarUrl,
                data: cardData,
            });
            setPngUrl(png);
        } catch (e) {
            console.error(e);
            alert("Template load/render ব্যর্থ। Template image টা public/local কিনা চেক করো (CORS issue হতে পারে)।");
        }
    };

    // ✅ user/cardData change হলে regenerate হবে
    useEffect(() => {
        if (!user) return;
        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, cardData?.name, cardData?.phone, cardData?.avatarUrl]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const png = await renderTemplateCardToPng({
                templateSrc: TEMPLATE_SRC,
                avatarSrc: cardData.avatarUrl,
                data: cardData,
            });
            const fileId = cardData.memberId || cardData.phone || "user";
            downloadDataUrl(png, `member-card-${fileId}.png`);
        } catch (e) {
            console.error(e);
            alert("ডাউনলোড হচ্ছে না—Template/Avatar public ফোল্ডারে আছে কিনা চেক করো।");
        } finally {
            setDownloading(false);
        }
    };



    const handleLogout = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "লগ আউট করবেন?",
            text: "আপনি কি নিশ্চিতভাবে লগ আউট করতে চান?",
            showCancelButton: true,
            confirmButtonText: "হ্যাঁ",
            cancelButtonText: "না",
            confirmButtonColor: "#DC2626",
            cancelButtonColor: "#1B2B8F",
        });

        if (result.isConfirmed) {
            logout();
        }
    };


    return (
        <div className="min-h-screen bg-white">
            <main className="mx-auto max-w-3xl py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <div className="rounded-2xl overflow-hidden">
                            <img
                                src={pngUrl ? pngUrl : TEMPLATE_SRC}
                                alt="card"
                                className="w-full h-auto block rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center w-full h-full">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="w-full h-16 rounded-xl border-2 border-[#8AA2FF] text-[#1B2B8F] font-extrabold flex items-center justify-center gap-3 hover:bg-[#F5F7FF] transition disabled:opacity-60"
                        >
                            <Download className="w-6 h-6" />
                            সদস্য পরিচয় কার্ড
                        </button>
                    </div>
                </div>

                <h2 className="mt-10 text-[18px] font-extrabold text-[#111827]">
                    অ্যাকাউন্ট সেটিংস
                </h2>

                <div className="mt-3 rounded-2xl border border-gray-200 overflow-hidden bg-white">
                    {menu.map((item) => (
                        <Link
                            key={item.id}
                            className="w-full flex items-center justify-between px-4 py-4 bg-white hover:bg-gray-50 transition border-b last:border-b-0"
                            to={item.link}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#1B2B8F] flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <div className="text-[14px] font-semibold text-[#111827]">
                                    {item.label}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#1B2B8F]" />
                        </Link>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        type="button"
                        className="w-full max-w-sm h-12 rounded-xl bg-[#EEF1FA] text-[#1B2B8F] font-bold hover:bg-[#E7ECFF] transition flex items-center justify-center gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        লগ আউট
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Profile;
