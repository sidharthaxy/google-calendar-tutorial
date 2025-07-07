import { useState } from 'react'
import './App.css'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState(null)
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    location: '',
    start: '',
    end: '',
    timeZone: 'Asia/Kolkata',
    repeat: '',
  })
  const [buttonState, setButtonState] = useState('create') // create / another

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async codeResponse => {
      try {
        const code = codeResponse.code;
        const tokenRes = await axios.post('http://localhost:8000/api/create-tokens', { code });

        const { email } = tokenRes.data;
        localStorage.setItem('userEmail', email);
        setUserEmail(email);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Login Failed:', error);
        alert('❌ Login failed. Check backend.');
      }
    },
    onError: error => {
      console.error('Login Failed:', error);
    },
    scope: 'openid email profile https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent',
  })

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      const email = userEmail || localStorage.getItem('userEmail');
      const response = await axios.post('http://localhost:8000/api/create-event', {
        ...formData,
        email,
      });
      alert('✅ Event created successfully!');
      setButtonState('another');
    } catch (error) {
      console.error(error);
      alert('❌ Failed to create event.');
    }
  }

  const resetForm = () => {
    setFormData({
      summary: '',
      description: '',
      location: '',
      start: '',
      end: '',
      timeZone: 'Asia/Kolkata',
      repeat: '',
    })
    setButtonState('create')
  }

  return (
    <div className="App">
      <header style={{
        backgroundColor: '#1e3a8a',
        height: '8vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 1000
      }}>
        <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>
          Add your events to Google Calendar
        </h1>
      </header>

      <div style={{ marginTop: '10vh', padding: '2rem' }}>
        {!isLoggedIn ? (
          <div style={{ marginTop: '5rem', textAlign: 'center' }}>
            <button
              onClick={login}
              style={{
                //padding: '1rem 2rem',
                fontSize: '1.2rem',
                backgroundColor: '#34A853',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
              }}
            >
              Sign in and authorize calendar access
            </button>
          </div>
        ) : (
          <div style={{
            maxWidth: '500px',
            margin: '2rem auto',
            padding: '2rem',
            border: '1px solid #ccc',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <label>Event Title</label>
            <input name="summary" value={formData.summary} onChange={handleChange} placeholder="Event summary" />

            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Event description" />

            <label>Location</label>
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Event location" />

            <label>Start Time</label>
            <input type="datetime-local" name="start" value={formData.start} onChange={handleChange} />

            <label>End Time</label>
            <input type="datetime-local" name="end" value={formData.end} onChange={handleChange} />

            <label>Time Zone</label>
            <select name="timeZone" value={formData.timeZone} onChange={handleChange}>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>

            <label>Repeat</label>
            <select name="repeat" value={formData.repeat} onChange={handleChange}>
              <option value="">Does not repeat</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>

            {buttonState === 'create' ? (
              <button
                onClick={handleSubmit}
                style={{
                  backgroundColor: '#4285F4',
                  color: 'white',
                  padding: '0.8rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Create Event
              </button>
            ) : (
              <button
                onClick={resetForm}
                style={{
                  backgroundColor: '#F4B400',
                  color: 'white',
                  padding: '0.8rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Add Another Event
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App