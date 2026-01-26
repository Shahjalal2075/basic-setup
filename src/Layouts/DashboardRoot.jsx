import React from 'react';
import { Outlet } from 'react-router-dom';
import MenuBar from '../Pages/SharedSection/MenuBar/MenuBar';

const DashboardRoot = () => {
    return (
        <div className="bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF] min-h-[100vh]">
            <div className="">
                <Outlet></Outlet>
                <MenuBar></MenuBar>
            </div>
        </div>
    );
};

export default DashboardRoot;