import { prisma } from '../lib/prisma';
import { createAndSendNotification } from '../lib/notifications';

async function testNotifications() {
  console.log('--- Testing Notification Engine ---');

  const testUser = await prisma.user.findFirst({ where: { isDeleted: false } });
  if (!testUser) {
    console.error('No test user found in DB.');
    return;
  }

  console.log(`Testing notifications for user: ${testUser.fullName} (${testUser.id})`);

  // 1. Test Resource Notification
  const resSuccess = await createAndSendNotification({
    userId: testUser.id,
    userEmail: testUser.email,
    title: 'Test: Live Resource Shared',
    message: 'A new Azure architecture diagram PDF has been uploaded.',
    type: 'LIVE_RESOURCE_AVAILABLE',
    link: '/resources',
  });
  console.log('1. LIVE_RESOURCE_AVAILABLE dispatch result:', resSuccess);

  // 2. Test Blog Notification (Published/Accepted/Rejected)
  const blogSuccess = await createAndSendNotification({
    userId: testUser.id,
    userEmail: testUser.email,
    title: 'Test: Blog Post Approved 🎉',
    message: 'Your blog post "Getting Started with Azure Functions" was published!',
    type: 'NEW_BLOG',
    link: '/blog/getting-started-azure-functions',
  });
  console.log('2. NEW_BLOG dispatch result:', blogSuccess);

  // 3. Test Certificate Notification
  const certSuccess = await createAndSendNotification({
    userId: testUser.id,
    userEmail: testUser.email,
    title: 'Test: Certificate Issued',
    message: 'Your official certificate of participation for "Azure Bootcamp" is ready.',
    type: 'CERTIFICATE_READY',
    link: '/dashboard/certificates',
  });
  console.log('3. CERTIFICATE_READY dispatch result:', certSuccess);

  // 4. Test Notice Notification
  const noticeSuccess = await createAndSendNotification({
    userId: testUser.id,
    userEmail: testUser.email,
    title: 'Test: Official Notice Published',
    message: 'Urgent: Registration for National Hackathon closes tomorrow!',
    type: 'NEW_NOTICE',
    link: '/notices',
  });
  console.log('4. NEW_NOTICE dispatch result:', noticeSuccess);

  // Verify count in database
  const count = await prisma.notification.count({ where: { userId: testUser.id } });
  console.log(`Verified total notifications for ${testUser.fullName} in DB:`, count);
}

testNotifications().catch(console.error);
