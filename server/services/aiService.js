import axios from "axios";

class aiService {
    constructor() {
        this.baseURL = 'http://localhost:8000'; // Fixed: removed the () and set the URL
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async predictPlayerStats(playerFeatures) {
        try {
            const response = await this.client.post('/predict', playerFeatures);
            return response.data;
        } catch(error) {
            console.error('ML prediction failed', error.response?.data || error.message);
            throw new Error('Prediction Service unavailable');
        }
    }

    async batchPredict(playersData) {
        try {
            const response = await this.client.post('/batch-predict', playersData);
            return response.data;
        } catch(error) {
            console.error('ML batch prediction failed', error.response?.data || error.message);
            throw new Error('Batch prediction service unavailable');
        }
    }

    async getMLServiceHealth() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch(error) {
            console.error('ML Service health check failed:', error.message);
            return { status: 'unhealthy' };
        }
    }
}

export default new aiService();