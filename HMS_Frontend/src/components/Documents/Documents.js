import React, { useState, useEffect } from 'react';
import {
  Container, Card, Button, Form, Row, Col, Table, Badge,
  Pagination, Modal, Spinner, InputGroup
} from 'react-bootstrap';
import { FaSearch, FaDownload, FaUpload, FaTrash, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFile } from 'react-icons/fa';
import axios from 'axios';
import './Documents.css';
import Header from '../Layout/Header';

function Documents() {
  const [allDocuments, setAllDocuments] = useState([]); // Stores all documents from server
  const [documents, setDocuments] = useState([]); // Stores documents for the current page display
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userRole, setUserRole] = useState(null);
  const itemsPerPage = 10;

  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    file: null
  });

  const statusCycle = ['active', 'inactive']; // Updated status cycle

  // Effect for initial data fetch
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user?.role || 'employee');
    fetchAllDocumentsFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllDocumentsFromServer = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      // Assuming the backend API /api/document/all without params returns all documents
      const response = await axios.get(`http://localhost:9999/api/document/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAllDocuments(response.data.data || []);
      } else {
        setError(response.data.message || 'Không thể tải danh sách tài liệu.');
        setAllDocuments([]);
      }
    } catch (err) {
      setError('Không thể tải danh sách tài liệu. Vui lòng thử lại sau.');
      console.error('Lỗi khi tải tài liệu:', err);
      setAllDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to reset page to 1 when search term or filter status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Effect for filtering, searching, and pagination on the client side
  useEffect(() => {
    let baseDocs = [...allDocuments];

    // Pre-filter for employees: only show active documents
    if (userRole === 'employee') {
      baseDocs = baseDocs.filter(doc => doc.status === 'active');
    }

    let processedDocs = baseDocs;

    if (filterStatus !== 'all') {
      processedDocs = processedDocs.filter(doc => doc.status === filterStatus);
    }

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      processedDocs = processedDocs.filter(doc =>
        (doc.title && doc.title.toLowerCase().includes(lowerSearchTerm)) ||
        (doc.content && doc.content.toLowerCase().includes(lowerSearchTerm))
      );
    }

    const newTotalPages = Math.ceil(processedDocs.length / itemsPerPage) || 1;
    setTotalPages(newTotalPages);

    let adjustedCurrentPage = currentPage;
    if (adjustedCurrentPage > newTotalPages) {
      adjustedCurrentPage = newTotalPages;
    }
    if (adjustedCurrentPage < 1) {
        adjustedCurrentPage = 1;
    }

    const startIndex = (adjustedCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDocuments(processedDocs.slice(startIndex, endIndex));

    if (currentPage !== adjustedCurrentPage) {
        setCurrentPage(adjustedCurrentPage);
    }

  }, [allDocuments, searchTerm, filterStatus, currentPage, itemsPerPage, userRole]);


  const hasAdminAccess = () => {
    return ['admin', 'manager'].includes(userRole);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    // The main useEffect will handle re-slicing the documents
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now reactive due to useEffect on searchTerm change.
    // Explicitly setting currentPage to 1 is handled by the other useEffect.
  };

  const handleDownload = (documentId) => {
    if (!documentId) {
      alert('Không có ID tài liệu để tải xuống.');
      return;
    }
    const downloadUrl = `http://localhost:9999/api/document/download/${documentId}`;
    window.open(downloadUrl, '_blank');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', newDocument.title);
      formData.append('content', newDocument.content);
      formData.append('file', newDocument.file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:9999/api/document/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setShowUploadForm(false);
        setNewDocument({ title: '', content: '', file: null });
        fetchAllDocumentsFromServer(); // Re-fetch all documents after successful upload
      } else {
        alert(response.data.error || 'Không thể tải lên tài liệu.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể tải lên tài liệu. Vui lòng thử lại.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      // Assuming you have a delete endpoint like DELETE /api/document/:id
      const response = await axios.delete(`http://localhost:9999/api/document/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        alert("Tài liệu đã được xóa thành công.");
        fetchAllDocumentsFromServer(); // Re-fetch all documents after successful deletion
      } else {
        alert(response.data.message || "Không thể xóa tài liệu.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa tài liệu. Vui lòng thử lại.");
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (documentId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:9999/api/document/status/${documentId}`, 
        { status: newStatus }, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        // No alert needed for quicker cycling, or a more subtle notification could be used.
        // alert("Cập nhật trạng thái tài liệu thành công.");
        fetchAllDocumentsFromServer();
      } else {
        alert(response.data.message || "Không thể cập nhật trạng thái tài liệu.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="text-danger" />;
      case 'docx':
        return <FaFileWord className="text-primary" />;
      case 'xlsx':
        return <FaFileExcel className="text-success" />;
      case 'image':
        return <FaFileImage className="text-info" />;
      default:
        return <FaFile className="text-secondary" />;
    }
  };

  const getStatusBadge = (status, onClickHandler = null) => {
    const style = onClickHandler ? { cursor: 'pointer' } : {};
    switch (status) {
      case 'active':
        return <Badge bg="success" style={style} onClick={onClickHandler}>Hoạt động</Badge>;
      case 'inactive':
        return <Badge bg="warning" style={style} onClick={onClickHandler}>Không hoạt động</Badge>;
      default:
        return <Badge bg="light" text="dark" style={style} onClick={onClickHandler}>{status}</Badge>;
    }
  };

  return (
    <>
      <Header />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Tài liệu</h2>
          {hasAdminAccess() && (
            <Button variant="primary" onClick={() => setShowUploadForm(true)}>
              <FaUpload className="me-2" /> Tải lên tài liệu mới
            </Button>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSearch}>
              <Row className="align-items-end">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Tìm kiếm</Form.Label>
                    <InputGroup>
                      <Form.Control
                        style={{ height: '37.6px' }}
                        type="text"
                        placeholder="Nhập từ khóa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline-secondary" type="submit">
                        <FaSearch />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        <Modal show={showUploadForm} onHide={() => setShowUploadForm(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Tải lên tài liệu mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpload}>
              <Form.Group className="mb-3">
                <Form.Label>Tên tài liệu</Form.Label>
                <Form.Control
                  type="text"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nội dung mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newDocument.content}
                  onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Chọn file</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files[0] })}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowUploadForm(false)}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Tải lên'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {loading && documents.length === 0 ? ( // Show main loader only if no documents are displayed yet
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {documents.length > 0 ? (
              <Table responsive striped bordered hover>
                <thead>
                  <tr>
                    <th>Tên tài liệu</th>
                    <th>Loại file</th>
                    <th>Nội dung</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const handleStatusClick = () => {
                      if (hasAdminAccess()) {
                        const currentIndex = statusCycle.indexOf(doc.status);
                        const nextIndex = (currentIndex + 1) % statusCycle.length;
                        const newStatus = statusCycle[nextIndex];
                        handleUpdateStatus(doc._id, newStatus);
                      }
                    };
                    return (
                      <tr key={doc._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {getFileIcon(doc.fileType)}
                            <span className="ms-2">{doc.title}</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">
                            {doc.fileType?.toUpperCase() || 'N/A'}
                          </Badge>
                        </td>
                        <td>{doc.content}</td>
                        <td>
                          {getStatusBadge(doc.status, hasAdminAccess() ? handleStatusClick : null)}
                        </td>
                        <td>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleDownload(doc._id)}
                          >
                            <FaDownload /> Tải xuống
                          </Button>
                          {hasAdminAccess() && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc._id)}
                            >
                              <FaTrash /> Xóa
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              !error && !loading && <p className="text-center">Không có tài liệu nào khớp với tìm kiếm/bộ lọc của bạn.</p>
            )}

            {totalPages > 1 && (
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} />
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
}

export default Documents; 