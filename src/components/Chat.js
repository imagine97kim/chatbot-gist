import { useState, useRef, useEffect } from 'react'
import { Container, Card, Button, Form, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import useAuthStore from '@/store/authStore'

// 임시 AI 응답 목록
const AI_RESPONSES = [
  "흥미로운 의견이네요. 더 자세히 설명해주실 수 있나요?",
  "네, 말씀하신 내용 잘 이해했습니다.",
  "그렇군요. 제가 도움이 될 만한 제안을 해드릴 수 있을 것 같아요.",
  "좋은 질문이에요! 한번 같이 살펴볼까요?",
  "말씀하신 부분에 대해 조금 더 생각해볼 필요가 있을 것 같아요.",
]

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const isAdmin = useAuthStore((state) => state.isAdmin)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: new Date(),
      sender: user.username
    }])
  }

  // AI 응답 추가 함수
  const addAIResponse = () => {
    setIsTyping(true)
    
    // 1~3초 사이 랜덤 딜레이 후 응답
    setTimeout(() => {
      const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
      setMessages(prev => [...prev, {
        type: 'text',
        content: randomResponse,
        timestamp: new Date(),
        sender: 'AI Assistant'
      }])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    addMessage({
      type: 'text',
      content: newMessage
    })
    setNewMessage('')
    
    // 사용자 메시지 전송 후 AI 응답 트리거
    addAIResponse()
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    addMessage({
      type: 'file',
      content: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    })
    
    // 파일 업로드 후 AI 응답 트리거
    addAIResponse()
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>채팅</h2>
        <Button variant="secondary" onClick={logout}>로그아웃</Button>
      </div>
      <Card>
        <Card.Body 
          style={{ 
            height: '70vh', 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          <div 
            className="messages-container mb-3" 
            style={{ 
              flex: 1, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '10px'
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === user.username ? 'text-end' : ''}`}
              >
                <small className="text-muted">{msg.sender}</small>
                <Card
                  style={{
                    display: 'inline-block',
                    maxWidth: '70%',
                    backgroundColor: msg.sender === user.username ? '#007bff' : '#f8f9fa',
                    color: msg.sender === user.username ? 'white' : 'black'
                  }}
                >
                  <Card.Body className="py-2 px-3">
                    {msg.type === 'file' ? (
                      <div>
                        <strong>파일:</strong> {msg.content.name}
                        <br />
                        <small>{(msg.content.size / 1024).toFixed(2)} KB</small>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </Card.Body>
                </Card>
                <small className="text-muted d-block">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
              </div>
            ))}
            {isTyping && (
              <div className="message">
                <small className="text-muted">AI Assistant</small>
                <Card
                  style={{
                    display: 'inline-block',
                    maxWidth: '70%',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <Card.Body className="py-2 px-3">
                    <span className="typing-indicator">입력중...</span>
                  </Card.Body>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Form.Control
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
              />
              <Button type="submit" variant="primary">
                <FontAwesomeIcon icon={faPaperPlane} />
              </Button>
            </InputGroup>
          </Form>
          
          {isAdmin && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button 
                variant="primary" 
                style={{ 
                  position: 'absolute', 
                  bottom: '80px', 
                  right: '20px',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
} 