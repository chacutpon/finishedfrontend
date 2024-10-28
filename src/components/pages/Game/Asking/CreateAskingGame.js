import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box,Select, MenuItem, FormControl, InputLabel, Card, CardContent, Container, AccordionDetails, List, ListItem, ListItemText, Stack, Avatar, ListItemButton, Accordion, AccordionSummary  } from "@mui/material";
import { Link, useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import { db } from "../../../firebase"; // Adjust the path as needed
import { collection, addDoc, onSnapshot, setDoc, doc, deleteDoc } from "firebase/firestore";
import moment from "moment";
import "moment/locale/th";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment"; 
import AddIcon from "@mui/icons-material/Add"; 
import VisibilityIcon from "@mui/icons-material/Visibility";

const CreateAskingGame = () => {
  const [storyTH, setStoryTH] = useState("");
  const [section, setSection] = useState(""); // เพิ่ม state สำหรับ section
  const [pin, setPin] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [askingGames, setAskingGames] = useState([]);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      correctAnswers: [],
    },
  ]);
  const askingGamesCollection = collection(db, "asking_games");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(askingGamesCollection, (snapshot) => {
      const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAskingGames(games); // ตั้งค่าให้แสดงกิจกรรมที่เคยสร้าง
    });

    return () => unsubscribe();
  }, []);

  const handleStoryTHChange = (text) => {
    setStoryTH(text);
  };

  const handleSectionChange = (event) => {
    setSection(event.target.value); // อัปเดต section เมื่อมีการเลือก
  };

  const handleQuestionTextChange = (questionIndex, text) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].questionText = text;
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, answerIndex, text) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswers[answerIndex] = text; // อัปเดตคำตอบที่ถูกต้อง
    setQuestions(updatedQuestions);
  };

  const handleAddCorrectAnswer = (questionIndex) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].correctAnswers) {
      updatedQuestions[questionIndex].correctAnswers = []; // สร้างอาเรย์เก็บคำตอบที่ถูกต้อง
    }
    updatedQuestions[questionIndex].correctAnswers.push(""); // เพิ่มช่องกรอกคำตอบที่ถูกต้องใหม่
    setQuestions(updatedQuestions);
  };
  const handleAskingGameSelect = async (askingGame) => {
    const generatedPIN = generatePIN();
    setPin(generatedPIN);

    const newQuizGameData = {
      storyTH: askingGame.storyTH,
      questions: askingGame.questions,
      section: askingGame.section, 
      createAt: new Date(),
      gameStarted: false,
      pin: generatedPIN,

    };

    try {
      
      await deleteDoc(doc(askingGamesCollection, askingGame.id));

    
      const newQuizGameRef = doc(askingGamesCollection, generatedPIN);
      await setDoc(newQuizGameRef, newQuizGameData);

      console.log("Quiz game updated with new PIN in Firestore!");
    } catch (error) {
      console.error("Error updating asking game in Firestore:", error);
    }

    navigate("/teacher/create/asking-game/game-pin", {
      state: { pin: generatedPIN, askingGame: newQuizGameData },
    });
  };

  const handleAddQuestion = () => {
    // เช็คเพื่อให้กรอกข้อมูลทุกอันก่อน ไม่งั้นกด Add ไม่ได้
    if (
      !storyTH ||
      !section ||
      questions.some(
        (question) =>
          !question.questionText ||
          question.correctAnswers.length === 0 || // ตรวจสอบว่ามีคำตอบที่ถูกต้อง
          question.correctAnswers.some((answer) => !answer) // ตรวจสอบว่าคำตอบที่ถูกต้องไม่ว่าง
      )
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return; // หยุดการทำงานของฟังก์ชัน หากข้อมูลไม่ครบ
    }

    setQuestions([
      ...questions,
      {
        questionText: "",
        correctAnswers: [], // ใช้อาเรย์สำหรับคำตอบที่ถูกต้อง
      },
    ]);
  };

  const generatePIN = () => {
    const pinLength = 6;
    let pin = "";
    for (let i = 0; i < pinLength; i++) {
      pin += Math.floor(Math.random() * 10); // สุ่มตัวเลข 0-9
    }
    return pin;
  };

  const handleSubmit = async () => {
    const generatedPIN = generatePIN(); // สร้าง PIN ใหม่
    setPin(generatedPIN); // ตั้งค่า PIN
  
    // เช็คเพื่อให้กรอกข้อมูลทุกอันก่อน ไม่งั้นกด Submit ไม่ได้
    if (
      !storyTH ||
      !section || // ตรวจสอบว่ามีการกรอก section
      questions.some(
        (question) =>
          !question.questionText ||
          question.correctAnswers.length === 0 || // ตรวจสอบว่ามีคำตอบที่ถูกต้อง
          question.correctAnswers.some((answer) => !answer) // ตรวจสอบว่าคำตอบที่ถูกต้องไม่ว่าง
      )
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return; // หยุดการทำงานของฟังก์ชัน หากข้อมูลไม่ครบ
    }
  
    const formData = {
      storyTH,
      questions,
      section, // เพิ่ม section ลงในข้อมูล
      pin: generatedPIN, // เพิ่ม PIN ลงในข้อมูล
      createAt: new Date(),
      gameStarted: false,
    };
  
    try {
      const newGameRef = doc(askingGamesCollection, generatedPIN);
      await setDoc(newGameRef, formData); // บันทึกข้อมูลใน Firestore
  
      console.log("Asking game added to Firestore with PIN!");
  
      // เคลียร์ข้อมูลหลังจากส่ง
      setStoryTH("");
      setSection(""); // เคลียร์ section
      setQuestions([{ questionText: "", correctAnswers: [] }]); // เคลียร์คำถาม
  
      // นำทางไปยังหน้าที่ต้องการพร้อมกับ PIN และข้อมูลเกม
      navigate("/teacher/create/asking-game/game-pin", {
        state: { pin: generatedPIN, askingGame: { ...formData } },
      });
  
    } catch (error) {
      console.error("Error adding asking game to Firestore:", error);
      if (error.code === "permission-denied") {
        alert("คุณไม่มีสิทธิ์ในการสร้างเกมใหม่");
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างเกม กรุณาลองอีกครั้ง");
      }
    }
  };
  const handleDeleteAskingGame = async (askingGameId) => {
    if (window.confirm("แน่ใจนะว่าจะลบ Quiz Game นี้?")) {
      // เพิ่ม confirmation dialog
      try {
    
        await deleteDoc(doc(askingGamesCollection, askingGameId));
        console.log("Quiz game deleted from Firestore!");
      } catch (error) {
        console.error("Error deleting asking game from Firestore:", error);
        // TODO: เพิ่มการจัดการข้อผิดพลาดที่เหมาะสม
      }
    } // ถ้ากด "ยกเลิก" จะไม่ทำอะไรเลย
  };
  
  const handleSectionSelect = (event) => {
    setSelectedSection(event.target.value);
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <CardContent>
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
              backgroundColor: 'rgba(255, 255, 255, 1)',
              borderRadius: '30px',
              margin: '20px 0'
            }}
          >
            <AssignmentIcon sx={{ fontSize: 40, marginRight: 1 }} />
            สร้างกิจกรรมตอบคำถามสั้น
          </Typography>
  
 
          <TextField
            label="ชื่อหัวข้อเรื่อง"
            multiline
            rows={5}
            value={storyTH}
            onChange={(e) => handleStoryTHChange(e.target.value)}
            fullWidth
            margin="normal"
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: "'IBM Plex Sans Thai', sans-serif",
                fontSize: '1rem',
              },
              '& .MuiInputLabel-root': {
                fontFamily: "'IBM Plex Sans Thai', sans-serif",
                fontSize: '1rem',
              }
            }}
          />
  
          <FormControl fullWidth margin="normal">
            <InputLabel id="section-label">เลือก Section</InputLabel>
            <Select
              labelId="section-label"
              value={section}
              onChange={handleSectionChange}
              label="เลือก Section"
              sx={{
                '& .MuiSelect-root': {
                  fontFamily: "'IBM Plex Sans Thai', sans-serif",
                  fontSize: '1rem',
                },
              }}
            >
              <MenuItem value="">
                <em>เลือก...</em>
              </MenuItem>
              <MenuItem value="SEC1">SEC1</MenuItem>
              <MenuItem value="SEC2">SEC2</MenuItem>
              <MenuItem value="SEC3">SEC3</MenuItem>
              <MenuItem value="SEC4">SEC4</MenuItem>
            </Select>
          </FormControl>
  
          {questions.map((question, questionIndex) => (
  <Box key={questionIndex} sx={{ mb: 2, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
    <Typography
      sx={{
        fontFamily: "'IBM Plex Sans Thai', sans-serif",
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: 1, // เพิ่ม margin ด้านล่าง
      }}
    >
      คำถามที่ {questionIndex + 1}
    </Typography>

    <TextField
      label="ข้อความคำถาม"
      value={question.questionText}
      onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
      fullWidth
      margin="normal"
      variant="outlined"
      sx={{
        '& .MuiInputBase-input': {
          fontFamily: "'IBM Plex Sans Thai', sans-serif",
          fontSize: '1rem',
        },
        '& .MuiInputLabel-root': {
          fontFamily: "'IBM Plex Sans Thai', sans-serif",
        },
        marginBottom: 2, // เพิ่ม margin ด้านล่าง
      }}
    />

    {question.correctAnswers.map((answer, answerIndex) => (
      <TextField
        key={answerIndex}
        label={`คำตอบที่ถูกต้อง ${answerIndex + 1}`}
        value={answer}
        onChange={(e) => handleCorrectAnswerChange(questionIndex, answerIndex, e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        sx={{
          '& .MuiInputBase-input': {
            fontFamily: "'IBM Plex Sans Thai', sans-serif",
          },
          '& .MuiInputLabel-root': {
            fontFamily: "'IBM Plex Sans Thai', sans-serif",
          },
          marginBottom: 2, // เพิ่ม margin ด้านล่าง
        }}
      />
    ))}

    <Button
      variant="contained"
      onClick={() => handleAddCorrectAnswer(questionIndex)}
      sx={{
        marginTop: '16px',
        backgroundColor: '#4caf50',
        color: 'white',
        padding: '6px 20px',
        fontFamily: "'IBM Plex Sans Thai', sans-serif",
        fontWeight: 'bold',
        borderRadius: '10px',
        transition: 'background-color 0.4s ease',
        '&:hover': {
          backgroundColor: '#DFA003',
        },
        marginBottom: 3, // เพิ่ม margin ด้านล่าง
      }}
    >
      <AddIcon sx={{ marginRight: 1 }} />
      เพิ่มคำตอบที่ถูกต้อง
    </Button>
  </Box>
))}
  
  
  <Box display="flex" justifyContent="center" mt={2} sx={{ marginTop: '24px' }}>
  <Button
    variant="contained"
    color="primary"
    onClick={handleAddQuestion}
    sx={{
      fontFamily: "'IBM Plex Sans Thai', sans-serif",
      marginRight: 2, // เพิ่มระยะห่างระหว่างปุ่ม
      '&:hover': {
        backgroundColor: '#006A7D',
      },
      fontWeight: 'bold',
    }}
  >
    <AddIcon sx={{ marginRight: 1 }} />
    เพิ่มคำถาม
  </Button>

  <Button
    variant="contained"
    color="success"
    onClick={handleSubmit}
    sx={{
      fontFamily: "'IBM Plex Sans Thai', sans-serif",
      '&:hover': {
        backgroundColor: '#235D3A',
      },
      fontWeight: 'bold',
    }}
  >
    <AssignmentIcon sx={{ marginRight: 1 }} />
    สร้างกิจกรรมตอบคำถามสั้น
  </Button>
</Box>
          
          
          
          
          
<Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", marginTop: '20px' }}>
  เลือกกิจกรรมตอบคำถามสั้นที่เคยสร้าง
</Typography>

{/* Select สำหรับเลือก Section */}
<FormControl fullWidth variant="outlined" margin="normal">
  <InputLabel>เลือก Section ของกิจกรรม</InputLabel>
  <Select
    value={selectedSection}
    onChange={handleSectionSelect}
    label="เลือก Section"
  >
    <MenuItem value="">ทั้งหมด</MenuItem>
    <MenuItem value="SEC1">SEC1</MenuItem>
    <MenuItem value="SEC2">SEC2</MenuItem>
    <MenuItem value="SEC3">SEC3</MenuItem>
    <MenuItem value="SEC4">SEC4</MenuItem>
  </Select>
</FormControl>

<List>
  {askingGames
    .filter((askingGame) => !selectedSection || askingGame.section === selectedSection)
    .map((askingGame) => (
      <Accordion key={askingGame.id}>
        <AccordionSummary
          expandIcon={<VisibilityIcon />}
          aria-controls={`panel${askingGame.id}-content`}
          id={`panel${askingGame.id}-header`}
          sx={{
            bgcolor: "background.paper",
            borderRadius: 1,
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <ListItemButton onClick={() => handleAskingGameSelect(askingGame)}>
            <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
              <AssignmentIcon />
            </Avatar>

            <ListItemText
              primary={
                <Typography
                  sx={{ fontSize: "1.2rem", fontWeight: "bold" }}
                  component="span"
                  color="text.primary"
                >
                  {"ชื่อหัวข้อ: " + askingGame.storyTH}
                </Typography>
              }
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{
                      display: "inline",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {askingGame.section}
                  </Typography>
                  {" / "}
                  <Typography
                    sx={{
                      display: "inline",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    จำนวนคำถาม: {askingGame.questions.length}
                  </Typography>
                  {" / "}
                  <Typography
                    sx={{
                      display: "inline",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                    }}
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    สร้างเมื่อ:{" "}
                    {moment(askingGame.createAt.toDate())
                      .locale("th")
                      .format("LL HH:mm น.")}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItemButton>

          <Stack direction="row" spacing={2} alignItems="center">
            <DeleteIcon
              edge="end"
              aria-label="delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAskingGame(askingGame.id);
              }}
              color="error"
            >
              <DeleteIcon />
            </DeleteIcon>
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Typography variant="h6" gutterBottom>
            รายละเอียดคำถาม
          </Typography>
          <List>
            {askingGame.questions.map((question, qIndex) => (
              <ListItem key={qIndex} disablePadding>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: "bold" }}>
                      คำถามที่ {qIndex + 1}: {question.questionText}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography>
                        คำตอบที่ถูกต้อง:
                      </Typography>
                      {question.correctAnswers.map((answer, aIndex) => (
                        <Typography key={aIndex} sx={{ display: "inline" }}>
                          {answer}
                        </Typography>
                      ))}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    ))}
</List>

          <div className="button-group2">
            <Link to={'/teacher/index'}>
              <Button
                variant="contained"
                color="error"
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  left: 16,
                  padding: '10px 20px',
                  fontFamily: "'IBM Plex Sans Thai', sans-serif",
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#FD464A',
                  }
                }}
              >              
                ย้อนกลับ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
    </div>
  );
  
  
  
  
};

export default CreateAskingGame;
