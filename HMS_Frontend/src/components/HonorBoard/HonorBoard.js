import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Header from '../Layout/Header';

function HonorBoard() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    employee: ''
  });
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || user?.Role || 'employee';

  // Lấy danh sách bảng vinh danh
  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:9999/api/achievement/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setAchievements(res.data.data);
    } catch (err) {
      setError('Lỗi khi lấy bảng vinh danh');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách nhân viên để chọn khi tạo vinh danh
  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:9999/api/user/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEmployees(res.data.data.filter(emp => emp.Role === 'employee'));
  };

  useEffect(() => {
    fetchAchievements();
    if (role === 'manager') fetchEmployees();
    // eslint-disable-next-line
  }, []);

  // Manager tạo bảng vinh danh
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:9999/api/achievement', newAchievement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setShowAddForm(false);
        setNewAchievement({ title: '', description: '', employee: '' });
        setSuccess('Đăng bảng vinh danh thành công!');
        fetchAchievements();
      } else {
        setError('Không thể đăng bảng vinh danh');
      }
    } catch (err) {
      setError('Lỗi khi đăng bảng vinh danh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Bảng vinh danh</h2>
          {role === 'manager' && (
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Đăng vinh danh
            </Button>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Modal tạo bảng vinh danh */}
        <Modal show={showAddForm} onHide={() => setShowAddForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Đăng bảng vinh danh</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nhân viên được vinh danh</Form.Label>
                <Form.Select
                  value={newAchievement.employee}
                  onChange={(e) => setNewAchievement({ ...newAchievement, employee: e.target.value })}
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullname} - {emp.position}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowAddForm(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Đăng vinh danh'}
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
                <th>Tiêu đề</th>
                <th>Mô tả</th>
                <th>Nhân viên</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((ach) => (
                <tr key={ach._id}>
                  <td>{ach.title}</td>
                  <td>{ach.description}</td>
                  <td>
                    {employees.length > 0
                      ? (employees.find(e => e._id === ach.employee)?.fullname || ach.employee)
                      : ach.employee}
                  </td>
                  <td>{new Date(ach.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
}

export default HonorBoard; 