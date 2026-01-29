import { apiRequest } from '@/lib/api';

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const authService = {
    async login(credentials: { email: string; password?: string }): Promise<AuthResponse> {
        return apiRequest<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    async register(data: { email: string; password?: string; full_name: string }): Promise<AuthResponse> {
        return apiRequest<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async googleLogin(idToken: string): Promise<AuthResponse> {
        return apiRequest<AuthResponse>('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        });
    },

    async updateProfile(data: { email: string; full_name: string }): Promise<{ user: User }> {
        const token = localStorage.getItem('token');
        return apiRequest<{ user: User }>('/auth/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
    },

    async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
        const token = localStorage.getItem('token');
        return apiRequest<{ success: boolean; message: string }>('/auth/change-password', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
    },

    async getOrderHistory(): Promise<any[]> {
        const token = localStorage.getItem('token');
        return apiRequest<any[]>('/orders/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async getNotifications(): Promise<any[]> {
        const token = localStorage.getItem('token');
        return apiRequest<any[]>('/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async markNotificationRead(id: number): Promise<{ success: boolean }> {
        const token = localStorage.getItem('token');
        return apiRequest<{ success: boolean }>(`/notifications/${id}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async markAllNotificationsRead(): Promise<{ success: boolean }> {
        const token = localStorage.getItem('token');
        return apiRequest<{ success: boolean }>('/notifications/read-all', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async logout(): Promise<{ success: boolean }> {
        const token = localStorage.getItem('token');
        try {
            await apiRequest('/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (e) {
            console.error('Logout error:', e);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: true };
    }
};

export const cartApiService = {
    async getCart(): Promise<any> {
        const token = localStorage.getItem('token');
        return apiRequest('/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    async syncCart(items: { product_id: number; quantity: number }[]): Promise<void> {
        const token = localStorage.getItem('token');
        return apiRequest('/cart/sync', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items }),
        });
    },

    async addItemToCart(product_id: number, quantity: number): Promise<void> {
        const token = localStorage.getItem('token');
        return apiRequest('/cart/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id, quantity }),
        });
    },
};
