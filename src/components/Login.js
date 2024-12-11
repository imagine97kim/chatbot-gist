import { useState } from 'react'
import { Form, Button, Container, Card } from 'react-bootstrap'
import useAuthStore from '@/store/authStore'

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
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '300px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">로그인</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>아이디</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>비밀번호</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              로그인
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
} 