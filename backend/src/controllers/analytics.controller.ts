import type { Request, Response } from 'express'
import { db } from '../config/firebaseAdmin'

function deviceFromUserAgent(value: string): string {
  const ua = value.toLowerCase()
  if (/tablet|ipad/.test(ua)) return 'Tablet'
  if (/mobile|android|iphone/.test(ua)) return 'Mobile'
  if (ua === 'unknown') return 'Unknown'
  return 'Desktop'
}

export async function getQrAnalytics(req: Request, res: Response): Promise<void> {
  const uid = req.user?.uid
  const rawId = req.params.qrId
  const qrId = Array.isArray(rawId) ? rawId[0] : rawId

  if (!uid) {
    res.status(401).json({ error: 'Authentication required.' })
    return
  }
  if (!qrId) {
    res.status(400).json({ error: 'Invalid QR code ID.' })
    return
  }

  try {
    const qrDoc = await db.collection('qr_codes').doc(qrId).get()

    if (!qrDoc.exists || qrDoc.data()?.ownerUid !== uid) {
      res.status(404).json({ error: 'QR code not found.' })
      return
    }

    const qr = qrDoc.data()!
    const snapshot = await db.collection('scan_events')
      .where('qrId', '==', qrId)
      .where('ownerUid', '==', uid)
      .get()

    const events = snapshot.docs.map(doc => {
      const data = doc.data()
      const timestamp = data.scannedAt?.toDate?.()
      const userAgent = typeof data.userAgent === 'string' ? data.userAgent : 'unknown'

      return {
        id: doc.id,
        visitorId: typeof data.visitorId === 'string' ? data.visitorId : null,
        scannedAt: timestamp ? timestamp.toISOString() : null,
        device: deviceFromUserAgent(userAgent),
        browser: /edg\//i.test(userAgent) ? 'Edge'
          : /chrome\//i.test(userAgent) ? 'Chrome'
          : /firefox\//i.test(userAgent) ? 'Firefox'
          : /safari\//i.test(userAgent) && !/chrome\//i.test(userAgent) ? 'Safari'
          : 'Unknown',
        referrer: typeof data.referrer === 'string' ? data.referrer : 'Direct',
      }
    }).sort((a, b) =>
      (b.scannedAt ? Date.parse(b.scannedAt) : 0) -
      (a.scannedAt ? Date.parse(a.scannedAt) : 0)
    )

    const groupedMap = new Map<string, (typeof events)[number] & { scanCount: number }>()

    for (const event of events) {
      const key = event.visitorId
        ? `visitor:${event.visitorId}`
        : `legacy:${event.id}`

      const existing = groupedMap.get(key)

      if (existing) {
        existing.scanCount += 1
      } else {
        groupedMap.set(key, { ...event, scanCount: 1 })
      }
    }

    const groupedRecentScans = Array.from(groupedMap.values()).slice(0, 50)

    const deviceCounts: Record<string, number> = {
      Mobile: 0, Desktop: 0, Tablet: 0, Unknown: 0,
    }
    const browserCounts: Record<string, number> = {}

    for (const event of events) {
      deviceCounts[event.device] = (deviceCounts[event.device] || 0) + 1
      browserCounts[event.browser] = (browserCounts[event.browser] || 0) + 1
    }

    const today = new Date()
    const dailyScans: { date: string; scans: number }[] = []
    const dailyDeviceScans: {
      date: string; Mobile: number; Desktop: number; Tablet: number; Unknown: number
    }[] = []

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today)
      day.setHours(0, 0, 0, 0)
      day.setDate(day.getDate() - i)
      const key = day.toISOString().slice(0, 10)
      const dayEvents = events.filter(event => event.scannedAt?.slice(0, 10) === key)

      dailyScans.push({ date: key, scans: dayEvents.length })
      dailyDeviceScans.push({
        date: key,
        Mobile: dayEvents.filter(e => e.device === 'Mobile').length,
        Desktop: dayEvents.filter(e => e.device === 'Desktop').length,
        Tablet: dayEvents.filter(e => e.device === 'Tablet').length,
        Unknown: dayEvents.filter(e => e.device === 'Unknown').length,
      })
    }

    res.json({
      success: true,
      qr: {
        id: qrDoc.id,
        name: qr.name,
        type: qr.type,
        category: qr.category,
        content: qr.content,
        shortUrl: qr.shortUrl || null,
        scanCount: Number(qr.scanCount || 0),
        active: qr.active === true,
      },
      analytics: {
        totalScans: Number(qr.scanCount || 0),
        recordedEvents: events.length,
        dailyScans,
        dailyDeviceScans,
        deviceCounts,
        browserCounts,
        recentScans: groupedRecentScans,
      },
    })
  } catch (error) {
    console.error('getQrAnalytics failed:', error)
    res.status(500).json({ error: 'Could not load QR analytics.' })
  }
}


