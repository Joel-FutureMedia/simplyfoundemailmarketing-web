import { useEffect, useState } from 'react'
import { getSubscriberCounts, getDashboardAnalytics, getAllNewsletters } from '../services/api'
import { UsersIcon, MailIcon, ChartIcon, DocumentIcon, XCircleIcon, TrendingUpIcon } from '../components/Icons'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSubscribed: 0,
    totalUnsubscribed: 0,
    totalEmailsSent: 0,
    overallOpenRate: 0,
    newsletterCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [subscriberCounts, analytics, newsletters] = await Promise.all([
        getSubscriberCounts(),
        getDashboardAnalytics(),
        getAllNewsletters(),
      ])

      setStats({
        totalSubscribed: subscriberCounts.data.totalSubscribed || 0,
        totalUnsubscribed: subscriberCounts.data.totalUnsubscribed || 0,
        totalEmailsSent: analytics.data.totalEmailsSent || 0,
        overallOpenRate: analytics.data.overallOpenRate || 0,
        newsletterCount: newsletters.data?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-gray-600 text-lg">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Subscribers',
      value: stats.totalSubscribed,
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      change: '+12%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Total Unsubscribed',
      value: stats.totalUnsubscribed,
      icon: XCircleIcon,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      textColor: 'text-red-600',
      change: '-3%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Total Emails Sent',
      value: stats.totalEmailsSent,
      icon: MailIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
      change: '+24%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Open Rate',
      value: `${stats.overallOpenRate.toFixed(2)}%`,
      icon: ChartIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-600',
      change: '+5.2%',
      changeColor: 'text-green-600',
    },
    {
      title: 'Newsletters',
      value: stats.newsletterCount,
      icon: DocumentIcon,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-600',
      change: '+8',
      changeColor: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-2">Welcome back! Here's what's happening with your email campaigns.</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <TrendingUpIcon className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-gray-700">All systems operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Gradient Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.bgGradient}`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <div className={`text-xs font-semibold ${card.changeColor} flex items-center`}>
                    <TrendingUpIcon className="w-3 h-3 mr-1" />
                    {card.change}
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor} mb-2`}>{card.value}</p>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${card.gradient} transition-all duration-500`}
                      style={{ width: `${Math.min((card.value / (stats.totalSubscribed + stats.totalEmailsSent + stats.newsletterCount || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Performance Metrics</h2>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Subscribers</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSubscribed}</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-800">{stats.newsletterCount}</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <DocumentIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Card */}
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Engagement Rate</h2>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-sm">Open Rate</span>
                <span className="text-2xl font-bold">{stats.overallOpenRate.toFixed(2)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.overallOpenRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Emails Sent</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalEmailsSent}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-100 text-sm">Total Opens</p>
                  <p className="text-3xl font-bold mt-1">
                    {Math.round(stats.totalEmailsSent * (stats.overallOpenRate / 100))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

