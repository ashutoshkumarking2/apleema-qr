import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { getQrAnalytics, type QrAnalyticsResponse } from '../lib/api'

export default function QrDetail() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<QrAnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      if (!id) {
        setError('QR code ID is missing.')
        setLoading(false)
        return
      }

      try {
        const result = await getQrAnalytics(id)
        if (active) setData(result)
      } catch (e) {
        if (active) setError((e as Error).message || 'Could not load analytics.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => { active = false }
  }, [id])

  if (loading) {
    return <main className="min-h-screen bg-[#0b0b0f] p-8 text-gray-400">Loading QR analytics...</main>
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] p-8 text-white">
        <Link to="/dashboard" className="text-sm text-[#ff8a5f]">← Back to dashboard</Link>
        <p className="mt-8 text-red-400">{error || 'QR code not found.'}</p>
      </main>
    )
  }

  const { qr, analytics } = data
  const isDynamic = qr.type === 'dynamic'

  return (
    <main className="min-h-screen bg-[#0b0b0f] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/dashboard" className="text-sm text-[#ff8a5f] hover:text-white">← Back to dashboard</Link>

        <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#ff8a5f]">QR code analytics</p>
            <h1 className="mt-2 text-3xl font-semibold">{qr.name}</h1>
            <p className="mt-2 break-all text-sm text-gray-400">{qr.content}</p>
            {qr.shortUrl && <p className="mt-2 break-all text-sm text-[#ff8a5f]">{qr.shortUrl}</p>}
          </div>
          <span className="rounded-full border border-[#ff5a1f]/30 bg-[#ff5a1f]/10 px-4 py-2 text-xs capitalize text-[#ff8a5f]">
            {qr.type} QR
          </span>
        </div>

        {!isDynamic ? (
          <div className="mt-8 rounded-2xl border border-[#ff5a1f]/20 bg-[#14141a] p-6">
            <h2 className="font-semibold">Scan analytics unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              This is a static QR code. It sends scanners directly to its encoded content, so Apleema cannot record its scans. Create a dynamic QR code to track scans.
            </p>
            <Link to="/create" className="mt-4 inline-flex rounded-xl bg-[#ff5a1f] px-5 py-3 text-sm font-semibold">
              Create dynamic QR
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#14141a] p-6">
                <p className="text-sm text-gray-400">Total scans</p>
                <p className="mt-3 text-4xl font-semibold tabular-nums">{analytics.totalScans.toLocaleString()}</p>
                <p className="mt-2 text-xs text-gray-500">Recorded by Apleema redirect</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#14141a] p-6">
                <p className="text-sm text-gray-400">Recorded scan events</p>
                <p className="mt-3 text-4xl font-semibold tabular-nums">{analytics.recordedEvents.toLocaleString()}</p>
                <p className="mt-2 text-xs text-gray-500">Events available in scan history</p>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-white/10 bg-[#14141a] p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Scan activity</h2>
                <p className="mt-1 text-sm text-gray-400">Daily scans over the last 7 days</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyScans}>
                    <defs>
                      <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff5a1f" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ff5a1f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ffffff12" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} stroke="#777" tick={{ fill: '#999', fontSize: 12 }} />
                    <YAxis allowDecimals={false} stroke="#777" tick={{ fill: '#999', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#19191f', border: '1px solid #333', borderRadius: 12, color: '#fff' }} />
                    <Area type="monotone" dataKey="scans" stroke="#ff5a1f" strokeWidth={3} fill="url(#scanGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#14141a]">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-semibold">Recent scan history</h2>
                <p className="mt-1 text-sm text-gray-400">Repeated scans from the same browser are grouped together</p>
              </div>
              {analytics.recentScans.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">No scans recorded yet. Scan your dynamic QR code to see activity here.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="px-5 py-3">Date & time</th>
                        <th className="px-5 py-3">Device</th>
                        <th className="px-5 py-3">Browser</th>
                        <th className="px-5 py-3">Referrer</th>
                        <th className="px-5 py-3">Scans</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentScans.map(scan => (
                        <tr key={scan.id} className="border-t border-white/5">
                          <td className="px-5 py-4 text-gray-300">{scan.scannedAt ? new Date(scan.scannedAt).toLocaleString() : 'Time unavailable'}</td>
                          <td className="px-5 py-4 text-gray-300">{scan.device}</td>
                          <td className="px-5 py-4 text-gray-300">{scan.browser}</td>
                          <td className="max-w-[180px] truncate px-5 py-4 text-gray-400">{scan.referrer}</td>
                          <td className="px-5 py-4"><span className="rounded-full bg-[#ff5a1f]/10 px-3 py-1 text-xs font-semibold text-[#ff8a5f]">{scan.scanCount || 1} times</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

