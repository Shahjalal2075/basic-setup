import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [resetTime, setResetTime] = useState("09:33:16");
    const userEmail = localStorage.getItem('userStatus');

    useEffect(() => {
        fetch(`https://task-server-ten-nu.vercel.app/user-list/${userEmail}`)
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user, userEmail]);

    useEffect(() => {
        fetch(`https://task-server-ten-nu.vercel.app/office-time/officetimealien`)
            .then((res) => res.json())
            .then((data) => {
                setResetTime(data.end);
            })
            .catch();
    }, [user, userEmail]);

    const signOutUser = () => {
        setLoading(true);
        localStorage.removeItem('userStatus');
        setUser(null);
        setLoading(false);
        window.location.reload();
    }

    /*const [loading, setLoading] = useState(true);
    const [isChecked, setIsChecked] = useState(false);

    const provider = new GoogleAuthProvider();

     const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const resetPassword = (email) => {

        return sendPasswordResetEmail(auth, email);
    }

    const googleUser = () => {
        return signInWithPopup(auth, provider);
    }

    const signOutUser = () => {
        setLoading(true);
        return signOut(auth);
    } */

    /* useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            console.log('Current User: ', currentUser)
            setLoading(false);
        });
        return () => {
            unSubscribe();
        }
    }, []) */

    //const authInfo = { user, isChecked, setIsChecked, loading, createUser, signInUser, resetPassword, googleUser, signOutUser }
    const authInfo = { user, resetTime, loading, userEmail, signOutUser }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;