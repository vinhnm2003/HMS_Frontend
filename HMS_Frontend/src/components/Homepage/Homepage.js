import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Homepage.css';
import Header from '../Layout/Header';

function Homepage() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <Header />
      <div className="homepage">

        {/* Hero Section: Giới thiệu tính năng chính */}
        <section className="hero-section">
          <Container>
            <Row className="align-items-center">
              <Col md={6} data-aos="fade-right">
                <h1 className="hero-title">Quản lý nhân sự thông minh</h1>
                <p className="hero-subtitle">
                  Giải pháp toàn diện cho việc quản lý nhân sự, tài liệu và công việc
                </p>
                <Button as={Link} to="/login" variant="primary" size="lg" className="hero-button">
                  Bắt đầu ngay
                </Button>
              </Col>
              <Col md={6} data-aos="fade-left">
                <img
                  src="/images/kacoffee.jpg"
                  alt="Quản lý nhân sự"
                  className="hero-image"
                />
              </Col>
            </Row>
          </Container>
        </section>

        {/* Hero Section: Giới thiệu về Ka Coffee */}
        <section className="hero-section">
          <Container>
            <Row className="align-items-center">
              <Col md={6} data-aos="fade-right">
                <h1 className="hero-title">Sơ lược về ...Ka Coffee </h1>
                <p className="hero-subtitle">
                  …Ka Coffee là một trong những thương hiệu F&B tiên phong cho phong trào kinh doanh cà phê rang xay chất lượng cao, được thành lập từ năm 2020 và hiện có 4 quán tại Hà Nội, 1 quán tại TP. HCM.

                  Ngay từ cuối năm 2019, Founder …Ka Coffee Vũ Trường Giang đã bắt đầu suy nghĩ về một mô hình nhỏ gọn, tinh giản, phù hợp với giới trẻ. Thay vì mở cửa hàng quy mô lớn, anh muốn bán cà phê ngon. Để làm được điều đấy thì những thứ xung quanh nên tối giản để khách hàng tập trung vào cà phê. Thêm vào đó rủi ro kinh doanh cũng thấp. Mặt bằng quán đầu tiên của …Ka chỉ rộng 30 m2 nên không tốn nhiều chi phí.
                </p>
              </Col>
              <Col md={6} data-aos="fade-left">
                <img
                  src="/images/owner.png"
                  alt="Quản lý nhân sự"
                  className="hero-image"
                />
              </Col>
            </Row>
          </Container>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <Container>
            <h2 className="section-title" data-aos="fade-up">Tính năng nổi bật</h2>
            <Row className="g-4">
              <Col md={4} data-aos="zoom-in">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <Card.Title>Quản lý tài liệu</Card.Title>
                    <Card.Text>
                      Lưu trữ và quản lý tài liệu một cách an toàn và hiệu quả
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} data-aos="zoom-in">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">
                      <i className="fas fa-clipboard-list"></i>
                    </div>
                    <Card.Title>Khảo sát</Card.Title>
                    <Card.Text>
                      Tạo và quản lý các cuộc khảo sát nhanh chóng
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} data-aos="zoom-in">
                <Card className="feature-card">
                  <Card.Body>
                    <div className="feature-icon">
                      <i className="fas fa-tasks"></i>
                    </div>
                    <Card.Title>Quản lý công việc</Card.Title>
                    <Card.Text>
                      Theo dõi và phân công công việc hiệu quả
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <Container>
            <h2 className="section-title" data-aos="fade-up">Mọi người  nói gì</h2>
            <Carousel>
              <Carousel.Item>
                <div className="testimonial" data-aos="fade-up">
                  <p className="testimonial-text">
                    "Hệ thống quản lý nhân sự này đã giúp chúng tôi tiết kiệm rất nhiều thời gian và công sức."
                  </p>
                  <div className="testimonial-author">
                    <img src="/images/quanli.png" alt="Người dùng" className="author-avatar" />
                    <div>
                      <h5>Nguyễn Văn A</h5>
                      <p>Quản lí Cơ sở nguyễn Tuân</p>
                    </div>
                  </div>
                </div>
              </Carousel.Item>
              <Carousel.Item>
                <div className="testimonial" data-aos="fade-up">
                  <p className="testimonial-text">
                    "Giao diện thân thiện, dễ sử dụng và đầy đủ tính năng cần thiết."
                  </p>
                  <div className="testimonial-author">
                    <img src="/images/phache.png" alt="Người dùng" className="author-avatar" />
                    <div>
                      <h5>Trần Thị Bích</h5>
                      <p>Pha chế cơ sở Hoàng Quốc Việt</p>
                    </div>
                  </div>
                </div>
              </Carousel.Item>
            </Carousel>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} className="text-center" data-aos="fade-up">
                <h2>Sẵn sàng bắt đầu?</h2>
                <p className="cta-text">
                  Hãy đăng ký ngay hôm nay để trải nghiệm hệ thống quản lý nhân sự thông minh
                </p>
                <Button as={Link} to="/login" variant="primary" size="lg" className="cta-button">
                  Đăng ký miễn phí
                </Button>
              </Col>
            </Row>
          </Container>
        </section>

      </div>
    </>
  );
}

export default Homepage;