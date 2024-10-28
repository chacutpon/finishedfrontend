import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  Container,
  Card,
  CardContent,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItem,
  Divider,
  Grid,
  Avatar,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../../firebase"; // ปรับเส้นทางให้ถูกต้อง
import {
  collection,
  setDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import "moment/locale/th";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import AssignmentIcon from '@mui/icons-material/Assignment';
const CreateGroupGame = () => {
  const navigate = useNavigate();
  const [storyTH, setStoryTH] = useState("");
  const [pin, setPin] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [section, setSection] = useState("");
  const [playerCreate, setPlayerCreate] = useState(1); // จำนวนคนในกลุ่ม
  const [groupCreate, setGroupCreate] = useState(1); // จำนวนกลุ่ม
  const [questions, setQuestions] = useState([{ questionText: "" }]);
  const groupGamesCollection = collection(db, "group_games");
  const [selectedGroupGame, setSelectedGroupGame] = useState(null);
  const [groupGames, setGroupGames] = useState([]);
  useEffect(() => {
    const unsubscribe = onSnapshot(groupGamesCollection, (snapshot) => {
      const games = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroupGames(games); // อัปเดต state groupGames
    });

    return () => unsubscribe();
  }, [groupGamesCollection]);
  const handleStoryTHChange = (text) => {
    setStoryTH(text);
  };

  const handleGroupGameSelect = async (groupGame) => {
    const generatedPIN = generatePIN();
    setPin(generatedPIN);

    const newGroupGameData = {
      storyTH: groupGame.storyTH,
      questions: groupGame.questions,
      section: groupGame.section, // ใช้ section เดิมจาก groupGame
      playerCreate: groupGame.playerCreate, // อัปเดตค่า playerCreate จากเกมที่เลือก
      groupCreate: groupGame.groupCreate, // อัปเดตค่า groupCreate จากเกมที่เลือก
      createAt: new Date(),
      gameStarted: false,
      pin: generatedPIN,
    };

    try {
      // ลบเอกสาร quiz game เดิม
      await deleteDoc(doc(groupGamesCollection, groupGame.id));

      // สร้างเอกสารใหม่ใน collection "quiz_games" พร้อมกับกำหนด ID เอง
      const newGroupGameRef = doc(groupGamesCollection, generatedPIN);
      await setDoc(newGroupGameRef, newGroupGameData);

      console.log("Quiz game updated with new PIN in Firestore!");
    } catch (error) {
      console.error("Error updating quiz game in Firestore:", error);
    }

    navigate("/teacher/create/group-game/game-pin", {
      state: { pin: generatedPIN, groupGame: newGroupGameData },
    });
  };

  const handleAddQuestion = () => {
    // ตรวจสอบว่าคำถามมีข้อมูลครบหรือไม่
    const hasEmptyQuestion = questions.some(
      (q) => q.questionText.trim() === ""
    );
    if (hasEmptyQuestion) {
      alert("กรุณากรอกคำถามให้ครบก่อนเพิ่มคำถามใหม่");
      return;
    }
    setQuestions([...questions, { questionText: "" }]);
  };

  const generatePIN = () => {
    const pinLength = 6;
    let pin = "";
    for (let i = 0; i < pinLength; i++) {
      pin += Math.floor(Math.random() * 10);
    }
    return pin;
  };

  const handleSectionChange = (event) => {
    setSection(event.target.value); // อัปเดต section เมื่อมีการเลือก
  };

  const handleQuestionTextChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    // ตรวจสอบว่ามีคำถามที่ว่างอยู่ก่อนส่ง
    const hasEmptyQuestion = questions.some(
      (q) => q.questionText.trim() === ""
    );
    if (hasEmptyQuestion) {
      alert("กรุณากรอกคำถามให้ครบก่อนส่ง");
      return;
    }

    const generatedPIN = generatePIN();
    setPin(generatedPIN);

    const formData = {
      storyTH,
      questions,
      section,
      playerCreate,
      groupCreate,
      createAt: new Date(),
      gameStarted: false,
    };

    navigate("/teacher/create/group-game/game-pin", {
      state: { pin: generatedPIN, groupGame: { ...formData } },
    });

    try {
      const newGroupGameRef = doc(groupGamesCollection, generatedPIN);
      await setDoc(newGroupGameRef, formData);

      await setDoc(newGroupGameRef, { pin: generatedPIN }, { merge: true });

      console.log("Group game added to Firestore with PIN!");
    } catch (error) {
      console.error("Error adding group game to Firestore:", error);
      if (error.code === "permission-denied") {
        alert("คุณไม่มีสิทธิ์ในการสร้างเกมใหม่");
      } else {
        alert("เกิดข้อผิดพลาดในการสร้างเกม กรุณาลองอีกครั้ง");
      }
    }
  };
  const handleDeleteGroupGame = async (gameId) => {
    if (window.confirm("แน่ใจนะว่าจะลบเกมกลุ่มนี้?")) {
      try {
        // ลบเอกสารเกมกลุ่มจาก Firestore
        await deleteDoc(doc(groupGamesCollection, gameId));
        console.log("Group game deleted from Firestore!");
      } catch (error) {
        console.error("Error deleting group game from Firestore:", error);
        // TODO: เพิ่มการจัดการข้อผิดพลาดที่เหมาะสม
      }
    } // ถ้ากด "ยกเลิก" จะไม่ทำอะไรเลย
  };
  const handleSectionSelect= (event) => {
    setSelectedSection(event.target.value); // ฟังก์ชันสำหรับอัปเดต section
};
const filteredGroupGames = selectedSection
  ? groupGames.filter((game) => game.section === selectedSection)
  : groupGames; // ถ้าไม่ได้เลือก section ให้แสดงทั้งหมด

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
    padding: '16px', // ปรับ padding ลดลง
    borderBottom: '4px solid #000000', // ปรับขนาด border
    textShadow: '1px 1px 2px rgba(0, 0, 0, 1)',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: '30px',
    margin: '16px 0', // ปรับ margin ลดลง
    fontSize: '2.4rem', // ลดขนาดฟอนต์ (จาก 3rem)
  }}
>
  <AssignmentIcon sx={{ fontSize: 32, marginRight: 1 }} /> {/* ลดขนาดไอคอน */}
  สร้างกิจกรรมตอบคำถามแบบกลุ่ม
</Typography>

          <TextField
            label="ชื่อหัวข้อเรื่อง"
            multiline
            rows={4}
            fullWidth
            value={storyTH}
            onChange={(e) => handleStoryTHChange(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ 
              sx: { 
                fontSize: '1.2rem', // ปรับขนาดฟอนต์
                fontWeight: 'bold' // ทำให้ตัวหนา
              } 
            }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="section-label">Section</InputLabel>
            <Select
              labelId="section-label"
              value={section}
              onChange={handleSectionChange}
              label="Section"
            >
              <MenuItem value="SEC1">SEC1</MenuItem>
              <MenuItem value="SEC2">SEC2</MenuItem>
              <MenuItem value="SEC3">SEC3</MenuItem>
              <MenuItem value="SEC4">SEC4</MenuItem>
            </Select>
          </FormControl>


          <TextField
            label="จำนวนกลุ่ม"
            type="number"
            value={groupCreate}
            onChange={(e) =>
              setGroupCreate(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            fullWidth
            margin="normal"
          />





          <TextField
            label="จำนวนคนต่อกลุ่ม"
            type="number"
            value={playerCreate}
            onChange={(e) =>
              setPlayerCreate(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
            fullWidth
            margin="normal"
          />

  

          {questions.map((question, questionIndex) => (
            <Card
              key={questionIndex}
              elevation={1}
              sx={{ p: 2, mb: 2, borderRadius: 1 }}
            >
              <CardContent>
                <Typography  variant="h5"
                          gutterBottom
                          sx={{ fontWeight: "bold",fontSize: '1.8rem' }}
                >
                  คำถามที่ {questionIndex + 1}
                </Typography>
                <TextField
                  label="ข้อความคำถาม"
                  value={question.questionText}
                  onChange={(e) =>
                    handleQuestionTextChange(questionIndex, e.target.value)
                  }
                  fullWidth
                  margin="normal"
                />
              </CardContent>
            </Card>
          ))}

<Grid item xs={12}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddQuestion}
                  startIcon={<AddIcon />}
                >
                  เพิ่มคำถาม
                </Button>
                <Button
                  variant="contained"
                  color="success" // เปลี่ยนสีปุ่ม
                  onClick={handleSubmit}
                  startIcon={<AssignmentIcon />}
                >
                  สร้างกิจกรรมตอบคำถามแบบกลุ่ม
                </Button>
              </Stack>
            </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
  เลือกกิจกรรมตอบคำถามแบบกลุ่มที่เคยสร้าง
</Typography>
<FormControl fullWidth variant="outlined" margin="normal">
    <InputLabel>เลือก Section ของกิจกรรม</InputLabel>
    <Select
      value={selectedSection}
      onChange={handleSectionSelect} // ฟังก์ชันจัดการเมื่อเลือก section
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
  {filteredGroupGames.map((game) => (
    <Accordion key={game.id}>
      <AccordionSummary
        expandIcon={<VisibilityIcon />}
        aria-controls={`panel${game.id}-content`}
        id={`panel${game.id}-header`}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 1,
          "&:hover": { bgcolor: "grey.100" },
        }}
      >
        <ListItemButton onClick={() => handleGroupGameSelect(game)}>
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
                {"ชื่อหัวข้อ: " + game.storyTH}
              </Typography>
            }
            secondary={
              <>
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
                  {game.section}
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
                  จำนวนคำถาม: {game.questions.length}
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
                  {moment(game.createAt.toDate())
                    .locale("th")
                    .format("LL HH:mm น.")}
                </Typography>
              </>
            }
          />
        </ListItemButton>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering accordion
              handleDeleteGroupGame(game.id);
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="h6" gutterBottom>
          รายละเอียดคำถาม
        </Typography>
        <List>
          {game.questions.map((question, qIndex) => (
            <ListItem key={qIndex} disablePadding>
              <ListItemText
                primary={
                  <Typography sx={{ fontWeight: "bold" }}>
                    คำถามที่ {qIndex + 1}: {question.questionText}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  ))}
</List>
<br />
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

export default CreateGroupGame;
