// src/api/SubscriptionService.js

import axios from 'axios';

export const createSubscription = async (subscriptionData) => {
    try {
        const response = await axios.post('http://localhost:8080/api/subscriptions', subscriptionData, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true // 필요 없으면 생략 가능
        });
        return response.data;
    } catch (error) {
        console.error('❌ Subscription 등록 실패:', error.response?.data || error.message);
        throw error;
    }
};
