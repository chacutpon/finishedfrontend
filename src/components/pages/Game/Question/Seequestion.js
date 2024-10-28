import React, { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const SeeQuestion = () => {
  const [questionsData, setQuestionsData] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, "question_players"));
      const questionsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestionsData(questionsArray);
    };

    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    // แสดงกล่องเตือนก่อนลบ
    const confirmDelete = window.confirm("แน่ใจนะว่าจะลบคำถามนี้?");
    if (!confirmDelete) return; // ถ้าไม่ยืนยัน ก็ให้กลับออกไป

    try {
      await deleteDoc(doc(db, "question_players", id));
      setQuestionsData(questionsData.filter(data => data.id !== id));
      alert("ลบคำถามเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#ffcc80", minHeight: "100vh" }}>
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
          
            คำถามจากนักเรียน
          </Typography>
      <Grid container spacing={3}>
        {questionsData.map((data) => (
          <Grid item xs={12} sm={6} md={4} key={data.id}>
            <Card elevation={5} sx={{ borderRadius: 2, boxShadow: 3, backgroundColor: "#fefdd8" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
                  ชื่อ: {data.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, fontSize: "1.2rem", fontWeight: "medium", color: "#555" }}>
                  คำถาม:
                </Typography>
                {data.questions.map((question, index) => (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    sx={{ mb: 1, fontSize: "1.1rem", color: "#666" }} // ให้แต่ละคำถามมีช่องว่างด้านล่าง
                  >
                    - {question}
                  </Typography>
                ))}
                <Stack direction="row" justifyContent="flex-end">
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(data.id)}
                    aria-label="ลบคำถาม"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SeeQuestion;
