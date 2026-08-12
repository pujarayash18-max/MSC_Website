/**
 * Azure Function Timer Trigger execution script (Standalone deployment artifact).
 */
module.exports = async function (context: any, myTimer: any) {
  const timeStamp = new Date().toISOString();
  if (myTimer.isPastDue) {
    context.log('Azure Timer function is running late!');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : 'http://localhost:3000');
  const cronSecret = process.env.CRON_SECRET || 'mcc_azure_timer_cron_secret_key_2026';

  try {
    context.log(`[Azure Timer Trigger] Invoking auto-complete endpoint at ${timeStamp}...`);
    const res = await fetch(`${appUrl}/api/events/auto-complete`, {
      method: 'POST',
      headers: {
        'x-cron-secret': cronSecret,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    context.log('[Azure Timer Trigger] Execution success:', data);
  } catch (error: any) {
    context.log.error('[Azure Timer Trigger] Failed to trigger event completion:', error?.message || error);
  }
};
