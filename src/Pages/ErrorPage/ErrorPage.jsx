import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Providers/AuthProvider";

const ErrorPage = () => {
    const { signOutUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleSignoutUser = () => {
        signOutUser();
        navigate('/login');
    }
    return (
        <div>
            <div className=' flex flex-col justify-center items-center mt-20'>
                <h2 className='text-4xl text-center mt-20 font-bold'>Error 404!!!!</h2>
                <Link className='text-center bg-[#111] text-[#fff] font-bold text-xl p-4 rounded-lg mt-10' to={"/"}>Go Back home</Link>
                <button onClick={handleSignoutUser} className='text-center cursor-pointer bg-[#f71313] text-[#fff] font-bold text-xl py-3 px-12 rounded-lg mt-6' to={"/"}>LogOut</button>
            </div>
        </div>
    );
};

export default ErrorPage;