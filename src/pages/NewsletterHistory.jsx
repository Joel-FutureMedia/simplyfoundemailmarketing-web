import { useEffect, useState } from 'react'
import { getAllNewsletters, deleteNewsletter, sendNewsletter, getNewsletterAnalytics, getAllScheduledEmails, cancelScheduledEmail } from '../services/api'
import { Link } from 'react-router-dom'

const NewsletterHistory = () => {
  const [newsletters, setNewsletters] = useState([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({})
  const [expandedId, setExpandedId] = useState(null)
  const [scheduledEmails, setScheduledEmails] = useState([])

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      setLoading(true)
      const [newslettersResponse, scheduledResponse] = await Promise.all([
        getAllNewsletters(),
        getAllScheduledEmails()
      ])
      
      setNewsletters(newslettersResponse.data || [])
      setScheduledEmails(scheduledResponse.data || [])
      
      // Fetch analytics for each newsletter
      const analyticsData = {}
      for (const newsletter of newslettersResponse.data || []) {
        if (newsletter.sentAt) {
          try {
            const analyticsResponse = await getNewsletterAnalytics(newsletter.id)
            analyticsData[newsletter.id] = analyticsResponse.data
          } catch (error) {
            console.error(`Error fetching analytics for newsletter ${newsletter.id}:`, error)
          }
        }
      }
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error fetching newsletters:', error)
      alert('Error fetching newsletters')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancelSchedule = async (id) => {
    if (window.confirm('Are you sure you want to cancel this scheduled email?')) {
      try {
        await cancelScheduledEmail(id)
        fetchNewsletters()
        alert('Scheduled email cancelled successfully')
      } catch (error) {
        console.error('Error cancelling scheduled email:', error)
        alert('Error cancelling scheduled email')
      }
    }
  }
  
  const getScheduledInfo = (newsletterId) => {
    return scheduledEmails.find(s => s.newsletterId === newsletterId && !s.sent)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this newsletter?')) {
      try {
        await deleteNewsletter(id)
        fetchNewsletters()
        alert('Newsletter deleted successfully')
      } catch (error) {
        console.error('Error deleting newsletter:', error)
        alert('Error deleting newsletter')
      }
    }
  }

  const handleSend = async (id) => {
    if (window.confirm('Are you sure you want to send this newsletter to all subscribers?')) {
      try {
        await sendNewsletter(id)
        alert('Newsletter sending started!')
        setTimeout(() => {
          fetchNewsletters()
        }, 2000)
      } catch (error) {
        console.error('Error sending newsletter:', error)
        alert('Error sending newsletter: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Newsletter History</h1>
        <Link
          to="/create-newsletter"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create New Newsletter
        </Link>
      </div>

      {newsletters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No newsletters found</p>
          <Link
            to="/create-newsletter"
            className="mt-4 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Your First Newsletter
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent/Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newsletters.map((newsletter) => {
                  const newsletterAnalytics = analytics[newsletter.id] || {}
                  const isSent = newsletter.sentAt !== null
                  const isExpanded = expandedId === newsletter.id
                  const scheduledInfo = getScheduledInfo(newsletter.id)
                  const isScheduled = scheduledInfo !== undefined

                  return (
                    <>
                      <tr key={newsletter.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {newsletter.mediaUrl && newsletter.mediaType === 'IMAGE' ? (
                            <img
                              src={newsletter.mediaUrl}
                              alt="Newsletter"
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : newsletter.mediaUrl && newsletter.mediaType === 'VIDEO' ? (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500 text-xs">Video</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No media</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{newsletter.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{newsletter.subtitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              isSent
                                ? 'bg-green-100 text-green-800'
                                : isScheduled
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {isSent ? 'Sent' : isScheduled ? 'Scheduled' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(newsletter.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isSent 
                            ? new Date(newsletter.sentAt).toLocaleDateString()
                            : isScheduled
                            ? new Date(scheduledInfo.scheduledAt).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpand(newsletter.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                            {!isSent && !isScheduled && (
                              <button
                                onClick={() => handleSend(newsletter.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Send
                              </button>
                            )}
                            {isScheduled && (
                              <button
                                onClick={() => handleCancelSchedule(scheduledInfo.id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Cancel
                              </button>
                            )}
                            {isSent && (
                              <Link
                                to={`/analytics?newsletterId=${newsletter.id}`}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Analytics
                              </Link>
                            )}
                            <button
                              onClick={() => handleDelete(newsletter.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Full Image */}
                              {newsletter.mediaUrl && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Media</h4>
                                  {newsletter.mediaType === 'IMAGE' ? (
                                    <img
                                      src={newsletter.mediaUrl}
                                      alt="Newsletter media"
                                      className="max-w-md rounded-lg shadow-md"
                                      onError={(e) => {
                                        e.target.style.display = 'none'
                                      }}
                                    />
                                  ) : (
                                    <video
                                      src={newsletter.mediaUrl}
                                      controls
                                      className="max-w-md rounded-lg shadow-md"
                                    />
                                  )}
                                </div>
                              )}

                              {/* Content */}
                              {newsletter.content && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Content</h4>
                                  <div 
                                    className="text-sm text-gray-600 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: newsletter.content }}
                                  />
                                </div>
                              )}

                              {/* Analytics */}
                              {isSent && newsletterAnalytics.totalSent && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Analytics</h4>
                                  <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg">
                                    <div>
                                      <p className="text-xs text-gray-600">Total Sent</p>
                                      <p className="text-lg font-bold">{newsletterAnalytics.totalSent || newsletter.totalRecipients || 0}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">Total Opened</p>
                                      <p className="text-lg font-bold">{newsletterAnalytics.totalOpened || 0}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-600">Open Rate</p>
                                      <p className="text-lg font-bold">
                                        {newsletterAnalytics.openRate?.toFixed(2) || '0.00'}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-2 border-t border-gray-200">
                                {!isSent && (
                                  <button
                                    onClick={() => handleSend(newsletter.id)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                  >
                                    Send Now
                                  </button>
                                )}
                                <Link
                                  to={`/analytics?newsletterId=${newsletter.id}`}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                  View Analytics
                                </Link>
                                <button
                                  onClick={() => handleDelete(newsletter.id)}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewsletterHistory
