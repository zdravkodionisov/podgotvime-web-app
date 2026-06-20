import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FaGraduationCap, FaChartLine, FaCalendarCheck } from 'react-icons/fa'


function StudentPage() {
  const navigate = useNavigate()
  const student = JSON.parse(localStorage.getItem('student'))
  const [tasks, setTasks] = useState([])
  const [currentTask, setCurrentTask] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [isExerciseMode, setIsExerciseMode] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [activeTopic, setActiveTopic] = useState('')

  const topics = [
  {
    title: 'Действия с рационални числа',
    desc: 'Упражнения с цели, дробни и десетични числа',
    progress: 35,
    topicCode: 'rational_numbers'
  },
  {
    title: 'Формули за съкратено умножение',
    desc: 'Разпознаване и прилагане на формули',
    progress: 20,
    topicCode: 'short_multiplication'
  },
  {
    title: 'Ъгли в триъгълник',
    desc: 'Задачи за вътрешни ъгли и зависимости',
    progress: 50,
    topicCode: 'triangle_angles'
  },
  {
    title: 'Външни ъгли',
    desc: 'Намиране на външни ъгли и приложения',
    progress: 10,
    topicCode: 'external_angles'
  }
  ]


  const days = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н']
  const startExercise = async (topic) => {
  try {
    const response = await fetch(
      `http://localhost:5002/tasks/${topic}`
    )

    const data = await response.json()

    setTasks(data)
    setCurrentTask(0)
    setScore(0)
    setUserAnswer('')
    setIsExerciseMode(true)
    setFeedback(null)
    setActiveTopic(topic)

  } catch (error) {
    console.error(error)
  }
  }
  
  const checkAnswer = () => {
  const correctAnswer = tasks[currentTask].correct_answer
  const isCorrect = userAnswer.trim() === correctAnswer.trim()

  if (isCorrect) {
    setScore(score + 1)
  }

  setFeedback({
    isCorrect,
    correctAnswer
  })
  }

  const nextTask = () => {
  setUserAnswer('')
  setFeedback(null)

  if (currentTask + 1 < tasks.length) {
    setCurrentTask(currentTask + 1)
  } else {
    saveAttempt()
    setCurrentTask(tasks.length)
  }
  }

  const saveAttempt = async () => {
  const student = JSON.parse(localStorage.getItem('student'))

  await fetch('http://localhost:5002/exercise-attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentId: student.id,
      topic: activeTopic,
      totalTasks: tasks.length,
      correctAnswers: score
    })
  })
  }

  return (
    <main className="student-page">
      <section className="student-dashboard">
              {isExerciseMode && (
        <div className="exercise-panel">
          {currentTask < tasks.length ? (
            <>
              <p className="exercise-progress">
                Задача {currentTask + 1} от {tasks.length}
              </p>

              <h2>{tasks[currentTask].question}</h2>

              <input
                className="answer-input"
                type="text"
                placeholder="Въведи отговор"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />

              {feedback && (
                <div className={feedback.isCorrect ? 'feedback correct' : 'feedback wrong'}>
                  {feedback.isCorrect
                    ? 'Верен отговор!'
                    : `Грешен отговор. Правилен отговор: ${feedback.correctAnswer}`}
                </div>
              )}



              {!feedback ? (
                <button className="prepare-button" onClick={checkAnswer}>
                  Провери
                </button>
              ) : (
                <button className="prepare-button" onClick={nextTask}>
                  Следваща задача
                </button>
              )}

              <button
                className="back-button"
                onClick={() => setIsExerciseMode(false)}
              >
                Назад към темите
              </button>
            </>
          ) : (
            <>
              <h2>Резултат</h2>
              <p className="result-text">
                Ти реши вярно {score} от {tasks.length} задачи.
              </p>

              <button
                className="prepare-button"
                onClick={() => {
                  setIsExerciseMode(false)
                  setCurrentTask(0)
                  setScore(0)
                }}
              >
                Край на упражнението
              </button>
            </>
          )}
        </div>
      )}
        {!isExerciseMode && (
        <>
        <header className="dashboard-header">
          <div>
            <p className="welcome-label">Добре дошъл,</p>
            <h1>{student ? `${student.firstName} ${student.lastName}` : 'Ученик'}</h1>
            <p className="school-info">Подготовка по математика за НВО в 7. клас</p>
          </div>

          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('student')
              navigate('/auth')
            }}
          >
            Изход
          </button>
        </header>

        <section className="stats-row">
         <div className="stat-card">
            <FaGraduationCap className="stat-icon" />
            <span>Клас</span>
            <strong>7</strong>
          </div>

          <div className="stat-card">
            <FaCalendarCheck className="stat-icon" />
            <span>Активност</span>
            <strong>7 дни</strong>
          </div>

          <div className="stat-card">
            <FaChartLine className="stat-icon" />
            <span>Напредък</span>
            <strong>28%</strong>
          </div>
        </section>

        <section className="main-grid">
          <div className="topics-panel">
            <div className="section-title">
              <h2>Теми за подготовка</h2>
              <p>Избери тема и започни упражнение</p>
            </div>

            <div className="topics-grid">
              {topics.map((topic, index) => (
                <article className="modern-topic-card" key={index}>
                  <div className="topic-icon">{index + 1}</div>

                  <h3>{topic.title}</h3>
                  <p>{topic.desc}</p>

                  <div className="progress-line">
                    <div style={{ width: `${topic.progress}%` }}></div>
                  </div>

                  <span className="progress-text">{topic.progress}% завършено</span>

                
                    <button className="prepare-button" onClick={() => startExercise(topic.topicCode)}>
                      Подготви-ме
                    </button>
                  
                </article>
              ))}
            </div>
          </div>

          <aside className="activity-panel">
            <h2>Активност</h2>
            <p>Следи постоянството си през седмицата</p>

            <div className="days-grid">
              {days.map((day, index) => (
                <div className={index < 4 ? 'day active' : 'day'} key={index}>
                  {day}
                </div>
              ))}
            </div>

            <div className="next-task">
              <span>Следваща препоръка</span>
              <strong>Рационални числа</strong>
              <p>Продължи с кратко упражнение от 10 задачи.</p>
            </div>
          </aside>
        </section>
        </>
    )}
      </section>
    </main>
  )
}

export default StudentPage