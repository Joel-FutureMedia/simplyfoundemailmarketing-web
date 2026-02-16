import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createNewsletter, sendNewsletter, getAllSubscribers, scheduleEmail } from '../services/api'

const CreateNewsletter = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    mediaFile: null,
  })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [sendOption, setSendOption] = useState('now') // 'now', 'schedule'
  const [scheduledDateTime, setScheduledDateTime] = useState('')

  useEffect(() => {
    fetchSubscriberCount()
  }, [])

  const fetchSubscriberCount = async () => {
    try {
      const response = await getAllSubscribers()
      const activeSubscribers = response.data.filter(s => s.subscribed)
      setSubscriberCount(activeSubscribers.length)
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, mediaFile: file }))
      
      // Create preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview({ type: 'image', url: reader.result })
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('video/')) {
        setPreview({ type: 'video', url: URL.createObjectURL(file) })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.subtitle) {
      alert('Please fill in all required fields')
      return
    }

    if (subscriberCount === 0) {
      alert('No active subscribers. Cannot create newsletter.')
      return
    }

    try {
      setLoading(true)
      const data = new FormData()
      data.append('title', formData.title)
      data.append('subtitle', formData.subtitle)
      data.append('content', formData.content || '')
      if (formData.mediaFile) {
        data.append('mediaFile', formData.mediaFile)
      }

      const response = await createNewsletter(data)
      const newsletterId = response.data.newsletter.id
      
      if (sendOption === 'schedule') {
        if (!scheduledDateTime) {
          alert('Please select a scheduled date and time')
          return
        }
        
        const scheduledDate = new Date(scheduledDateTime)
        if (scheduledDate <= new Date()) {
          alert('Scheduled time must be in the future')
          return
        }
        
        await scheduleEmail(newsletterId, scheduledDate.toISOString())
        alert(`Newsletter scheduled successfully for ${scheduledDate.toLocaleString()}!`)
      } else {
        await sendNewsletter(newsletterId)
        alert('Newsletter sending started!')
      }
      
      navigate('/newsletters')
    } catch (error) {
      console.error('Error creating newsletter:', error)
      alert('Error creating newsletter: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create Newsletter</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600">
          Active Subscribers: <span className="font-bold text-blue-600">{subscriberCount}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter newsletter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter newsletter subtitle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter newsletter content (HTML supported)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image or Video
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {preview && (
              <div className="mt-4">
                {preview.type === 'image' ? (
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="max-w-md rounded-lg shadow-md"
                  />
                ) : (
                  <video
                    src={preview.url}
                    controls
                    className="max-w-md rounded-lg shadow-md"
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Option
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendOption"
                  value="now"
                  checked={sendOption === 'now'}
                  onChange={(e) => setSendOption(e.target.value)}
                  className="mr-2"
                />
                <span>Send Now</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendOption"
                  value="schedule"
                  checked={sendOption === 'schedule'}
                  onChange={(e) => setSendOption(e.target.value)}
                  className="mr-2"
                />
                <span>Schedule</span>
              </label>
            </div>
            
            {sendOption === 'schedule' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={sendOption === 'schedule'}
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : sendOption === 'schedule' ? 'Create & Schedule' : 'Create & Send'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/newsletters')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateNewsletter

