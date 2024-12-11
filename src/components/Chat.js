import { useState, useRef, useEffect } from 'react'
import { Card, Button, Form, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPaperPlane, faFile, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import useAuthStore from '@/store/authStore'
import styles from '@/styles/Chat.module.css'
import { uploadToS3 } from '@/utils/s3Upload'
import { callLambdaFunction } from '@/utils/lambda'



const LAMBDA_URL = process.env.NEXT_PUBLIC_LAMBDA_URL;


// 임시 AI 응답 목록
// const AI_RESPONSES = [
//   "흥미로운 의견이네요. 더 자세히 설명해주실 수 있나요?",
//   "네, 말씀하신 내용 잘 이해했습니다.",
//   "그렇군요. 제가 도움이 될 만한 제안을 해드릴 수 있을 것 같아요.",
//   "좋은 질문이에요! 한번 같이 살펴볼까요?",
//   "말씀하신 부분에 대해 조금 더 생각해볼 필요가 있을 것 같아요.",
// ]

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

  const addAIResponse = async () => {
    setIsTyping(true)
    try {
      const data = await callLambdaFunction(newMessage)
      setMessages(prev => [...prev, {
        type: 'text',
        content: data.response,
        timestamp: new Date(),
        sender: 'AI Assistant'
      }])
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, {
        type: 'text',
        content: 'Sorry, I encountered an error and couldn\'t get a response from the AI.',
        timestamp: new Date(),
        sender: 'AI Assistant'
      }])
    } finally {
      setIsTyping(false)
    }
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
    setIsTyping(true);

    uploadFileToS3(file);
    
  }

  const uploadFileToS3 = async (file) => {
    const result = await uploadToS3(file);
    console.log(result);
    setMessages(prev => [...prev, {
        type: 'text',
        content: '파일 업로드가 완료되었습니다.',
        timestamp: new Date(),
        sender: 'AI Assistant'
    }]);
    setIsTyping(false);
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>AI 채팅 어시스턴트</h2>
        <Button 
          className={styles.logoutButton}
          onClick={logout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          로그아웃
        </Button>
      </div>
      <Card className={styles.chatCard}>
        <Card.Body className="d-flex flex-column p-0">
          <div className={styles.messagesContainer}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messageWrapper} ${
                  msg.sender === user.username ? styles.userMessage : ''
                }`}
              >
                <div className={styles.message}>
                  <small className={styles.sender}>
                    {msg.sender === user.username ? '나' : 'AI Assistant'}
                  </small>
                  <Card className={`${styles.messageContent} ${
                    msg.sender === user.username ? styles.userMessageContent : styles.aiMessageContent
                  }`}>
                    <Card.Body className="p-0">
                      {msg.type === 'file' ? (
                        <div className={styles.fileMessage}>
                          <FontAwesomeIcon icon={faFile} className={styles.fileIcon} />
                          <div>
                            <div className={styles.fileName}>{msg.content.name}</div>
                            <div className={styles.fileSize}>
                              {(msg.content.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </Card.Body>
                  </Card>
                  <small className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={styles.messageWrapper}>
                <div className={styles.message}>
                  <Card className={styles.messageContent}>
                    <Card.Body className="p-0">
                      <div className={styles.typingIndicator}>
                        <span>AI가 입력중</span>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                        <div className={styles.typingDot}></div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Form.Control
                  className={styles.messageInput}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                />
                <Button type="submit" className={styles.sendButton}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                </Button>
              </InputGroup>
            </Form>
          </div>
          
          {isAdmin && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button 
                className={styles.uploadButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  )
} 