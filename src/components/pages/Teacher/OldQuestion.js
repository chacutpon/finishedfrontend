import React, { useState, useEffect } from "react";
import {
  Grid,
  Container,
  Divider,
  Typography,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemButton,
  Avatar,
  ListItemText,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  ListItem,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import moment from "moment"; // อย่าลืมติดตั้ง moment.js

const OldQuestions = () => {
  const [quizGames, setQuizGames] = useState([]);
  const [groupGames, setGroupGames] = useState([]);
  const [askingGames, setAskingGames] = useState([]); 
  const [selectedSection, setSelectedSection] = useState("");
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchQuizGames = async () => {
      const unsubscribe = onSnapshot(collection(db, "quiz_games"), (snapshot) => {
        const quizGameData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizGames(quizGameData);
  
        // สร้าง Array ของ sections ที่ไม่ซ้ำกัน
        const uniqueSections = [...new Set(quizGameData.map(game => game.section))];
        setSections(uniqueSections);
      });
      return () => unsubscribe();
    };
  
    const fetchGroupGames = async () => {
      const unsubscribe = onSnapshot(collection(db, "group_games"), (snapshot) => {
        const groupGameData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupGames(groupGameData);
  
        // สร้าง Array ของ sections ที่ไม่ซ้ำกัน
        const uniqueGroupSections = [...new Set(groupGameData.map(game => game.section))];
        setSections(prevSections => [...new Set([...prevSections, ...uniqueGroupSections])]); // รวม sections จาก quizGames และ groupGames
      });
      return () => unsubscribe();
    };

    const fetchAskingGames = async () => {
      const unsubscribe = onSnapshot(collection(db, "asking_games"), (snapshot) => {
        const askingGameData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAskingGames(askingGameData);

        // สร้าง Array ของ sections ที่ไม่ซ้ำกัน
        const uniqueAskingSections = [...new Set(askingGameData.map(game => game.section))];
        setSections(prevSections => [...new Set([...prevSections, ...uniqueAskingSections])]); // รวม sections
      });
      return () => unsubscribe();
    };
  
    fetchQuizGames();
    fetchGroupGames();
    fetchAskingGames();
  }, []);






  
  const handleDeleteQuizGame = (quizGameId) => {
    console.log(`Delete quiz game with ID: ${quizGameId}`);
  };

  // ฟังก์ชันสำหรับกรอง quizGames ตาม section ที่เลือก
  const filteredQuizGames = selectedSection
    ? quizGames.filter(quizGame => quizGame.section === selectedSection)
    : quizGames;

  // ฟังก์ชันสำหรับกรอง groupGames ตาม section ที่เลือก
  const filteredGroupGames = selectedSection
    ? groupGames.filter(groupGame => groupGame.section === selectedSection)
    : groupGames;

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
    <Container maxWidth="lg" sx={{ p: 4, mt: 4, backgroundColor: "#fff" }}>
       <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel id="section-select-label">เลือก Section</InputLabel>
          <Select
            labelId="section-select-label"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            label="เลือก Section"
          >
            <MenuItem value=""><em>ทั้งหมด</em></MenuItem>
            {sections
              .sort((a, b) => parseInt(a.replace('SEC', '')) - parseInt(b.replace('SEC', ''))) // จัดเรียงโดยใช้ตัวเลข
              .map((section, index) => (
                <MenuItem key={index} value={section}>{section}</MenuItem>
              ))}
          </Select>
        </FormControl>
      
      
      
      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          คำถามที่เคยสร้าง (quizgame)
        </Typography>
        
       

        <List>
          {filteredQuizGames.map((quizGame) => (
            <Accordion key={quizGame.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<VisibilityIcon />}
                aria-controls={`panel${quizGame.id}-content`}
                id={`panel${quizGame.id}-header`}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ListItemButton>
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
                        {"ชื่อหัวข้อ: " + quizGame.storyTH}
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
                          {quizGame.section}
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
                          จำนวนคำถาม: {quizGame.questions?.length || 0}
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
                          ทดสอบล่าสุดเมื่อ:{" "}
                          {moment(quizGame.createAt.toDate())
                            .locale("th")
                            .format("LL HH:mm น.")}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </AccordionSummary>

              <AccordionDetails>
                <Typography variant="h6" gutterBottom>
                  รายละเอียดคำถาม
                </Typography>
                <List>
                  {quizGame.questions?.map((question, qIndex) => (
                    <ListItem key={qIndex} disablePadding>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            คำถามที่ {qIndex + 1}: {question.questionText}
                          </Typography>
                        }
                        secondary={
                          <RadioGroup>
                            {question.answerOptions?.map((option, oIndex) => (
                              <FormControlLabel
                                key={oIndex}
                                value={oIndex.toString()}
                                control={
                                  <Radio checked={option.isCorrect} />
                                }
                                label={option.answerText}
                              />
                            ))}
                          </RadioGroup>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      </Grid>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          คำถามที่เคยสร้าง (asking game)
        </Typography>
        <List>
          {askingGames
            .filter(askingGame => !selectedSection || askingGame.section === selectedSection) // กรองตาม section
            .map((askingGame) => (
              <Accordion key={askingGame.id} sx={{ mb: 2 }}>
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
                  <ListItemButton>
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
                        <>
                          <Typography
                            sx={{ display: "inline", fontSize: "0.9rem", fontWeight: "bold" }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {askingGame.section}
                          </Typography>
                          {" / "}
                          <Typography
                            sx={{ display: "inline", fontSize: "0.9rem", fontWeight: "bold" }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            จำนวนคำถาม: {askingGame.questions?.length || 0}
                          </Typography>
                          {" / "}
                          <Typography
                            sx={{ display: "inline", fontSize: "0.9rem", fontWeight: "bold" }}
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            ทดสอบล่าสุดเมื่อ:{" "}
                            {moment(askingGame.createAt.toDate())
                              .locale("th")
                              .format("LL HH:mm น.")}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </AccordionSummary>
                <AccordionDetails>
  <Typography variant="h6" gutterBottom>
    รายละเอียดคำถาม
  </Typography>
  <List>
    {askingGame.questions?.map((question, qIndex) => (
      <ListItem key={qIndex} disablePadding>
        <ListItemText
          primary={
            <Typography sx={{ fontWeight: "bold" }}>
              คำถามที่ {qIndex + 1}: {question.questionText}
            </Typography>
          }
          secondary={
            <>
              <RadioGroup>
                {question.answerOptions?.map((option, oIndex) => (
                  <FormControlLabel
                    key={oIndex}
                    value={oIndex.toString()}
                    control={<Radio checked={option.isCorrect} />}
                    label={option.answerText}
                  />
                ))}
              </RadioGroup>
              <Typography sx={{ fontWeight: "bold", color: "success.main" }}>
                คำตอบ : {question.correctAnswers} 
              </Typography>
            </>
          }
        />
      </ListItem>
    ))}
  </List>
</AccordionDetails>

              </Accordion>
            ))}
        </List>
   




  
      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          คำถามที่เคยสร้าง (groupgame)
        </Typography>

        <List>
          {filteredGroupGames.map((groupGame) => (
            <Accordion key={groupGame.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<VisibilityIcon />}
                aria-controls={`panel${groupGame.id}-content`}
                id={`panel${groupGame.id}-header`}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <ListItemButton>
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
                        {"ชื่อหัวข้อ: " + groupGame.storyTH}
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
                          {groupGame.section}
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
                          จำนวนคำถาม: {groupGame.questions?.length || 0}
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
                          ทดสอบล่าสุดเมื่อ:{" "}
                          {moment(groupGame.createAt.toDate())
                            .locale("th")
                            .format("LL HH:mm น.")}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </AccordionSummary>

              <AccordionDetails>
                <Typography variant="h6" gutterBottom>
                  รายละเอียดคำถาม
                </Typography>
                <List>
                  {groupGame.questions?.map((question, qIndex) => (
                    <ListItem key={qIndex} disablePadding>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: "bold" }}>
                            คำถามที่ {qIndex + 1}: {question.questionText}
                          </Typography>
                        }
                        secondary={
                          <RadioGroup>
                            {question.answerOptions?.map((option, oIndex) => (
                              <FormControlLabel
                                key={oIndex}
                                value={oIndex.toString()}
                                control={
                                  <Radio checked={option.isCorrect} />
                                }
                                label={option.answerText}
                              />
                            ))}
                          </RadioGroup>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </List>
      </Grid>
    </Container>
    </div>
  );
};

export default OldQuestions;
