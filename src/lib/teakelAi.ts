import { useAppStore } from '../store/useAppStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

export const TeakelAIService = {
    async yukiSearch(query: string) {
        try {
            const token = process.env.VITE_SUPABASE_ANON_KEY || 'dummy'; // Can be improved with actual auth

            const response = await fetch(`${API_BASE_URL}/api/teakel-search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to execute YukiSearch');
            }

            const data = await response.json();
            return data.leads || [];
        } catch (error: any) {
            console.error('YukiSearch Error:', error);
            throw error;
        }
    },

    async yukiVision(base64Data: string, mimeType: string) {
        try {
            const token = process.env.VITE_SUPABASE_ANON_KEY || 'dummy';

            const response = await fetch(`${API_BASE_URL}/api/teakel-vision`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    imageBase64: base64Data,
                    mimeType: mimeType
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to process image in YukiVision');
            }

            const data = await response.json();
            return data.lead;
        } catch (error: any) {
            console.error('YukiVision Error:', error);
            throw error;
        }
    }
};
