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

  const handleSubmit = (e) => {
    e.preventDefault()
    // 실제 구현에서는 API 호출이 필요합니다
    login({ 
      username, 
      role: username === 'admin' ? 'admin' : 'user' 
    })
  }

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <h2 className={styles.title}>AI 채팅 어시스턴트</h2>
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