import webpush from 'web-push'

let vapidConfigured = false

function ensureVapid() {
  if (vapidConfigured) return
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) throw new Error('VAPID keys not configured')
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:owner@example.com', pub, priv)
  vapidConfigured = true
}

interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  tag?: string
  notificationId?: string  // For click tracking (TRACK step)
  customerId?: string      // For click tracking (TRACK step)
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    ensureVapid()
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true }
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string }
    // 410 Gone = subscription expired, should be removed
    if (error.statusCode === 410) {
      return { success: false, error: 'subscription_expired' }
    }
    return { success: false, error: error.message || 'unknown' }
  }
}

export { webpush }
