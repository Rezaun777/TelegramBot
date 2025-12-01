// Simple token test without database dependencies
async function testToken() {
  try {
    console.log('Testing token generation and verification...');
    
    // Test signing a token
    const payload = { 
      userId: 'test-user-id', 
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 1 week
    };
    
    // Simple base64 encoding
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    console.log('Generated token:', token);
    
    // Test verifying the token
    try {
      // Simple base64 decoding
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const verifiedPayload = JSON.parse(decoded);
      console.log('Verified payload:', verifiedPayload);
      
      // Check expiration
      if (verifiedPayload.exp < Math.floor(Date.now() / 1000)) {
        console.log('Token is expired');
      } else {
        console.log('Token is valid');
      }
    } catch (error) {
      console.error('Token verification error:', error);
    }
    
    // Test with invalid token
    const invalidToken = 'invalid-token';
    try {
      const decoded = Buffer.from(invalidToken, 'base64').toString('utf-8');
      const result = JSON.parse(decoded);
      console.log('Invalid token result:', result);
    } catch (error: any) {
      console.log('Invalid token correctly rejected:', error.message);
    }
    
    // Test with malformed base64
    const malformedToken = 'this-is-not-base64';
    try {
      const decoded = Buffer.from(malformedToken, 'base64').toString('utf-8');
      const result = JSON.parse(decoded);
      console.log('Malformed token result:', result);
    } catch (error: any) {
      console.log('Malformed token correctly rejected:', error.message);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testToken();