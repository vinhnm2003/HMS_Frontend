import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import Header from '../Layout/Header';
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchEmployees, setBranchEmployees] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    branch: '',
    assignedTo: [],
    position: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || user?.Role || 'employee';
  const userId = user?._id || user?.id;

  // Lấy danh sách task
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:9999/api/task/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setTasks(res.data.data);
    } catch (err) {
      setError('Lỗi khi lấy danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách nhân viên
  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:9999/api/user/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEmployees(res.data.data.filter(emp => emp.Role === 'employee'));
  };

  // Lấy danh sách branch khi mở form
  const fetchBranches = async () => {
    const res = await axios.get('http://localhost:9999/api/branch');
    setBranches(res.data);
  };

  // Lấy danh sách nhân viên theo branch
  const fetchBranchEmployees = async (branch) => {
    if (!branch) {
      setBranchEmployees([]);
      return;
    }
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://localhost:9999/api/user/by-branch/${branch}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBranchEmployees(res.data.filter(emp => emp.Role === 'employee'));
  };

  useEffect(() => {
    fetchTasks();
    if (role === 'manager') fetchEmployees();
  }, []);

  // Khi mở form tạo task, lấy danh sách branch
  useEffect(() => {
    if (showCreateForm) fetchBranches();
    if (!showCreateForm) {
      setSelectedBranch('');
      setBranchEmployees([]);
    }
  }, [showCreateForm]);

  // Tạo task mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:9999/api/task/create', newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setShowCreateForm(false);
        setNewTask({ title: '', description: '', branch: '', assignedTo: [], position: '' });
        setSuccess('Tạo công việc thành công!');
        fetchTasks();
      } else {
        setError('Không thể tạo công việc');
      }
    } catch (err) {
      setError('Lỗi khi tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  // Employee đánh dấu hoàn thành
  const handleComplete = async (taskId) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:9999/api/task/${taskId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSuccess('Đã hoàn thành công việc!');
        fetchTasks();
      } else {
        setError('Không thể hoàn thành công việc');
      }
    } catch (err) {
      setError('Lỗi khi hoàn thành công việc');
    } finally {
      setLoading(false);
    }
  };

  // Lọc task cho employee: chỉ hiển thị task được giao cho mình
  const filteredTasks = role === 'employee'
    ? tasks.filter(task =>
        (task.assignedTo && task.assignedTo.includes(userId)) ||
        (task.position && task.position === user.position)
      )
    : role === 'manager'
      ? tasks.filter(task => task.createdBy === userId)
      : tasks;

  // Khi chọn branch trong form tạo task
  const handleBranchChange = async (e) => {
    const branch = e.target.value;
    setSelectedBranch(branch);
    setNewTask({ ...newTask, branch, assignedTo: [], position: '' }); // reset assignedTo, position khi đổi branch
    await fetchBranchEmployees(branch);
  };

  // Khi chọn nhân viên trong branch
  const handleAssignToChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setNewTask({ ...newTask, assignedTo: selected, position: '' });
  };

  // Khi chọn giao cho vị trí
  const handlePositionChange = (e) => {
    setNewTask({ ...newTask, position: e.target.value, assignedTo: [] });
  };

  return (
    <>
      <Header />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Công việc</h2>
          {role === 'manager' && (
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              Tạo công việc mới
            </Button>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Modal tạo task */}
        <Modal show={showCreateForm} onHide={() => setShowCreateForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Tạo công việc mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </Form.Group>
              {/* Giao cho vị trí */}
              <Form.Group className="mb-3">
                <Form.Label>Giao cho vị trí</Form.Label>
                <Form.Select
                  value={newTask.position || ''}
                  onChange={handlePositionChange}
                >
                  <option value="">-- Không chọn --</option>
                  <option value="Barista">Barista</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Cashier">Cashier</option>
                </Form.Select>
              </Form.Group>
              {/* Chọn branch để giao cho nhân viên cụ thể */}
              <Form.Group className="mb-3">
                <Form.Label>Chi nhánh</Form.Label>
                <Form.Select value={selectedBranch} onChange={handleBranchChange}>
                  <option value="">-- Chọn chi nhánh --</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              {/* Giao cho nhân viên cụ thể theo branch */}
              {selectedBranch && (
                <Form.Group className="mb-3">
                  <Form.Label>Giao cho nhân viên</Form.Label>
                  <Form.Select
                    multiple
                    value={newTask.assignedTo}
                    onChange={handleAssignToChange}
                    disabled={!!newTask.position}
                  >
                    {branchEmployees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullname} - {emp.position}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowCreateForm(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Tạo công việc'}
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
                <th>Chi nhánh</th>
                <th>Giao cho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.branch}</td>
                  <td>
                    {task.position
                      ? <Badge bg="info">{task.position}</Badge>
                      : (task.assignedTo && task.assignedTo.length > 0
                          ? task.assignedTo.map(id => {
                              const emp = employees.find(e => e._id === id);
                              return emp ? (
                                <Badge key={id} bg="info" className="me-1">{emp.fullname} - {emp.position}</Badge>
                              ) : null;
                            })
                          : <span className="text-muted">Chưa giao</span>
                        )
                    }
                  </td>
                  <td>
                    <Badge bg={task.status === 'completed' ? 'success' : 'warning'}>
                      {task.status === 'completed' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                    </Badge>
                  </td>
                  <td>
                    {role === 'employee' && task.status === 'pending' &&
                      ((task.assignedTo && task.assignedTo.includes(userId)) ||
                       (task.position && task.position === user.position)) && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleComplete(task._id)}
                        >
                          Đánh dấu hoàn thành
                        </Button>
                      )}
                    {role === 'manager' && (
                      <span className="text-muted">Quản lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
}

export default Tasks; 