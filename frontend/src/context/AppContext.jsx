import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    
    const navigate = useNavigate();

    const fetchDoctors = async () => {
        try {
            const res = await fetch('/api/doctors/all');
            const data = await res.json();
            if (data.success) {
                setDoctors(data.data);
            }
        } catch (error) {
            console.error("Error fetching doctors", error);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            fetchUserProfile();
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setIsLoaded(true);
        }
    }, [token]);

    const fetchUserProfile = async () => {
        try {
            const res = await fetch('/api/patients/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
            } else {
                setToken(''); // Invalid token
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoaded(true);
        }
    };

    const fetchAppointments = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/appointment/my-appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        // Redirect back to the page the user was on before login (e.g. doctor profile)
        const redirectTo = localStorage.getItem('redirectAfterLogin');
        if (redirectTo) {
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectTo);
        } else {
            navigate('/');
        }
    };

    const logout = () => {
        setToken('');
        setUser(null);
        setAppointments([]);
        navigate('/');
    };

    const value = {
        token,
        setToken,
        user,
        setUser,
        isLoaded,
        userId: user ? user._id : null,
        login,
        logout,
        appointments,
        fetchAppointments,
        doctors,
        fetchDoctors,
        fetchUserProfile
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    return useContext(AppContext);
};
