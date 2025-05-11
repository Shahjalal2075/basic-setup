import { useState, useEffect } from "react";

function CountdownModal({ showModal, setShowModal, endTime }) {
    const calculateTimeLeft = () => {
        const difference = new Date(endTime) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    const formatTime = (unit) => (unit < 10 ? `0${unit}` : unit);

    if (!showModal) return null;

    return (
        <div className="px-3 fixed inset-0 bg-[#11111180] flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center relative">
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Complete Your Pending Task Within
                </h2>
                <div className="text-3xl font-bold text-blue-600">
                    {timeLeft.hours !== undefined ? (
                        <>
                            {formatTime(timeLeft.hours)}:
                            {formatTime(timeLeft.minutes)}:
                            {formatTime(timeLeft.seconds)}
                        </>
                    ) : (
                        "Time Expired"
                    )}
                </div>
            </div>
        </div>
    );
}

export default CountdownModal;
