import React from 'react';
import { Outlet } from 'react-router-dom';

const DashboardRoot = () => {
    return (
        <div className="bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF] min-h-[100vh]">
            <div className="">
                <Outlet></Outlet>
            </div>
        </div>
    );
};

export default DashboardRoot;