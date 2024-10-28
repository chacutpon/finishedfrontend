import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import moment from 'moment';
import 'moment/locale/th';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Avatar,
  Chip,
  Stack,
  Divider,
} from '@mui/material';

const SeePointAsking = () => {
  const location = useLocation();
  const pin = location.state?.pin;
  const askingGame = location.state?.askingGame;
  const [players, setPlayers] = useState([]);
  const [topScorer, setTopScorer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (pin) { 
      const unsubscribe = onSnapshot(
        query(collection(db, 'asking_players'), where('pin', '==', pin)),
        (snapshot) => {
          const playersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPlayers(playersData);

          const scoreMap = playersData.map(player => {
            const totalScore = player.answers?.reduce((acc, answer) => acc + (answer.isCorrect ? 1 : 0), 0) || 0;
            const firstAnsweredAt = player.answers?.reduce((earliest, answer) => {
              return earliest && answer.answeredAt.toDate() < earliest ? answer.answeredAt.toDate() : earliest;
            }, null);
            return { ...player, totalScore, firstAnsweredAt };
          });

          const maxScore = Math.max(...scoreMap.map(score => score.totalScore));
          const topScorers = scoreMap.filter(player => player.totalScore === maxScore);

          let topScorer = topScorers[0];
          if (topScorers.length > 1) {
            topScorer = topScorers.reduce((prev, current) => {
              return (prev.firstAnsweredAt < current.firstAnsweredAt) ? prev : current;
            });
          }

          setTopScorer(topScorer);
        }
      );

      return () => unsubscribe();
    }
  }, [pin]);

  function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  const handleNext = () => {
    if (currentQuestionIndex < askingGame.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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
    <Container maxWidth="md" sx={{ mt: 4, bgcolor: '#f9f9f9', borderRadius: '8px', padding: '16px' }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif', color: '#1976d2' }}>
        คะแนนผู้เล่น Asking Game
      </Typography>
  
      {topScorer && (
        <Card sx={{ mb: 4, boxShadow: 3, bgcolor: '#e3f2fd', borderRadius: '8px' }}> 
          <CardContent>
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>
              ผู้เล่นที่ทำคะแนนสูงสุด: {topScorer.name} 
              <Chip label={`คะแนน: ${topScorer.totalScore}`} color="primary" sx={{ ml: 1 }} />
            </Typography>
          </CardContent>
        </Card>
      )}
  
      {askingGame?.questions && (
        <div>
          <Typography variant="h5" sx={{ color: '#1976d2', fontFamily: 'Sarabun, sans-serif', mb: 2 }}>
            ข้อที่ {currentQuestionIndex + 1}: {askingGame.questions[currentQuestionIndex].questionText}
          </Typography>
  
          <TableContainer component={Paper} elevation={3} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>ผู้เล่น</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>เวลาที่ตอบ</Typography></TableCell>
                  <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Sarabun, sans-serif' }}>คะแนน</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players
                  .map((player) => {
                    const answer = player.answers?.find(a => a.questionIndex === currentQuestionIndex);
                    return answer ? { ...player, answer } : null;
                  })
                  .filter(player => player !== null)
                  .sort((a, b) => a.answer.answeredAt.toDate() - b.answer.answeredAt.toDate())
                  .map((player) => (
                    <TableRow key={player.id}>
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 1, bgcolor: stringToColor(player.name) }}>{player.name.charAt(0).toUpperCase()}</Avatar>
                          <Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>{player.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right"><Typography variant="body1" sx={{ fontFamily: 'Sarabun, sans-serif' }}>{moment(player.answer.answeredAt.toDate()).format('HH:mm:ss')}</Typography></TableCell>
                      <TableCell align="center">
                        {player.answer.isCorrect ? (
                          <Chip label="ถูกต้อง +1 คะแนน" color="success" sx={{ fontFamily: 'Sarabun, sans-serif' }} />
                        ) : (
                          <Chip label="ผิด +0 คะแนน" color="error" sx={{ fontFamily: 'Sarabun, sans-serif' }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
  
          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Button onClick={handlePrev} disabled={currentQuestionIndex === 0} variant="outlined" color="primary">
              ข้อก่อนหน้า
            </Button>
            <Button onClick={handleNext} disabled={currentQuestionIndex === askingGame.questions.length - 1} variant="outlined" color="primary">
              ข้อถัดไป
            </Button>
          </Stack>
        </div>
      )}
  
      <Divider sx={{ my: 3 }} />
  
      <Button
        component={Link} 
        to="/teacher/index" 
        variant="contained"
        color="error" 
        sx={{ 
          borderRadius: '20px', 
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)', 
          textTransform: 'none', 
          width: '100%',
          marginTop: '16px',
          padding: '10px 0',
        }} 
      >
        กลับสู่หน้าหลัก
      </Button>
    </Container>
    </div>
  );
}

export default SeePointAsking;
