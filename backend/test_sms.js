const axios = require('axios');

async function test() {
  const apiKey = "6JalOgMETR1hy5YC0BSH79jZc8quKxwLi3W2meoUdGXsI4rDFppF38eLjGUNX7DVASkcsWxBtb41noKy";
  try {
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: apiKey,
        message: "Test message",
        language: 'english',
        route: 'q', // Quick SMS route (transactional)
        numbers: "9926930707",
      },
      headers: {
        'cache-control': 'no-cache',
      },
    });
    console.log("Success:", response.data);
  } catch (error) {
    console.log("Error:", error.response ? error.response.data : error.message);
  }
}
test();
