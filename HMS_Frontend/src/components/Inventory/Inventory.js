import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Table, Modal, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';
import Header from '../Layout/Header';

function Inventory() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInventory, setNewInventory] = useState({
    item: '',
    quantity: '',
    note: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || user?.Role || 'employee';

  // Thêm state cho modal lịch sử
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyItem, setHistoryItem] = useState('');

  // Thêm state cho modal cập nhật
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInventory, setEditInventory] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Thêm state cho modal nhập hàng
  const [showImportModal, setShowImportModal] = useState(false);
  const [importInventory, setImportInventory] = useState({ item: '', quantity: '', note: '' });
  const [importLoading, setImportLoading] = useState(false);

  // Lấy danh sách tồn kho
  const fetchInventories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:9999/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setInventories(res.data.data);
    } catch (err) {
      setError('Lỗi khi lấy danh sách tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
    // eslint-disable-next-line
  }, []);

  // Employee cập nhật tồn kho
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:9999/api/inventory/update', newInventory, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setShowAddForm(false);
        setNewInventory({ item: '', quantity: '', note: '' });
        setSuccess('Cập nhật tồn kho thành công!');
        fetchInventories();
      } else {
        setError('Không thể cập nhật tồn kho');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật tồn kho');
    } finally {
      setLoading(false);
    }
  };

  // Xem lịch sử cập nhật tồn kho
  const handleShowHistory = async (item) => {
    setShowHistoryModal(true);
    setHistoryItem(item);
    setHistoryLoading(true);
    try {
      const res = await axios.get(`http://localhost:9999/api/inventory/history/${encodeURIComponent(item)}`);
      setHistory(res.data);
    } catch (err) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleShowEdit = (inv) => {
    setEditInventory({ ...inv });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:9999/api/inventory/edit/${editInventory._id}`,
        {
          quantity: editInventory.quantity,
          note: editInventory.note
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.data.success) {
        setShowEditModal(false);
        setEditInventory(null);
        setSuccess('Cập nhật thành công!');
        fetchInventories();
      } else {
        setError('Không thể cập nhật tồn kho');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật tồn kho');
    } finally {
      setEditLoading(false);
    }
  };

  const handleShowImport = () => {
    setImportInventory({ item: '', quantity: '', note: '' });
    setShowImportModal(true);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportLoading(true);
    setError('');
    setSuccess('');
    try {
      // ép kiểu quantity về số
      const data = {
        ...importInventory,
        quantity: Number(importInventory.quantity)
      };
      if (!data.item || !data.quantity) {
        setError('Vui lòng nhập tên hàng và số lượng');
        setImportLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:9999/api/inventory/update', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setShowImportModal(false);
        setImportInventory({ item: '', quantity: '', note: '' });
        setSuccess('Nhập hàng thành công!');
        fetchInventories();
      } else {
        setError('Không thể nhập hàng');
      }
    } catch (err) {
      setError('Lỗi khi nhập hàng');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Quản lý kho</h2>
          <div>
            <Button variant="success" className="me-2" onClick={handleShowImport}>
              Nhập hàng
            </Button>
            {role === 'employee' && (
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                Cập nhật tồn kho
              </Button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Modal cập nhật tồn kho */}
        <Modal show={showAddForm} onHide={() => setShowAddForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Cập nhật tồn kho</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tên hàng hóa</Form.Label>
                <Form.Control
                  type="text"
                  value={newInventory.item}
                  onChange={(e) => setNewInventory({ ...newInventory, item: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Số lượng</Form.Label>
                <Form.Control
                  type="number"
                  value={newInventory.quantity}
                  onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                  required
                  min={0}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newInventory.note}
                  onChange={(e) => setNewInventory({ ...newInventory, note: e.target.value })}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowAddForm(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Cập nhật'}
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
                <th>Tên hàng hóa</th>
                <th>Số lượng</th>
                <th>Ghi chú</th>
                <th>Người cập nhật</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {inventories.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.item}</td>
                  <td>
                    <Badge bg={inv.quantity > 0 ? 'success' : 'danger'}>
                      {inv.quantity}
                    </Badge>
                  </td>
                  <td>{inv.note}</td>
                  <td>{inv.updatedBy?.fullname || inv.updatedBy?.username || '---'}</td>
                  <td>{new Date(inv.updatedAt).toLocaleString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() => handleShowEdit(inv)}
                    >
                      Cập nhật
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowHistory(inv.item)}
                    >
                      Xem lịch sử
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal lịch sử cập nhật tồn kho */}
        <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Lịch sử cập nhật: {historyItem}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {historyLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center text-muted">Không có lịch sử cập nhật</div>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Số lượng</th>
                    <th>Ghi chú</th>
                    <th>Người cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h._id}>
                      <td>{new Date(h.updatedAt).toLocaleString()}</td>
                      <td>{h.quantity}</td>
                      <td>{h.note}</td>
                      <td>{h.updatedBy?.fullname || 'Không rõ'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>
        </Modal>

        {/* Modal cập nhật tồn kho */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Cập nhật tồn kho: {editInventory?.item}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editInventory && (
              <Form onSubmit={handleEditSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng</Form.Label>
                  <Form.Control
                    type="number"
                    value={editInventory.quantity}
                    onChange={e => setEditInventory({ ...editInventory, quantity: e.target.value })}
                    required
                    min={0}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editInventory.note}
                    onChange={e => setEditInventory({ ...editInventory, note: e.target.value })}
                  />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                    Hủy
                  </Button>
                  <Button variant="primary" type="submit" disabled={editLoading}>
                    {editLoading ? <Spinner animation="border" size="sm" /> : 'Cập nhật'}
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        {/* Modal nhập hàng */}
        <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Nhập hàng vào kho</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleImportSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Tên hàng hóa</Form.Label>
                <Form.Control
                  type="text"
                  value={importInventory.item}
                  onChange={e => setImportInventory({ ...importInventory, item: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Số lượng</Form.Label>
                <Form.Control
                  type="number"
                  value={importInventory.quantity}
                  onChange={e => setImportInventory({ ...importInventory, quantity: e.target.value })}
                  required
                  min={1}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={importInventory.note}
                  onChange={e => setImportInventory({ ...importInventory, note: e.target.value })}
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowImportModal(false)}>
                  Hủy
                </Button>
                <Button variant="success" type="submit" disabled={importLoading}>
                  {importLoading ? <Spinner animation="border" size="sm" /> : 'Nhập hàng'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}

export default Inventory; 