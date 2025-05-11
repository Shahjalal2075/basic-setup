import { useContext, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider';

const Home = () => {

    const { user} = useContext(AuthContext);
    const [loading,setLoading]=useState(false);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
            </div>
        );
    }

    return (
        <div className="">
            <h2 className=' text-center'>Home</h2>
        </div>
    );
};

export default Home;