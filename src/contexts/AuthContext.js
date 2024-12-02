import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, fullName) {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, {
                displayName: fullName
            });
            return result;
        } catch (error) {
            throw new Error(getErrorMessage(error.code));
        }
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
            .catch(error => {
                throw new Error(getErrorMessage(error.code));
            });
    }

    function logout() {
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email)
            .catch(error => {
                throw new Error(getErrorMessage(error.code));
            });
    }

    async function signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            return result;
        } catch (error) {
            throw new Error(getErrorMessage(error.code));
        }
    }

    function getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'Cette adresse email est déjà utilisée.';
            case 'auth/invalid-email':
                return 'L\'adresse email est invalide.';
            case 'auth/operation-not-allowed':
                return 'Opération non autorisée.';
            case 'auth/weak-password':
                return 'Le mot de passe est trop faible.';
            case 'auth/user-disabled':
                return 'Ce compte a été désactivé.';
            case 'auth/user-not-found':
                return 'Aucun compte ne correspond à cette adresse email.';
            case 'auth/wrong-password':
                return 'Mot de passe incorrect.';
            case 'auth/too-many-requests':
                return 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
            case 'auth/network-request-failed':
                return 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
            default:
                return 'Une erreur est survenue. Veuillez réessayer.';
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        resetPassword,
        signInWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
