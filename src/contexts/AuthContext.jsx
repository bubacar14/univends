import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    getAuth
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize auth state listener
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
                setCurrentUser(user);
                setLoading(false);
            },
            (error) => {
                console.error('Auth state change error:', error);
                setError(error);
                setLoading(false);
            }
        );

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const value = {
        currentUser,
        loading,
        error,
        signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
        login: (email, password) => signInWithEmailAndPassword(auth, email, password),
        logout: () => signOut(auth),
        resetPassword: (email) => sendPasswordResetEmail(auth, email),
        updateUserProfile: (profile) => updateProfile(auth.currentUser, profile),
        signInWithGoogle: () => {
            const provider = new GoogleAuthProvider();
            return signInWithPopup(auth, provider);
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
}
