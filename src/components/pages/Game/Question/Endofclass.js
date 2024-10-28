import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { useLocation } from "react-router-dom";

const EndOfClass = () => {
  const [questions, setQuestions] = useState([""]);
  const location = useLocation();
  const { pin, name } = location.state; // รับข้อมูลจาก state
  const [playerDocId, setPlayerDocId] = useState(null);

  useEffect(() => {
    const fetchPlayerDocId = async () => {
      const q = query(collection(db, "question_players"), where("pin", "==", pin), where("name", "==", name));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        setPlayerDocId(docData.id);
        setQuestions(docData.data().questions || [""]); // โหลดคำถามที่มีอยู่
      } else {
        alert("ไม่พบเอกสารผู้เล่น");
      }
    };
    fetchPlayerDocId();
  }, [pin, name]);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestionField = () => {
    setQuestions([...questions, ""]);
  };

  const handleSubmit = async () => {
    try {
      if (playerDocId) {
        await updateDoc(doc(db, "question_players", playerDocId), {
          questions: questions,
        });
        alert("ส่งคำถามเรียบร้อยแล้ว!");
        // ล้างคำถาม
        setQuestions([""]);
        // นำทางไปหน้าที่ต้องการหลังจากส่งคำถาม (ถ้าต้องการ)
      }
    } catch (error) {
      console.error("Error sending questions:", error);
    }
  };

  return (
    <Card
      elevation={6}
      sx={{
        p: 4,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
      }}
    >
      <CardContent>
        <Typography variant="h4" align="center" gutterBottom>
          คำถามท้ายคาบ
        </Typography>
        <Grid container spacing={3}>
          {questions.map((question, index) => (
            <Grid item xs={12} key={index}>
              <TextField
                label={`คำถามที่ ${index + 1}`}
                fullWidth
                value={question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                variant="outlined"
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="outlined" fullWidth onClick={addQuestionField}>
              เพิ่มคำถาม
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
            >
              ส่งคำถาม
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EndOfClass;
