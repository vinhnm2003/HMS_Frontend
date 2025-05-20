import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, NavDropdown, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [imageError, setImageError] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin user từ localStorage khi component mount
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('branch');
    // Chuyển về trang đăng nhập
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="header">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          {!imageError ? (
            <img
              src="/images/logo.png"
              alt="Logo"
              className="logo"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="logo-text">HRMS</span>
          )}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto nav-center">
            <Nav.Link as={Link} to="/" className="nav-link">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/documents" className="nav-link">Tài liệu</Nav.Link>
            <Nav.Link as={Link} to="/surveys" className="nav-link">Khảo sát</Nav.Link>
            <Nav.Link as={Link} to="/tasks" className="nav-link">Công việc</Nav.Link>
            <Nav.Link as={Link} to="/inventory" className="nav-link">Kho</Nav.Link>
            <Nav.Link as={Link} to="/honor-board" className="nav-link">Bảng vinh danh</Nav.Link>
            {/* Thêm nút Dashboard cho manager */}
            {user && (user.role === 'manager' || user.Role === 'manager') && (
              <Nav.Link as={Link} to="/dashboard" className="nav-link">Thống kê</Nav.Link>
            )}
          </Nav>
          
          {user && (
            <Nav className="ms-auto align-items-center">
              <div className="d-flex align-items-center">
                <NavDropdown 
                  title={`Xin chào, ${user.fullname}`} 
                  id="basic-nav-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Thông tin cá nhân
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
