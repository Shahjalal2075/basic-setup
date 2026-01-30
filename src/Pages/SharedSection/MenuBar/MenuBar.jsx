import React, { useState } from 'react';
import { Home, ShoppingBag, ListFilter, Users, Bell, User, House, ClipboardClock } from 'lucide-react';
import { Link, useLocation } from "react-router-dom";

const menuItems = [
    { name: 'Home', icon: House, index: 0, path: '/dashboard' },
    { name: 'Loan', icon: ClipboardClock, index: 2, path: '/dashboard/loan' },
    { name: 'Users', icon: User, index: 3, path: '/dashboard/profile' },
];

const MenuBar = () => {
    const location = useLocation();

    const currentPath = location.pathname;

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl">
            <nav className="bg-[#f9f9ff] flex flex-row items-center justify-between px-6 h-16 w-full rounded-t-2xl shadow-xl space-x-10 border-t border-gray-300">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = currentPath === item.path;

                    const itemClasses = isActive
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors';

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                        // onClick হ্যান্ডলার আর দরকার নেই, Link নিজেই পাথ চেঞ্জ করবে
                        >
                            <button
                                className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 ease-in-out ${itemClasses}`}
                                aria-label={item.name}
                                title={item.name}
                            >
                                <IconComponent size={20} strokeWidth={2} />
                            </button>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default MenuBar;
