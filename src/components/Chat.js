import { useState, useRef, useEffect } from 'react'
import { Card, Button, Form, InputGroup, Modal } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPaperPlane, faFile, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import useAuthStore from '@/store/authStore'
import styles from '@/styles/Chat.module.css'
import { uploadToS3 } from '@/utils/s3Upload'
import { callLambdaFunction } from '@/utils/lambda'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCitation, setSelectedCitation] = useState(null)

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
        sender: '아이로',
        citations: data.citations
      }])
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, {
        type: 'text',
        content: '알 수 없는 오류가 발생했습니다.',
        timestamp: new Date(),
        sender: '아이로'
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
    if (file.size > 10 * 1024 * 1024) {
      setMessages(prev => [...prev, {
        type: 'text',
        content: '파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드할 수 있습니다.',
        timestamp: new Date(),
        sender: '아이로'
      }]);
      setIsTyping(false);
      return;
    }
    const result = await uploadToS3(file);
    console.log(result);
    setMessages(prev => [...prev, {
        type: 'text',
        content: '파일 업로드가 완료되었습니다.',
        timestamp: new Date(),
        sender: '아이로'
    }]);
    setIsTyping(false);
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>아이로</h2>
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
                    {msg.sender === user.username ? '나' : '아이로'}
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
                        msg.citations ? msg.citations.map((citation, index) => (
                          <div key={index} className={styles.citation}>
                            {citation.generatedResponsePart.textResponsePart.text}
                            <span 
                              className={styles.citationNumber}
                              onClick={() => {
                                setSelectedCitation(citation);
                                setShowModal(true);
                              }}
                            >
                              {`[${index + 1}]`}
                            </span>
                          </div>
                        )) : msg.content
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
                        <span>아이로가 답변중</span>
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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName={styles.citationModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>인용 정보</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.citationModalBody}>
          {selectedCitation && selectedCitation.retrievedReferences.map((reference, refIndex) => (
            <div key={refIndex} className={styles.referenceItem}>
              <strong>출처 {refIndex + 1}:</strong> {reference.location.s3Location.uri}
              <br />
              <strong>인용 내용 {refIndex + 1}:</strong> {reference.content.text}
              {refIndex < selectedCitation.retrievedReferences.length - 1 && <hr />}
            </div>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  )
} 