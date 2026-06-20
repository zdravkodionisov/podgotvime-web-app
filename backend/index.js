const express = require('express')
const cors = require('cors')
require('dotenv').config()
const pool = require('./config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Podgotvi-me Backend работи!')
})

const PORT = 5002

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({
      message: 'Връзката с базата работи!',
      time: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({
      message: 'Грешка при връзка с базата',
      error: error.message
    })
  }
})

app.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      city,
      school,
      grade,
      parentName,
      teacherName,
      email,
      password
    } = req.body

    const existingUser = await pool.query(
      'SELECT * FROM students WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Имейлът вече е регистриран' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newStudent = await pool.query(
      `INSERT INTO students 
      (first_name, last_name, city, school, grade, parent_name, teacher_name, email, password_hash)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id, first_name, last_name, email`,
      [firstName, lastName, city, school, grade, parentName, teacherName, email, passwordHash]
    )

    res.status(201).json({
      message: 'Ученикът е регистриран успешно',
      student: newStudent.rows[0]
    })

  } catch (error) {
    res.status(500).json({
      message: 'Грешка при регистрация',
      error: error.message
    })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await pool.query(
      'SELECT * FROM students WHERE email = $1',
      [email]
    )

    if (user.rows.length === 0) {
      return res.status(401).json({
        message: 'Невалиден имейл или парола'
      })
    }

    const student = user.rows[0]

    const validPassword = await bcrypt.compare(
      password,
      student.password_hash
    )

    if (!validPassword) {
      return res.status(401).json({
        message: 'Невалиден имейл или парола'
      })
    }

    const token = jwt.sign(
      {
        id: student.id,
        email: student.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    res.json({
      message: 'Успешен вход',
      token,
      student: {
        id: student.id,
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email
      }
    })

  } catch (error) {
    res.status(500).json({
      message: 'Грешка при вход',
      error: error.message
    })
  }
})

app.get('/tasks/:topic', async (req, res) => {
  try {
    const { topic } = req.params

    const result = await pool.query(
      'SELECT * FROM tasks WHERE topic = $1 ORDER BY id',
      [topic]
    )

    res.json(result.rows)

  } catch (error) {
    res.status(500).json({
      message: 'Грешка при зареждане на задачите',
      error: error.message
    })
  }
})

app.post('/exercise-attempts', async (req, res) => {
  try {
    const { studentId, topic, totalTasks, correctAnswers } = req.body

    const result = await pool.query(
      `INSERT INTO exercise_attempts
      (student_id, topic, total_tasks, correct_answers)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [studentId, topic, totalTasks, correctAnswers]
    )

    res.status(201).json({
      message: 'Опитът е записан успешно',
      attempt: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({
      message: 'Грешка при запис на опит',
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Сървърът работи на порт ${PORT}`)
})

