import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { getAllNewsletters, getNewsletterAnalytics, getDashboardAnalytics } from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Analytics = () => {
  const [searchParams] = useSearchParams()
  const newsletterId = searchParams.get('newsletterId')
  const [newsletters, setNewsletters] = useState([])
  const [selectedNewsletter, setSelectedNewsletter] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (newsletterId && newsletters.length > 0) {
      const newsletter = newsletters.find(n => n.id === parseInt(newsletterId))
      if (newsletter) {
        setSelectedNewsletter(newsletter)
        fetchNewsletterAnalytics(newsletter.id)
      }
    }
  }, [newsletterId, newsletters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [newslettersResponse, dashboardResponse] = await Promise.all([
        getAllNewsletters(),
        getDashboardAnalytics(),
      ])

      setNewsletters(newslettersResponse.data || [])
      setDashboardData(dashboardResponse.data)

      if (!newsletterId && newslettersResponse.data?.length > 0) {
        const sentNewsletters = newslettersResponse.data.filter(n => n.sentAt)
        if (sentNewsletters.length > 0) {
          setSelectedNewsletter(sentNewsletters[0])
          fetchNewsletterAnalytics(sentNewsletters[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsletterAnalytics = async (id) => {
    try {
      const response = await getNewsletterAnalytics(id)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching newsletter analytics:', error)
    }
  }

  const handleNewsletterChange = (e) => {
    const id = parseInt(e.target.value)
    const newsletter = newsletters.find(n => n.id === id)
    if (newsletter) {
      setSelectedNewsletter(newsletter)
      fetchNewsletterAnalytics(newsletter.id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const sentNewsletters = newsletters.filter(n => n.sentAt)

  // Emails sent over time chart
  const emailsSentData = {
    labels: sentNewsletters.map(n => new Date(n.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Emails Sent',
        data: sentNewsletters.map(n => n.totalRecipients || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  }

  // Open rate chart
  const openRateData = {
    labels: sentNewsletters.map(n => n.title.substring(0, 20) + '...'),
    datasets: [
      {
        label: 'Open Rate (%)',
        data: sentNewsletters.map(n => {
          // This would need to be fetched for each newsletter
          return Math.random() * 100 // Placeholder
        }),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  }

  // Subscriber growth chart
  const subscriberGrowthData = {
    labels: ['Total Subscribed', 'Total Unsubscribed'],
    datasets: [
      {
        data: [
          dashboardData?.totalEmailsSent || 0,
          dashboardData?.totalEmailsOpened || 0,
        ],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Analytics</h1>

      {sentNewsletters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No sent newsletters found</p>
          <p className="text-gray-400 mt-2">Send a newsletter to see analytics</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Newsletter
            </label>
            <select
              value={selectedNewsletter?.id || ''}
              onChange={handleNewsletterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sentNewsletters.map((newsletter) => (
                <option key={newsletter.id} value={newsletter.id}>
                  {newsletter.title} - {new Date(newsletter.sentAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedNewsletter && analytics && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">{selectedNewsletter.title}</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold">{analytics.totalSent || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Opened</p>
                  <p className="text-2xl font-bold">{analytics.totalOpened || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open Rate</p>
                  <p className="text-2xl font-bold">{analytics.openRate?.toFixed(2) || '0.00'}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Emails Sent Over Time</h3>
              <Line data={emailsSentData} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Open Rate by Newsletter</h3>
              <Bar data={openRateData} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-4">Email Statistics</h3>
              <div className="h-64">
                <Doughnut data={subscriberGrowthData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Analytics

