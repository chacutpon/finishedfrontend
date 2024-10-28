import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {  Container, Typography, Box, Button, Grid, Paper, IconButton  } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import CampaignIcon from '@mui/icons-material/Campaign';
import FactCheckIcon from '@mui/icons-material/FactCheck';
const Home = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (

    <div
      style={{
        backgroundColor: "#ffcc80",
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
        fontFamily: "Prompt, sans-serif",
      }}
    >

      {/* Header */}
      <Box sx={{ textAlign: "center", marginBottom: 4 }}>
      <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              color: '#000000',
              fontFamily: "'IBM Plex Sans Thai', sans-serif",
              fontWeight: 'bold',
              padding: '20px',
              borderBottom: '5px solid #000000',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 1)',
              backgroundColor: '#fefdd8',
              borderRadius: '30px',
              margin: '20px 0'
            }}
          >
          
            หน้าหลัก
          </Typography>
      </Box>
  
      <Grid container spacing={4} justifyContent="center" sx={{ paddingX: "40px" }}>
        {/* Cards */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: "16px",
              textAlign: "center",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-10px)" },
              backgroundColor: "#fefdd8"
            }}
          >
            <IconButton sx={{ backgroundColor: "#ff0500", color: "#fff", marginBottom: 2 }}>
              <CampaignIcon fontSize="large" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              แนะนำการสร้างกิจกรรม
            </Typography>
            <Box>
              <Link to="/teacher/manage-teacher/introduce" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    padding: "12px",
                    fontSize: "1.2rem",
                    backgroundColor: "#4CAF50",
                    width: "100%",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                  }}
                >
                  ดูคำแนะนำ
                </Button>
              </Link>
            </Box>
          </Paper>
        </Grid>
  
        {/* Card สำหรับนักศึกษาในห้อง */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: "16px",
              textAlign: "center",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-10px)" },
              backgroundColor: "#fefdd8"
            }}
          >
            <IconButton sx={{ backgroundColor: "#fb6b00", color: "#fff", marginBottom: 2 }}>
              <GroupIcon fontSize="large" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              นักศึกษาในห้อง
            </Typography>
            <Box>
              <Link to="/teacher/manage-teacher/points" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    padding: "12px",
                    fontSize: "1.2rem",
                    backgroundColor: "#4CAF50",
                    width: "100%",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                  }}
                >
                  ดูนักศึกษาในห้อง
                </Button>
              </Link>
            </Box>
          </Paper>
        </Grid>
  
        {/* Card สำหรับสร้างกิจกรรม */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: "16px",
              textAlign: "center",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-10px)" },
              backgroundColor: "#fefdd8"
            }}
          >
            <IconButton sx={{ backgroundColor: "#71a4b4", color: "#fff", marginBottom: 2 }}>
              <DashboardIcon fontSize="large" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              สร้างกิจกรรม
            </Typography>
            <Box>
              <Link to="/teacher/create/asking-game" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    padding: "12px",
                    fontSize: "1.2rem",
                    backgroundColor: "#4CAF50",
                    width: "100%",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                  }}
                >
                  กิจกรรมตอบคำถามสั้น
                </Button>
              </Link>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Link to="/teacher/create/group-game" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    padding: "12px",
                    fontSize: "1.2rem",
                    backgroundColor: "#2196F3",
                    width: "100%",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#1976D2",
                    },
                  }}
                >
                  กิจกรรมตอบคำถามแบบกลุ่ม
                </Button>
              </Link>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Link to="/teacher/create/quiz-game" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    padding: "12px",
                    fontSize: "1.2rem",
                    backgroundColor: "#FF9800",
                    width: "100%",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#FB8C00",
                    },
                  }}
                >
                  กิจกรรมควิซ
                </Button>
              </Link>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <Link to="/teacher/create/see-point" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    padding: "12px",
                    fontSize: "1.2rem",
                    backgroundColor: "#ebe806",
                    width: "100%",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#dfdd05",
                    },
                  }}
                >
                  กิจกรรมคำถามท้ายคาบ
                </Button>
              </Link>
            </Box>
          </Paper>
        </Grid>
  
        {/* Card สำหรับคำถามที่เคยสร้าง */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: "16px",
              textAlign: "center",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-10px)" },
              backgroundColor: "#fefdd8"
            }}
          >
            <IconButton sx={{ backgroundColor: "#9C27B0", color: "#fff", marginBottom: 2 }}>
              <FactCheckIcon fontSize="large" />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              ภาพรวมกิจกรรม
            </Typography>
            <Box>
              <Link to="/teacher/manage-teacher/old-question" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "20px",
                    padding: "12px",
                    fontSize: "1.2rem",
                    backgroundColor: "#4CAF50",
                    width: "100%",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#45a049",
                    },
                    
                  }}
                >
                  ดูคำถามของทุก SECTION
                </Button>
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    
    </div>
  );
  
  
};

export default Home;