import React, { useEffect, useState } from "react";
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

/** ✅ Only card data JSON */
const cardData = {
    name: "ব্যবহারকারীর নাম",
    phone: "০১০০২১১২২২২২১৩",
    nid: "০১০০২১১২২২২২১৩",
    addressLine1: "গ্রামঃ চাঁদপুর, ইউনিয়নঃ শ্রীনগর,",
    addressLine2: "উপজেলাঃ দোহার, জেলাঃ ঢাকা",
    verifiedText: "",
    joinDate: "১৬/০১/২০২৬",
    memberId: "১৫৫৫১২৫৪০৩",

    // ✅ local image path
    avatarUrl: "https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=314,height=314,fit=cover,f=auto/40eaf292ef29f592a4fd5a30d46218f9/blocks-8.png",
};

/** ✅ Template image path (Frame158) */
const TEMPLATE_SRC = "https://i.ibb.co.com/VWQwqnbf/Frame-158-1.png";

/**
 * ✅ Positions tuned for Frame158 template (you can fine-tune x/y if needed)
 * This is based on the template you shared.
 */
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

/** ✅ Build PNG exactly like template + text overlay */
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

    // Draw avatar on top of template photo area (match your template photo placement)
    // Photo box coords for Frame158 (tuned)
    if (avatar) {
        const px = 93; // adjust if needed
        const py = 158;
        const pw = 300;
        const ph = 300;
        const r = 28;

        // rounded clip
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(px + r, py);
        ctx.arcTo(px + pw, py, px + pw, py + ph, r);
        ctx.arcTo(px + pw, py + ph, px, py + ph, r);
        ctx.arcTo(px, py + ph, px, py, r);
        ctx.arcTo(px, py, px + pw, py, r);
        ctx.closePath();
        ctx.clip();

        // cover crop
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
    const [downloading, setDownloading] = useState(false);
    const [pngUrl, setPngUrl] = useState("");

    const menu = [
        { id: "personal", label: "ব্যক্তিগত তথ্য সম্পাদন", icon: <User className="w-5 h-5" /> },
        { id: "bank", label: "ব্যাংক অ্যাকাউন্ট", icon: <Building2 className="w-5 h-5" /> },
        { id: "security", label: "সিকিউরিটি ও পাসওয়ার্ড", icon: <Lock className="w-5 h-5" /> },
        { id: "policy", label: "নিয়ম ও নীতিমালা", icon: <ShieldCheck className="w-5 h-5" /> },
        { id: "support", label: "হেল্প ও সাপোর্ট", icon: <HelpCircle className="w-5 h-5" /> },
    ];

    const generate = async () => {
        //setLoading(true);
        try {
            const png = await renderTemplateCardToPng({
                templateSrc: TEMPLATE_SRC,
                avatarSrc: cardData.avatarUrl,
                data: cardData,
            });
            setPngUrl(png);
        } catch (e) {
            console.error(e);
            alert(
                "Template load/render ব্যর্থ। Template image টা public/local কিনা চেক করো (CORS issue হতে পারে)।"
            );
        } finally {
            //setLoading(false);
        }
    };

    useEffect(() => {
        generate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const png = await renderTemplateCardToPng({
                templateSrc: TEMPLATE_SRC,
                avatarSrc: cardData.avatarUrl,
                data: cardData,
            });
            downloadDataUrl(png, `member-card-${cardData.memberId}.png`);
        } catch (e) {
            console.error(e);
            alert("ডাউনলোড হচ্ছে না—Template/Avatar public ফোল্ডারে আছে কিনা চেক করো।");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">


            {/* Body */}
            <main className="mx-auto max-w-3xl py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Left: card preview block (like screenshot) */}
                    <div>
                        <div className="rounded-2xl overflow-hidden">
                            {/* Use template image as preview */}
                            <div className="">
                                <img
                                    src={pngUrl ? pngUrl : TEMPLATE_SRC}
                                    alt="card"
                                    className="w-full h-auto block rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: big download button */}
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

                {/* Settings title */}
                <h2 className="mt-10 text-[18px] font-extrabold text-[#111827]">
                    অ্যাকাউন্ট সেটিংস
                </h2>

                {/* Settings box */}
                <div className="mt-3 rounded-2xl border border-gray-200 overflow-hidden bg-white">
                    {menu.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-4 bg-white hover:bg-gray-50 transition border-b last:border-b-0"
                            onClick={() => console.log("Clicked:", item.id)}
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
                        </button>
                    ))}
                </div>

                {/* Logout button */}
                <div className="mt-10 flex justify-center">
                    <button
                        type="button"
                        className="w-full max-w-sm h-12 rounded-xl bg-[#EEF1FA] text-[#1B2B8F] font-bold hover:bg-[#E7ECFF] transition flex items-center justify-center gap-2"
                        onClick={() => console.log("logout")}
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
