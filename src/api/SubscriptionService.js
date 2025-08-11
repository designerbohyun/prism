// src/api/SubscriptionService.js
import axios from 'axios';

// devServer 프록시로 /api를 8080으로 넘길 거라 baseURL은 상대경로만 사용
const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
});

const Service = {
    async listSubscriptions() {
        const { data } = await api.get('/subscriptions');
        return data;
    },
    async createSubscription(body) {
        const { data } = await api.post('/subscriptions', body);
        return data;
    },
    async updateSubscription(id, body) {
        const { data } = await api.put(`/subscriptions/${id}`, body);
        return data;
    },
    async deleteSubscription(id) {
        const { data } = await api.delete(`/subscriptions/${id}`);
        return data;
    },
    async toggleActive(item) {
        const payload = { ...item, active: !item.active };
        const { data } = await api.put(`/subscriptions/${item.id}`, payload);
        return data;
    },
};

export default Service;
