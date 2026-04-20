/**
 * Test script to create a new order and verify notification system
 * This will test the complete flow: order creation -> notification trigger
 */

const API_BASE = 'http://localhost:5000';

async function testOrderCreation() {
  console.log('🧪 Testing complete order creation flow...');
  
  const orderData = {
    customer: {
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+212600123456',
      address: '123 Test Street, Casablanca, Morocco'
    },
    products: [
      {
        productId: '507f1f77bcf86cd799439011',
        name: 'Test Wall Art',
        price: 150,
        quantity: 2
      }
    ],
    totalPrice: 300,
    paymentMethod: 'Cash on Delivery'
  };

  try {
    console.log('📦 Creating new order...');
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log('📋 Order ID:', result.orderId);
      console.log('💬 Message:', result.message);
      console.log('🔔 Check your ntfy app for the notification!');
      console.log('📱 Topic: l7itart');
    } else {
      console.error('❌ Order creation failed:');
      console.error('Status:', response.status);
      console.error('Error:', result);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run the test
testOrderCreation();