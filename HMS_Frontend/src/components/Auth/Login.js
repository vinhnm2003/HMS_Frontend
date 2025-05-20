import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import './Login.css';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBtnLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:9999/api/auth/login', {
        username,
        password
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });  

      console.log("Response:", response);

      if (response.data.success && response.data.accessToken) {
        // Lưu thông tin vào localStorage
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("branch", response.data.user.branch);

        // Điều hướng dựa vào role
        switch (response.data.user.role) {
          case "admin":
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError("Đăng nhập thất bại! Vui lòng kiểm tra lại.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setError(error.response?.data?.message || "Lỗi đăng nhập! Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body>
          <h2 className="text-center mb-4">Đăng nhập</h2>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleBtnLogin();
          }}>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Tên đăng nhập</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </Form>
          <Button
            style={{ marginTop: '10px' }}
            variant="secondary"
            className="w-100"
            onClick={() => navigate('/')}
          >
            Trở về Màn hình chính
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login; 