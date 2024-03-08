// src/hooks/useUserInfo.js
import { useState, useEffect } from 'react';
import { getUserInfo } from '../services/UserService';

export const useUserInfo = (userId) => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const userData = await getUserInfo(userId);
            setUserInfo(userData);
        };

        if (userId) {
            fetchUserInfo();
        }
    }, [userId]);

    return userInfo;
};
