import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, query, where, updateDoc, getDocs, increment, arrayUnion } from 'firebase/firestore';
import { 
  Container, 
  Typography, 
  Button, 
  TextField,
  CircularProgress, 
  Box, 
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  Paper,
  LinearProgress
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#6c757d',
    },
  },
});

const GamePlayAsking = () => {
  const location = useLocation();
  const askingGame = location.state?.askingGame; 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState(''); // เปลี่ยนจาก selectedAnswer เป็น playerAnswer
  const [score, setScore] = useState(0);  
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog popup
  const playerName = location.state?.name;
  const [timeLeft, setTimeLeft] = useState(15); 
  const [timeInterval, setTimeInterval] = useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); 

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => (prevTimeLeft > 0 ? prevTimeLeft - 1 : 0));
    }, 1000);
    setTimeInterval(interval);

    if (timeLeft === 0) {
      handleNextQuestion(); 
    }

    return () => clearInterval(interval); 
  }, [timeLeft]);

  const handleNextQuestion = async () => {
    clearInterval(timeInterval);

    if (!playerName) { 
        setError('เกิดข้อผิดพลาด: ไม่พบชื่อผู้เล่น');
        return; 
    }

    const q = query(
        collection(db, 'asking_players'), 
        where('name', '==', playerName), 
        where('pin', '==', askingGame.pin)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const playerDoc = querySnapshot.docs[0];
        const playerData = playerDoc.data();

        // ตรวจสอบการตอบคำถาม
        const hasAnswered = playerData.answers?.some(answer => answer.questionIndex === currentQuestionIndex);
        if (hasAnswered) {
            setOpenDialog(true); 
            return;
        }

        const answeredAt = new Date();
        let isCorrect = false;

        // ตรวจสอบคำตอบ
        if (playerAnswer && askingGame.questions && currentQuestionIndex < askingGame.questions.length) {
            const currentQuestion = askingGame.questions[currentQuestionIndex];
            const correctAnswers = currentQuestion.correctAnswers;

            const normalizedPlayerAnswer = playerAnswer.trim().toLowerCase().replace(/\s+/g, '');
            const normalizedCorrectAnswers = correctAnswers.map(answer => answer.trim().toLowerCase().replace(/\s+/g, ''));
            isCorrect = normalizedCorrectAnswers.includes(normalizedPlayerAnswer);
        } 

        // อัปเดตคะแนน
        await updateDoc(playerDoc.ref, {
            answers: arrayUnion({ 
                questionIndex: currentQuestionIndex,
                answeredAt: answeredAt,
                isCorrect 
            }),
            score: increment(isCorrect ? 1 : 0)
        });

        if (isCorrect) {
            setScore(score + 1); 
        }
    } else {
        setError('เกิดข้อผิดพลาดในการอัปเดตคะแนน: ไม่พบผู้เล่น'); 
    }
    
    if (currentQuestionIndex < askingGame.questions.length - 1) { 
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setPlayerAnswer(''); // เคลียร์คำตอบผู้เล่น
      setTimeLeft(15); 
    } else {
      navigate('/user/index'); 
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // ปิด dialog popup
    if (currentQuestionIndex < askingGame.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // ย้ายไปยังคำถามถัดไป
      setPlayerAnswer(''); 
      setTimeLeft(15); 
    } else {
      navigate('/user/index'); // ถ้าเป็นคำถามสุดท้ายให้ไปยังหน้าถัดไป
    }
  };

  if (!askingGame) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    ); 
  }

  const currentQuestion = askingGame?.questions?.[currentQuestionIndex];

  return (
    <ThemeProvider theme={theme}> 
      <CssBaseline /> 
      <Container maxWidth="sm" sx={{ mt: 4 }}> 
        {/* Dialog Popup */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>แจ้งเตือน</DialogTitle>
          <DialogContent>
            <DialogContentText>คุณได้ตอบคำถามนี้ไปแล้ว</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">ตกลง</Button>
          </DialogActions>
        </Dialog>

        <Paper elevation={3} sx={{ p: 3, mb: 2, borderRadius: 3 }}> 
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              เวลาที่เหลือ: {timeLeft} วินาที
            </Typography> 
            <LinearProgress variant="determinate" value={(timeLeft / 15) * 100} />
          </Box>
          <Typography variant="h5" component="div" sx={{ mb: 2, fontWeight: 'bold' }}> 
            คำถามที่ {currentQuestionIndex + 1}
          </Typography>
          <Typography variant="body1" component="div" sx={{ mb: 2 }}>
            {currentQuestion?.questionText}
          </Typography>
          <TextField
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)} // อัปเดตคำตอบผู้เล่น
            label="พิมพ์คำตอบของคุณที่นี่"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNextQuestion} 
            sx={{ mt: 2, width: '100%' }}
            disabled={playerAnswer.trim() === ''} // ปิดปุ่มถ้าคำตอบว่าง
          >
            ถัดไป
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default GamePlayAsking;
