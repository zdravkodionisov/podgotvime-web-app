import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    school: '',
    grade: '',
    parentName: '',
    teacherName: '',
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async () => {
    const url = isLogin
      ? 'http://localhost:5002/login'
      : 'http://localhost:5002/register'

    const bodyData = isLogin
      ? {
          email: formData.email,
          password: formData.password
        }
      : formData

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.message)
      return
    }

    if (isLogin) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('student', JSON.stringify(data.student))
    }

    alert(data.message)
    navigate('/student')
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>{isLogin ? 'Вход' : 'Регистрация'}</h1>

        <div className="auth-switch">
          <button onClick={() => setIsLogin(true)}>Вход</button>
          <button onClick={() => setIsLogin(false)}>Регистрация</button>
        </div>

        {!isLogin && (
          <>
            <input name="firstName" type="text" placeholder="Име" onChange={handleChange} />
            <input name="lastName" type="text" placeholder="Фамилия" onChange={handleChange} />
            <input name="city" type="text" placeholder="Град" onChange={handleChange} />
            <input name="school" type="text" placeholder="Училище" onChange={handleChange} />
            <input name="grade" type="text" placeholder="Клас" onChange={handleChange} />
            <input name="parentName" type="text" placeholder="Име на родител" onChange={handleChange} />
            <input name="teacherName" type="text" placeholder="Име на учител" onChange={handleChange} />
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Имейл"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Парола"
          value={formData.password}
          onChange={handleChange}
        />

        <button onClick={handleSubmit}>
          {isLogin ? 'Вход' : 'Регистрация'}
        </button>
      </div>
    </main>
  )
}

export default AuthPage