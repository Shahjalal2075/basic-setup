import { Outlet } from "react-router-dom";
import Header from "../Pages/SharedSection/Header/Header";

const Root = () => {

    return (
        <div className="bg-gradient-to-r from-[#d0d1e7] to-[#c9cbf0] min-h-[100vh]">
            <div className="container mx-auto">
                <Header></Header>
                <Outlet></Outlet>
            </div>
        </div>
    );
};

export default Root;