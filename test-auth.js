// Test script pentru verificarea autentificării Cognito
// Rulare: node test-auth.js

import https from 'https';

// Configurare pentru test
const config = {
  apiUrl: 'https://api-management.simplu.io',
  cognitoDomain: 'https://auth.simplu.io',
  cognitoAuthority: 'https://auth.simplu.io/eu-central-1_KUaE0MTcQ',
  clientId: 'ar2m2qg3gp4a0b4cld09aegdb',
  appUrl: 'https://app.simplu.io'
};

console.log('🔍 Test configurare Cognito:');
console.log('API URL:', config.apiUrl);
console.log('Cognito Domain:', config.cognitoDomain);
console.log('Cognito Authority:', config.cognitoAuthority);
console.log('Client ID:', config.clientId);
console.log('App URL:', config.appUrl);

// Funcție pentru testarea endpoint-ului API
function testApiEndpoint(endpoint, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-management.simplu.io',
      port: 443,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Simplu-Admin-Test/1.0'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Testează endpoint-ul fără token
async function testWithoutToken() {
  console.log('\n🧪 Testare fără token:');
  try {
    const result = await testApiEndpoint('/users/me');
    console.log('Status:', result.status);
    console.log('Response:', result.data);
    
    if (result.status === 401) {
      console.log('✅ Așteptat: 401 Unauthorized fără token');
    } else {
      console.log('⚠️ Neașteptat: Endpoint-ul nu necesită autentificare');
    }
  } catch (error) {
    console.error('❌ Eroare:', error.message);
  }
}

// Testează endpoint-ul cu token invalid
async function testWithInvalidToken() {
  console.log('\n🧪 Testare cu token invalid:');
  try {
    const result = await testApiEndpoint('/users/me', 'invalid-token');
    console.log('Status:', result.status);
    console.log('Response:', result.data);
    
    if (result.status === 401) {
      console.log('✅ Așteptat: 401 Unauthorized cu token invalid');
    } else {
      console.log('⚠️ Neașteptat: Token invalid acceptat');
    }
  } catch (error) {
    console.error('❌ Eroare:', error.message);
  }
}

// Testează configurarea Cognito
async function testCognitoConfig() {
  console.log('\n🧪 Testare configurare Cognito:');
  
  try {
    // Testează endpoint-ul de configurare OIDC
    const result = await testApiEndpoint('/.well-known/openid_configuration');
    console.log('Status:', result.status);
    
    if (result.status === 404) {
      console.log('ℹ️ Endpoint OIDC nu este disponibil pe API Gateway');
    } else {
      console.log('Response:', result.data);
    }
  } catch (error) {
    console.error('❌ Eroare:', error.message);
  }
}

// Funcție principală
async function runTests() {
  console.log('🚀 Începere teste autentificare...\n');
  
  await testWithoutToken();
  await testWithInvalidToken();
  await testCognitoConfig();
  
  console.log('\n📋 Rezumat teste:');
  console.log('1. ✅ Testare fără token - verifică că API-ul necesită autentificare');
  console.log('2. ✅ Testare cu token invalid - verifică validarea token-ului');
  console.log('3. ℹ️ Testare configurare Cognito - verifică endpoint-urile OIDC');
  
  console.log('\n🔧 Următorii pași:');
  console.log('1. Verifică în browser dacă token-ul Cognito este obținut corect');
  console.log('2. Verifică în Network tab dacă header-ul Authorization este trimis');
  console.log('3. Verifică în Console log-urile de debugging cu emoji-uri');
  console.log('4. Testează manual cu un token valid din browser');
}

// Rulare teste
runTests().catch(console.error); 