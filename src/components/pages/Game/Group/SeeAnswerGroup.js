import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const SeeAnswerGroup = () => {
  const [answers, setAnswers] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({}); // เพิ่ม state สำหรับ selectedAnswers
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const pin = location.state?.pin;

  useEffect(() => {
    const fetchAnswersAndQuestions = async () => {
      try {
        // ดึงคำถามจาก Firestore
        const questionsSnapshot = await getDocs(query(collection(db, 'group_games'), where('pin', '==', pin)));
        const questionData = questionsSnapshot.docs[0]?.data().questions || [];
        setQuestions(questionData);

        const q = query(collection(db, 'group_players'), where('pin', '==', pin));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const groupedAnswers = {};
          const groupedSelectedAnswers = {}; // สำหรับจัดกลุ่ม selectedAnswers
          querySnapshot.forEach((doc) => {
            const playerData = doc.data();
            const groupName = playerData.groupName || 'ไม่มีชื่อกลุ่ม';

            if (!groupedAnswers[groupName]) {
              groupedAnswers[groupName] = {};
              groupedSelectedAnswers[groupName] = {}; // เริ่มต้น groupedSelectedAnswers
            }

            // จัดการ answers
            if (Array.isArray(playerData.answers)) {
              playerData.answers.forEach(answer => {
                if (!groupedAnswers[groupName][answer.questionIndex]) {
                  groupedAnswers[groupName][answer.questionIndex] = [];
                }
                groupedAnswers[groupName][answer.questionIndex].push({
                  name: playerData.name,
                  answer: answer.answer,
                  answeredAt: answer.answeredAt
                });
              });
            }

            // จัดการ selectedAnswers
            if (Array.isArray(playerData.selectedAnswers)) {
              playerData.selectedAnswers.forEach(selectedAnswer => {
                if (!groupedSelectedAnswers[groupName][selectedAnswer.questionIndex]) {
                  groupedSelectedAnswers[groupName][selectedAnswer.questionIndex] = [];
                }
                groupedSelectedAnswers[groupName][selectedAnswer.questionIndex].push({
                  name: playerData.name,
                  answer: selectedAnswer.answer,
                });
              });
            }
          });

          setAnswers(groupedAnswers);
          setSelectedAnswers(groupedSelectedAnswers); // อัปเดต selectedAnswers
          setLoading(false);
        }, (error) => {
          console.error('Error fetching answers:', error);
          setError('เกิดข้อผิดพลาดในการดึงคำตอบ');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching answers and questions:', error);
        setError('เกิดข้อผิดพลาดในการดึงคำตอบและคำถาม');
        setLoading(false);
      }
    };

    fetchAnswersAndQuestions();
  }, [pin]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <div
    style={{
      backgroundColor: "#ffcc80",
      width: "100vw",
      minHeight: "100vh",
   
    }}
  >
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        คำตอบของผู้เล่นในกลุ่ม
      </Typography>
      {Object.keys(answers).length > 0 ? (
        Object.keys(answers).map((groupName) => (
          <Box key={groupName} sx={{ mb: 5, border: '4px solid #000000', borderRadius: 2, p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#000000' }}>
              กลุ่ม: {groupName}
            </Typography>
            {Object.keys(answers[groupName]).sort((a, b) => a - b).map((questionIndex) => (
              <Box key={questionIndex} sx={{ mb: 3, border: '2px solid #000000', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  คำถามที่ {parseInt(questionIndex) + 1}: {questions[questionIndex]?.questionText || 'ไม่มีข้อมูลคำถาม'}
                </Typography>
  
                {/* แสดงเฉพาะคำตอบที่หัวหน้ากลุ่มเลือก */}
         
                {Array.isArray(selectedAnswers[groupName][questionIndex]) && selectedAnswers[groupName][questionIndex].length > 0 ? (
                  selectedAnswers[groupName][questionIndex].map((item, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 ,backgroundColor: "#ffcc80"}}>
                      <Typography variant="body1">{item.name}</Typography>
                      <Typography variant="body1">คำตอบที่เลือก: {item.answer}</Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body1">ไม่มีข้อมูลคำตอบที่เลือกสำหรับคำถามนี้</Typography>
                )}
              </Box>
            ))}
          </Box>
        ))
      ) : (
        <Typography variant="body1">ยังไม่มีคำตอบจากผู้เล่นในกลุ่มนี้</Typography>
      )}
      <Button
        component={Link}
        to="/teacher/index"
        variant="contained"
        color="error"
        sx={{
          borderRadius: '20px',
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
          textTransform: 'none',
        }}
      >
        กลับ
      </Button>
    </Box>
    </div>
  );
  


};

export default SeeAnswerGroup;
