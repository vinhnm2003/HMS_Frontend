import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Row, Col, Table, Modal, Spinner } from 'react-bootstrap';
import './Surveys.css';
import Header from '../Layout/Header';
import axios from 'axios';

function Surveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    link: '',
    deadline: ''
  });
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState(null);

  // Lấy token và role từ localStorage
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'employee';

  // Hàm kiểm tra và cập nhật status nếu quá hạn
  const checkAndUpdateSurveyStatus = async (survey) => {
    if (!survey.deadline) return;
    const now = new Date();
    const deadline = new Date(survey.deadline);
    if (deadline < now && survey.status !== 'inactive') {
      try {
        await axios.put(`http://localhost:9999/api/survey/${survey._id}`, { status: 'inactive' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        survey.status = 'inactive'; // Cập nhật tạm trên client
      } catch (err) {
        // Có thể log lỗi nếu cần
      }
    }
  };

  // Lấy danh sách khảo sát từ API
  const fetchSurveys = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:9999/api/survey/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const surveysData = res.data.data;
        // Kiểm tra và cập nhật status nếu quá hạn
        await Promise.all(surveysData.map(survey => checkAndUpdateSurveyStatus(survey)));
        setSurveys(surveysData);
      } else {
        setError('Không thể lấy danh sách khảo sát');
      }
    } catch (err) {
      setError('Lỗi khi lấy danh sách khảo sát');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
    // eslint-disable-next-line
  }, []);

  // Tạo khảo sát mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:9999/api/survey', newSurvey, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setShowCreateForm(false);
        setNewSurvey({ title: '', description: '', link: '', deadline: '' });
        fetchSurveys();
      } else {
        setError(res.data.message || 'Không thể tạo khảo sát');
      }
    } catch (err) {
      setError('Lỗi khi tạo khảo sát');
    } finally {
      setLoading(false);
    }
  };

  // Đóng khảo sát (update status)
  const handleCloseSurvey = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.put(`http://localhost:9999/api/survey/${id}`, { status: 'Đã đóng' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchSurveys();
      } else {
        setError('Không thể đóng khảo sát');
      }
    } catch (err) {
      setError('Lỗi khi đóng khảo sát');
    } finally {
      setLoading(false);
    }
  };

  // Xóa khảo sát
  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.delete(`http://localhost:9999/api/survey/${surveyToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setShowConfirmDelete(false);
        setSurveyToDelete(null);
        fetchSurveys();
      } else {
        setError('Không thể xóa khảo sát');
      }
    } catch (err) {
      setError('Lỗi khi xóa khảo sát');
    } finally {
      setLoading(false);
    }
  };

  // Lọc khảo sát theo role
  const filteredSurveys = (role === 'employee')
    ? surveys.filter(survey => survey.status === 'active')
    : surveys;

  // Hàm hiển thị trạng thái
  const renderStatus = (status) => {
    if (status === 'inactive') return <span className="status-badge status-inactive">Đã hết hạn</span>;
    if (status === 'Đã đóng') return <span className="status-badge status-closed">Đã đóng</span>;
    return <span className="status-badge status-open">Đang mở</span>;
  };

  return (
    <>
      <Header />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Khảo sát</h2>
          {(role === 'manager' || role === 'admin') && (
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              Tạo khảo sát mới
            </Button>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Modal tạo khảo sát */}
        <Modal show={showCreateForm} onHide={() => setShowCreateForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo khảo sát mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tên khảo sát</Form.Label>
                <Form.Control
                  type="text"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Link khảo sát (Google Form, v.v...)</Form.Label>
                <Form.Control
                  type="text"
                  value={newSurvey.link}
                  onChange={(e) => setNewSurvey({ ...newSurvey, link: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Hạn chót</Form.Label>
                <Form.Control
                  type="date"
                  value={newSurvey.deadline}
                  onChange={(e) => setNewSurvey({ ...newSurvey, deadline: e.target.value })}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowCreateForm(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Tạo khảo sát'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Tên khảo sát</th>
                <th>Mô tả</th>
                <th>Link</th>
                <th>Hạn chót</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.map((survey) => (
                <tr key={survey._id}>
                  <td>{survey.title}</td>
                  <td>{survey.description}</td>
                  <td>
                    <a href={survey.link} target="_blank" rel="noopener noreferrer">
                      Xem khảo sát
                    </a>
                  </td>
                  <td>{survey.deadline ? new Date(survey.deadline).toLocaleDateString() : ''}</td>
                  <td>{renderStatus(survey.status)}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" href={survey.link} target="_blank">
                      Tham gia
                    </Button>
                    {(role === 'manager' || role === 'admin') && (
                      <>
                        {survey.status !== 'Đã đóng' && survey.status !== 'inactive' && (
                          <Button variant="danger" size="sm" className="me-2" onClick={() => handleCloseSurvey(survey._id)}>
                            Đóng khảo sát
                          </Button>
                        )}
                        <Button variant="outline-danger" size="sm" onClick={() => { setSurveyToDelete(survey); setShowConfirmDelete(true); }}>
                          Xóa
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal xác nhận xóa */}
        <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa khảo sát</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Bạn có chắc chắn muốn xóa khảo sát "<b>{surveyToDelete?.title}</b>" không?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeleteSurvey}>
              Xóa
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default Surveys; 