import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'CLIENT';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await api.post('/auth/register', { name, email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
