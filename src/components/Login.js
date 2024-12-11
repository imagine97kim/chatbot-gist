import { useState } from 'react'
import { Form, Button, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import useAuthStore from '@/store/authStore'
import styles from '@/styles/Login.module.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore(state => state.login)

  const validateCredentials = (username, password) => {
    if (username === 'admin') {
      return password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    } else {
      return password === process.env.NEXT_PUBLIC_USER_PASSWORD
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    if (!validateCredentials(username, password)) {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.')
      setPassword('') // 비밀번호 입력값 초기화
      return
    }

    login({ 
      username, 
      role: username === 'admin' ? 'admin' : 'user' 
    })
  }

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <h2 className={styles.title}>아이로</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.label}>
              <FontAwesomeIcon icon={faUser} className="me-2" />
              아이디
            </Form.Label>
            <Form.Control
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
            />
          </Form.Group>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.label}>
              <FontAwesomeIcon icon={faLock} className="me-2" />
              비밀번호
            </Form.Label>
            <Form.Control
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </Form.Group>
          <Button className={styles.loginButton} type="submit">
            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
            로그인
          </Button>
        </Form>
      </Card>
    </div>
  )
} 