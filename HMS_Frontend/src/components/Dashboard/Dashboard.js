import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Container, Spinner } from 'react-bootstrap';
import './Dashboard.css';
import Header from '../Layout/Header';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

function Dashboard() {
  const [employeeStats, setEmployeeStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState([]);
  const [surveyStats, setSurveyStats] = useState([]);
  const [employeeByMonth, setEmployeeByMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coffeeHistory, setCoffeeHistory] = useState([]);

  const surveyPieData = {
    labels: surveyStats?.map(s => s._id),
    datasets: [{
      data: surveyStats?.map(s => s.count),
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
    }]
  };

  const branchBarData = {
    labels: employeeStats?.byBranch?.map(b => b._id),
    datasets: [{
      label: 'Số lượng',
      data: employeeStats?.byBranch?.map(b => b.count),
      backgroundColor: '#36A2EB'
    }]
  };

  const positionBarData = {
    labels: employeeStats?.byPosition?.map(p => p._id),
    datasets: [{
      label: 'Số lượng',
      data: employeeStats?.byPosition?.map(p => p.count),
      backgroundColor: '#FF6384'
    }]
  };

  const monthLineData = {
    labels: employeeByMonth?.map(m => `Tháng ${m._id}`),
    datasets: [{
      label: 'Nhân viên mới',
      data: employeeByMonth?.map(m => m.count),
      fill: false,
      borderColor: '#4BC0C0',
      tension: 0.1
    }]
  };

  const inventoryBarData = {
    labels: inventoryStats?.map(i => i._id),
    datasets: [{
      label: 'Số lượng',
      data: inventoryStats?.map(i => i.quantity),
      backgroundColor: '#FFCE56'
    }]
  };

  const coffeeLineData = {
    labels: coffeeHistory.map(h => new Date(h.updatedAt).toLocaleDateString()),
    datasets: [{
      label: 'Cà phê',
      data: coffeeHistory.map(h => h.quantity),
      fill: false,
      borderColor: '#FF6384',
      tension: 0.1
    }]
  };

  const cumulativeEmployeeData = (() => {
    let total = 0;
    return {
      labels: employeeByMonth.map(m => `Tháng ${m._id}`),
      datasets: [{
        label: 'Tổng nhân viên',
        data: employeeByMonth.map(m => (total += m.count)),
        fill: false,
        borderColor: '#36A2EB',
        tension: 0.1
      }]
    };
  })();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [
          empRes,
          invRes,
          surRes,
          empMonthRes
        ] = await Promise.all([
          axios.get('http://localhost:9999/api/admin/employee-stats'),
          axios.get('http://localhost:9999/api/admin/inventory-stats'),
          axios.get('http://localhost:9999/api/admin/survey-stats'),
          axios.get('http://localhost:9999/api/admin/employee-by-month')
        ]);
        setEmployeeStats(empRes.data);
        setInventoryStats(invRes.data);
        setSurveyStats(surRes.data);
        setEmployeeByMonth(empMonthRes.data);
      } catch (err) {
        // Xử lý lỗi nếu cần
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    axios.get('http://localhost:9999/api/inventory/history/Cà phê')
      .then(res => setCoffeeHistory(res.data));
  }, []);

  return (
    <>
    <Header/>
    <Container>
      <h2 className="mb-4">Dashboard</h2>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>Khảo sát theo trạng thái</Card.Title>
                  <Pie data={surveyPieData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>Nhân viên theo chi nhánh</Card.Title>
                  <Bar data={branchBarData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>Nhân viên theo vị trí</Card.Title>
                  <Bar data={positionBarData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>Nhân viên mới theo tháng</Card.Title>
                  <Line data={monthLineData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={12}>
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>Tồn kho mới nhất</Card.Title>
                  <Bar data={inventoryBarData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>Lịch sử tồn kho: Cà phê</Card.Title>
                  <Line data={coffeeLineData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={12}>
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>Tổng nhân viên tích lũy theo tháng</Card.Title>
                  <Line data={cumulativeEmployeeData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
    </>
  );
}

export default Dashboard; 