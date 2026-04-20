/**
 * Test script to verify ntfy notifications are working
 * Run with: npx ts-node src/scripts/test-notification.ts
 */

import dotenv from 'dotenv';
import { sendNotification, notifyNewOrder, notifyNewCustomOrder, notifyNewContactMessage } from '../services/notificationService';

// Load environment variables
dotenv.config();

async function testNotifications() {
  console.log('🧪 Testing Ntfy Notifications...\n');
  console.log(`Topic: ${process.env.NTFY_TOPIC}`);
  console.log(`Server: ${process.env.NTFY_SERVER || 'https://ntfy.sh'}\n`);

  if (!process.env.NTFY_TOPIC) {
    console.error('❌ NTFY_TOPIC not configured in .env file');
    process.exit(1);
  }

  try {
    // Test 1: Basic notification
    console.log('1️⃣ Sending basic test notification...');
    await sendNotification({
      title: '🧪 Test Notification',
      message: 'If you see this, ntfy is working correctly!',
      priority: 'high',
      tags: ['white_check_mark', 'tada'],
    });
    console.log('✅ Basic notification sent\n');

    // Wait 2 seconds between notifications
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: New order notification
    console.log('2️⃣ Sending test order notification...');
    await notifyNewOrder({
      orderId: 'TEST-12345',
      customerName: 'John Doe',
      customerPhone: '+212600000000',
      totalPrice: 450,
      itemCount: 3,
    });
    console.log('✅ Order notification sent\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Custom order notification
    console.log('3️⃣ Sending test custom order notification...');
    await notifyNewCustomOrder({
      customerName: 'Jane Smith',
      carName: 'BMW M3',
      model: 'Competition',
      year: '2023',
    });
    console.log('✅ Custom order notification sent\n');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Contact message notification
    console.log('4️⃣ Sending test contact message notification...');
    await notifyNewContactMessage({
      customerName: 'Alice Johnson',
      email: 'alice@example.com',
      messagePreview: 'I have a question about shipping to Casablanca...',
    });
    console.log('✅ Contact message notification sent\n');

    console.log('🎉 All notifications sent successfully!');
    console.log('\n📱 Check your ntfy app - you should have received 4 notifications');
    console.log('💡 If you didn\'t receive them, check:');
    console.log('   - Topic name matches exactly: carsma2026');
    console.log('   - You\'re subscribed to the topic in the app');
    console.log('   - App has notification permissions enabled');

  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    process.exit(1);
  }
}

// Run the test
testNotifications();
