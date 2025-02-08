const axios = require('axios');

async function testProxyServer() {
    try {
        // Tes endpoint status
        const statusResponse = await axios.get('http://localhost:5000/status');
        console.log('Status Server:', statusResponse.data);

        // Tes endpoint query
        const queryResponse = await axios.post('http://localhost:5000/query', {
            query: 'SELECT NOW()',
            params: []
        });
        console.log('Query Hasil:', queryResponse.data);
    } catch (error) {
        console.error('Kesalahan Proxy Server:', error.message);
    }
}

testProxyServer();
