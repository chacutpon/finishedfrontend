
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, query, where, updateDoc, onSnapshot, arrayUnion, getDocs } from 'firebase/firestore';
import { 
  Container, 
  Typography, 
  Button, 
  TextField, 
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Card,
  CardContent,
  Checkbox,
} from '@mui/material';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; 
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

const GamePlayGroup = () => {
  const location = useLocation();
  const groupGame = location.state?.groupGame;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [groupAnswers, setGroupAnswers] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const playerName = location.state?.name;
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [votes, setVotes] = useState({});
const [hasVoted, setHasVoted] = useState(false);
  const fetchGroupAnswers = () => {
    if (!playerData) {
      console.error("Player data is not available");
      return;
    }
  
    const q = query(
      collection(db, 'group_players'),
      where('pin', '==', groupGame.pin),
      where('groupName', '==', playerData.groupName) // เพิ่มเงื่อนไขนี้
    );
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const answersMap = {};
      let newCurrentQuestionIndex = 0; // สร้างตัวแปรเพื่อเก็บค่า currentQuestionIndex ที่ใหม่
  
      querySnapshot.forEach((doc) => {
        const playerData = doc.data();
  
        if (!playerData) return;
  
        const groupName = playerData.groupName;
  
        if (!answersMap[groupName]) {
            answersMap[groupName] = {};
        }
  
        if (Array.isArray(playerData.answers)) {
            playerData.answers.forEach(answer => {
                const questionIndex = answer.questionIndex;
                const playerAnswer = answer.answer;
  
                if (!answersMap[groupName][questionIndex]) {
                    answersMap[groupName][questionIndex] = [];
                }
  
                const existingAnswer = answersMap[groupName][questionIndex].find(a => a.name === playerData.name);
                if (!existingAnswer) {
                    answersMap[groupName][questionIndex].push({ name: playerData.name, answer: playerAnswer });
                }
            });
        }
  
        // ตรวจสอบค่า currentQuestionIndex ของผู้เล่น
        if (playerData.currentQuestionIndex > newCurrentQuestionIndex) {
            newCurrentQuestionIndex = playerData.currentQuestionIndex; // อัปเดตค่าเป็นค่าใหม่
        }
      });
  
      setGroupAnswers(answersMap);
      setCurrentQuestionIndex(newCurrentQuestionIndex); // อัปเดตสถานะ currentQuestionIndex
    });
  
    return unsubscribe;
  };
  
  useEffect(() => {
    const fetchPlayerData = () => {
      setError(null); // ล้าง error ก่อนทำการโหลดข้อมูล
      const q = query(
        collection(db, 'group_players'),
        where('name', '==', playerName),
        where('pin', '==', groupGame.pin)
      );
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const playerData = querySnapshot.docs[0].data();
          setPlayerData(playerData);
        } else {
          setError('ไม่พบผู้เล่น');
        }
      });
  
      return () => unsubscribe();
    };
  
    fetchPlayerData(); 
  }, [groupGame.pin, playerName]);
  
  
  useEffect(() => {
    if (playerData) { // ตรวจสอบว่า playerData ไม่เป็น null ก่อนเรียกใช้งาน fetchGroupAnswers
      const unsubscribe = fetchGroupAnswers();
      return () => unsubscribe();
    }
  }, [playerData]);

  useEffect(() => {
    setIsSubmitting(false);
    setHasVoted(false);
  }, [currentQuestionIndex]);
  
  
  const handleSubmitAnswer = async () => {
    try {
        if (!playerName || !groupGame || !groupGame.questions) {
            setError('เกิดข้อผิดพลาด: ไม่พบข้อมูลที่จำเป็น');
            return;
        }

        if (!playerData) {
            setError('กำลังโหลดข้อมูลผู้เล่น...');
            return;
        }

        const q = query(
            collection(db, 'group_players'),
            where('name', '==', playerName),
            where('pin', '==', groupGame.pin)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];
            const playerData = playerDoc.data();

            const hasAnswered = Array.isArray(playerData.answers) && playerData.answers.some(answer => answer.questionIndex === currentQuestionIndex);

            if (hasAnswered) {
                setOpenDialog(true);
                return;
            }

            const answeredAt = new Date();

            await updateDoc(playerDoc.ref, {
                answers: arrayUnion({
                    questionIndex: currentQuestionIndex,
                    answeredAt: answeredAt,
                    answer: playerAnswer,
                }),
            });

            // ลบส่วนนี้เพื่อไม่ให้เปลี่ยนไปยังคำถามถัดไปทันที
            // if (currentQuestionIndex < groupGame.questions.length - 1) {
            //     setCurrentQuestionIndex(currentQuestionIndex + 1);
            //     setPlayerAnswer('');
            // } else {
            //     navigate('/user/index');
            // }

            // แค่รีเซ็ต playerAnswer
            setPlayerAnswer('');
        } else {
            setError('เกิดข้อผิดพลาดในการอัปเดตคำตอบ: ไม่พบผู้เล่น');
        }
    } catch (error) {
        setError('เกิดข้อผิดพลาดในการอัปเดตคำตอบ: ' + error.message);
    }
};

const handleNextQuestion = async () => {
  if (!isSubmitting) {
    alert('กรุณาส่งคำตอบที่เลือกก่อนที่จะไปยังคำถามถัดไป');
    return;
  }
  try {
    const q = query(
      collection(db, 'group_players'),
      where('pin', '==', groupGame.pin)
    );

    const querySnapshot = await getDocs(q);
    
    // กรองผู้เล่นที่อยู่ในกลุ่มเดียวกัน
    const groupPlayers = querySnapshot.docs.filter(doc => doc.data().groupName === playerData.groupName);
    const totalPlayers = groupPlayers.length;
    let playersWhoAnswered = 0;

    groupPlayers.forEach((doc) => {
      const playerData = doc.data();
      if (Array.isArray(playerData.answers) && playerData.answers.some(answer => answer.questionIndex === currentQuestionIndex)) {
        playersWhoAnswered++;
      }
    });

    // ตรวจสอบว่าผู้เล่นทุกคนในกลุ่มได้ตอบคำถามนี้แล้วหรือไม่
    if (playersWhoAnswered < totalPlayers) {
      alert('กรุณารอให้ผู้เล่นทุกคนตอบคำถามก่อนที่จะไปยังคำถามถัดไป');
      return;
    }

    // อัปเดต currentQuestionIndex ในฐานข้อมูลเฉพาะกลุ่ม
    const updates = groupPlayers.map((doc) => {
      return updateDoc(doc.ref, {
        currentQuestionIndex: currentQuestionIndex + 1,
      });
    });

    await Promise.allSettled(updates);  // รอให้การอัปเดตทั้งหมดเสร็จสิ้น

    // อัปเดตสถานะใน state เฉพาะสำหรับกลุ่มนี้
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setPlayerAnswer('');
    setHasVoted(false); // รีเซ็ตสถานะโหวตเมื่อเปลี่ยนคำถาม
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการเปลี่ยนคำถาม: ' + error.message);
  }
};



const handleSubmitSelectedAnswers = async () => {
  // ตรวจสอบว่าผู้เล่นได้เลือกคำตอบหรือไม่
  const hasAnswered = Object.keys(selectedAnswers).some(questionIndex => 
    Object.values(selectedAnswers[questionIndex]).some(answer => answer)
  );

  if (!hasAnswered) {
    window.alert('กรุณาเลือกคำตอบก่อนส่ง'); // แจ้งเตือนว่าต้องเลือกคำตอบก่อน
    return;
  }

  try {
    const updates = [];

    for (const questionIndex in selectedAnswers) {
      for (const playerName in selectedAnswers[questionIndex]) {
        if (selectedAnswers[questionIndex][playerName]) {
          const q = query(
            collection(db, 'group_players'),
            where('name', '==', playerName),
            where('pin', '==', groupGame.pin)
          );

          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];

            // ตรวจสอบว่าผู้เล่นตอบคำถามนี้ไปแล้วหรือไม่
            const playerData = playerDoc.data();
            const hasAlreadyAnswered = Array.isArray(playerData.selectedAnswers) &&
              playerData.selectedAnswers.some(answer => answer.questionIndex === parseInt(questionIndex));

            if (hasAlreadyAnswered) {
              window.alert('คุณเลือกข้อนี้ไปแล้ว'); // แจ้งเตือนเมื่อส่งซ้ำ
              return;
            }

            updates.push(
              updateDoc(playerDoc.ref, {
                selectedAnswers: arrayUnion({
                  questionIndex: parseInt(questionIndex),
                  answer: currentGroupAnswers[questionIndex].find(a => a.name === playerName).answer,
                }),
              })
            );
          }
        }
      }
    }

    await Promise.all(updates);  // รอให้การอัปเดตทั้งหมดเสร็จสิ้น
    window.alert('ส่งคำตอบให้อาจารย์สำเร็จ!'); // แจ้งเตือนผู้ใช้
    setSelectedAnswers({}); // เคลียร์คำตอบที่เลือก
    setIsSubmitting(true);
  } catch (error) {
    window.alert('เกิดข้อผิดพลาดในการบันทึกคำตอบ: ' + error.message);
  }
};
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPlayerAnswer(''); // เคลียร์คำตอบหลังจากกดตกลง
    // ไม่ต้องเปลี่ยนคำถามที่นี่
};


const handleVote = async (questionIndex, answerName) => {
  if (hasVoted) {
    alert("คุณได้โหวตไปแล้ว");
    return;
  }
  
  try {
    const q = query(collection(db, 'group_players'), where('groupName', '==', playerData.groupName), where('pin', '==', groupGame.pin));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      if (doc.data().name === answerName) {
        // Get the answer text for the vote
        const answerText = currentGroupAnswers[questionIndex].find(a => a.name === answerName)?.answer;

        updateDoc(doc.ref, { 
          votes: arrayUnion({ questionIndex, answer: answerText, voter: playerName }) 
        });
      }
    });
    
    setHasVoted(true);
    alert("โหวตสำเร็จ!");
  } catch (error) {
    console.error("Error voting:", error);
  }
};

useEffect(() => {
  if (playerData && playerData.leader === playerName) {
    const votesRef = query(
      collection(db, 'group_players'),
      where('groupName', '==', playerData.groupName),
      where('pin', '==', groupGame.pin)
    );

    const unsubscribe = onSnapshot(votesRef, (querySnapshot) => {
      const votesData = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.votes) {
          data.votes.forEach((vote) => {
            const { questionIndex, answer } = vote;
            if (!votesData[questionIndex]) votesData[questionIndex] = {};
            if (!votesData[questionIndex][answer]) votesData[questionIndex][answer] = 0;
            votesData[questionIndex][answer]++; // นับจำนวนโหวตตามคำตอบ
          });
        }
      });

      setVotes(votesData);
    });

    return () => unsubscribe();
  }
}, [playerData, playerName]);


if (!playerData) return <div>กำลังโหลดข้อมูล...</div>; 
const currentGroupAnswers = groupAnswers[playerData.groupName] || {};



return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container  sx={{ width: '100%', maxWidth: '1200px', mt: 4 }}>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>แจ้งเตือน</DialogTitle>
          <DialogContent>
            <DialogContentText>คุณได้ตอบคำถามนี้ไปแล้ว</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">ตกลง</Button>
          </DialogActions>
        </Dialog>
  
        <Paper elevation={4} sx={{ p: 3, mb: 2, borderRadius: 3, backgroundColor: '#ffffff' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            คำถามที่ {currentQuestionIndex + 1}
          </Typography>

          {/* แสดงชื่อกลุ่มและหัวหน้ากลุ่ม */}
          <Typography variant="body1" sx={{ mb: 1, color: '#555' }}>
            ชื่อกลุ่ม: {playerData.groupName || 'ไม่พบชื่อกลุ่ม'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
            ชื่อผู้ใช้: {playerData.name || 'ไม่พบชื่อผู้เล่น'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
            หัวหน้ากลุ่ม: {playerData.leader || 'ไม่พบหัวหน้ากลุ่ม'}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
            {groupGame?.questions[currentQuestionIndex]?.questionText || 'ไม่พบคำถาม'}
          </Typography>
          
          <TextField
            label="พิมพ์คำตอบของคุณที่นี่"
            variant="outlined"
            value={playerAnswer}
            onChange={(event) => setPlayerAnswer(event.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              style: { backgroundColor: '#f5f5f5' },
            }}
          />

          {/* ปุ่มส่ง */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitAnswer}
            sx={{ mt: 2, width: '100%' }}
            disabled={playerAnswer === ''}
          >
            ส่ง
          </Button>

          {/* ปุ่มข้อถัดไปที่จะแสดงเฉพาะหัวหน้ากลุ่ม */}
         {/* ปุ่มข้อถัดไปที่จะแสดงเฉพาะหัวหน้ากลุ่ม */}
{playerData.leader === playerName && currentQuestionIndex < groupGame.questions.length - 1 && (
  <Button
    variant="contained"
    color="secondary"
    onClick={handleNextQuestion}
    sx={{ mt: 2, width: '100%' }}
  >
    ข้อถัดไป
  </Button>
)}
        </Paper>
  
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
  
        <Paper elevation={4} sx={{ p: 3, mb: 2, borderRadius: 3, backgroundColor: '#ffffff' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
            คำตอบของกลุ่ม
          </Typography>
          {Object.keys(currentGroupAnswers).length > 0 ? (
            Object.keys(currentGroupAnswers).map((questionIndex) => (
              <div key={questionIndex} style={{ marginBottom: '1em' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                  ข้อ {parseInt(questionIndex) + 1}:  {groupGame?.questions[currentQuestionIndex]?.questionText || 'ไม่พบคำถาม'}
                </Typography>
                {Array.isArray(currentGroupAnswers[questionIndex]) && currentGroupAnswers[questionIndex].map((answer, index) => (
                  <Typography key={index} variant="body2" sx={{ color: '#666' }}>
                    {answer.name}: <span style={{ fontWeight: 'normal' }}>{answer.answer}</span>
                  </Typography>
                ))}
              </div>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#999' }}>ยังไม่มีคำตอบจากกลุ่ม</Typography>
          )}
        </Paper>
      

<Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>คำตอบของสมาชิก</Typography>

{currentGroupAnswers[currentQuestionIndex]?.map((answer) => (
  <Paper key={answer.name} sx={{ p: 2, mb: 2, border: '1px solid #ddd', borderRadius: 2, backgroundColor: '#fafafa' }}>
    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
      {answer.name}: {answer.answer}
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={() => handleVote(currentQuestionIndex, answer.name)}
      sx={{ mt: 1 }}
    >
      <CheckCircleIcon sx={{ mr: 1 }} /> {/* Replace with your actual vote icon */}
      โหวต
    </Button>
  </Paper>
))}


        
{playerData.leader === playerName && (
  <Paper elevation={4} sx={{ p: 3, mb: 2, borderRadius: 3, backgroundColor: '#ffffff' }}>
    <Typography variant="h6" sx={{ mb: 2 }}>ผลโหวต</Typography>
    {Object.keys(votes).length > 0 ? (
      Object.keys(votes).map((questionIndex) => (
        <div key={questionIndex} style={{ marginBottom: '1em' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
            คำถาม {parseInt(questionIndex) + 1}:  {groupGame?.questions[currentQuestionIndex]?.questionText || 'ไม่พบคำถาม'}           
          </Typography>
          {Object.keys(votes[questionIndex]).map((answer) => ( // เปลี่ยน answerName เป็น answer
            <Typography key={answer} variant="body2" sx={{ color: '#666' }}>
              คำตอบ: {answer} - {votes[questionIndex][answer]} โหวต
            </Typography>
          ))}
          
        </div>
      ))
    ) : (
      <Typography variant="body2" sx={{ color: '#999' }}>ยังไม่มีการโหวต</Typography>
    )}
  </Paper>
)}




      
{playerData.leader === playerName && (
  <Paper elevation={4} sx={{ p: 3, mb: 2, borderRadius: 3, backgroundColor: '#f5f5f5' }}>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>เลือกคำตอบของสมาชิก</Typography>
    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
      ข้อ {currentQuestionIndex + 1}:  {groupGame?.questions[currentQuestionIndex]?.questionText || 'ไม่พบคำถาม'}
    </Typography>
    {currentGroupAnswers[currentQuestionIndex]?.map((answer) => (
      <Card key={answer.name} sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 1, border: '1px solid #ccc', borderRadius: 2, transition: '0.3s', '&:hover': { boxShadow: 3 } }}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{answer.name}: {answer.answer}</Typography>
        </CardContent>
        <Checkbox
          checked={!!selectedAnswers[currentQuestionIndex]?.[answer.name]}
          onChange={() => {
            setSelectedAnswers((prev) => ({
              ...prev,
              [currentQuestionIndex]: {
                ...prev[currentQuestionIndex],
                [answer.name]: !prev[currentQuestionIndex]?.[answer.name],
              },
            }));
          }}
          color="primary"
        />
      </Card>
    ))}
    <Button
      variant="contained"
      color="primary"
      onClick={handleSubmitSelectedAnswers}
      sx={{ mt: 2 }}
    >
      ส่งคำตอบที่เลือก
    </Button>
  </Paper>
)}






      </Container>
    </ThemeProvider>
  );
};

export default GamePlayGroup;
