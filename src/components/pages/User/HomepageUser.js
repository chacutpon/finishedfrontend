import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
} from "@mui/material";
import tree from '../image/tree.jpg'


const HomepageUser = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const createAt = new Date();
  const navigate = useNavigate();
  const quizGamesCollection = collection(db, "quiz_games");
  const gamePlayersCollection = collection(db, "game_players");
  const groupGamesCollection = collection(db, "group_games");
  const groupPlayersCollection = collection(db, "group_players");
  const askingGamesCollection = collection(db, "asking_games");
  const askingPlayersCollection = collection(db, "asking_players"); 
  const questionPlayersCollection = collection(db, "question_players")
  const location = useLocation();

  useEffect(() => {
    const preventGoBack = () => {
      window.history.pushState(null, null, location.pathname);
    };

    window.addEventListener("popstate", preventGoBack);
    window.history.pushState(null, null, location.pathname);

    return () => {
      window.removeEventListener("popstate", preventGoBack);
    };
  }, [location]);
  
  

  const joinRoom = async () => {
    if (!name || !pin) {
      alert("กรุณากรอกชื่อผู้เล่นและ PIN");
      return;
    }

    if (isNaN(pin)) {
      alert("PIN ต้องเป็นตัวเลข");
      return;
    }

    console.log("Joining game with name:", name, "and pin:", pin);

    if (pin === "123456") {
      await addDoc(questionPlayersCollection, {
          name,
          pin,
          userEmail: auth.currentUser.email,
          createAt: createAt,
          gameType: "question"
          // คุณสามารถเพิ่มข้อมูลอื่นๆ ตามที่ต้องการได้ที่นี่
      });
      console.log("Player added to question_players in Firestore!");
      navigate("/user/index/question-page", { state: { pin, name } }); // เปลี่ยนเส้นทางไปยังหน้าที่ต้องการ
      return;
  }


    try {
      const quizQuery = query(quizGamesCollection, where("pin", "==", pin));
      const groupQuery = query(groupGamesCollection, where("pin", "==", pin));
      const askingQuery = query(askingGamesCollection, where("pin", "==", pin));

      const [quizSnapshot, groupSnapshot, askingSnapshot] = await Promise.all([
        getDocs(quizQuery),
        getDocs(groupQuery),
        getDocs(askingQuery),
      ]);

      // ตรวจสอบสำหรับ quiz game
      if (!quizSnapshot.empty) {
        const gameData = quizSnapshot.docs[0].data();
        if (gameData.gameStarted) {
          alert("เกมได้เริ่มไปแล้ว ไม่สามารถเข้าร่วมได้");
          return;
        }
        const gameSection = gameData.section;
        const nameQuery = query(
          gamePlayersCollection,
          where("pin", "==", pin),
          where("name", "==", name)
        );
        const nameSnapshot = await getDocs(nameQuery);

        if (nameSnapshot.empty) {
          const playerSnapshot = await getDocs(
            query(gamePlayersCollection, where("userEmail", "==", auth.currentUser.email))
          );

          if (playerSnapshot.empty) {
            await addDoc(gamePlayersCollection, {
              name,
              pin,
              score: 0,
              userEmail: auth.currentUser.email,
              section: gameSection,
              createAt: createAt,
              gameType: "quiz",
            });
            console.log("Player added to game_players in Firestore!");
            navigate("/user/index/wait-teacher", { state: { pin, name } });
          } else {
            const previousSection = playerSnapshot.docs[0].data().section;
            if (previousSection === gameSection) {
              await addDoc(gamePlayersCollection, {
                name,
                pin,
                score: 0,
                userEmail: auth.currentUser.email,
                section: gameSection,
                createAt: createAt,
                gameType: "quiz",
              });
              console.log("Player added to game_players in Firestore!");
              navigate("/user/index/wait-teacher", { state: { pin, name } });
            } else {
              alert("คุณไม่สามารถเข้าร่วมเกมนี้ได้ เนื่องจากอยู่ในเซคที่แตกต่างกัน");
            }
          }
        } else {
          alert("ชื่อผู้เล่นนี้ถูกใช้แล้วในเกมนี้ กรุณาเปลี่ยนชื่อใหม่");
        }
      }
      // ตรวจสอบสำหรับ group game
      else if (!groupSnapshot.empty) {
        const gameData = groupSnapshot.docs[0].data();
        if (gameData.gameStarted) {
          alert("เกมกลุ่มได้เริ่มไปแล้ว ไม่สามารถเข้าร่วมได้");
          return;
        }
        const gameSection = gameData.section;
        const nameQuery = query(
          groupPlayersCollection,
          where("pin", "==", pin),
          where("name", "==", name)
        );
        const nameSnapshot = await getDocs(nameQuery);

        if (nameSnapshot.empty) {
          const playerSnapshot = await getDocs(
            query(groupPlayersCollection, where("userEmail", "==", auth.currentUser.email))
          );

          if (playerSnapshot.empty) {
            const quizPlayerSnapshot = await getDocs(
              query(gamePlayersCollection, where("userEmail", "==", auth.currentUser.email))
            );

            const previousSection = quizPlayerSnapshot.empty
              ? null
              : quizPlayerSnapshot.docs[0].data().section;

            if (previousSection === null || previousSection === gameSection) {
              await addDoc(groupPlayersCollection, {
                name,
                pin,
                userEmail: auth.currentUser.email,
                section: gameSection,
                createAt: createAt,
                answers: {},
                gameType: "group",
              });
              console.log("Player added to group_players in Firestore!");
              navigate("/user/index/wait-groupgame", { state: { pin, name } });
            } else {
              alert("คุณไม่สามารถเข้าร่วมเกมนี้ได้ เนื่องจากอยู่ในเซคที่แตกต่างกัน");
            }
          } else {
            const previousSection = playerSnapshot.docs[0].data().section;
            if (previousSection === gameSection) {
              await addDoc(groupPlayersCollection, {
                name,
                pin,
                userEmail: auth.currentUser.email,
                section: gameSection,
                createAt: createAt,
                answers: {},
                gameType: "group",
              });
              console.log("Player added to group_players in Firestore!");
              navigate("/user/index/wait-groupgame", { state: { pin, name } });
            } else {
              alert("คุณไม่สามารถเข้าร่วมเกมนี้ได้ เนื่องจากอยู่ในเซคที่แตกต่างกัน");
            }
          }
        } else {
          alert("ชื่อผู้เล่นนี้ถูกใช้แล้วในเกมกลุ่มนี้ กรุณาเปลี่ยนชื่อใหม่");
        }
      }
      // ตรวจสอบสำหรับ asking game
      else if (!askingSnapshot.empty) {
        const gameData = askingSnapshot.docs[0].data();
        if (gameData.gameStarted) {
          alert("เกม Asking ได้เริ่มไปแล้ว ไม่สามารถเข้าร่วมได้");
          return;
        }
        const gameSection = gameData.section;
        const nameQuery = query(
          askingPlayersCollection,
          where("pin", "==", pin),
          where("name", "==", name)
        );
        const nameSnapshot = await getDocs(nameQuery);

        if (nameSnapshot.empty) {
          const playerSnapshot = await getDocs(
            query(askingPlayersCollection, where("userEmail", "==", auth.currentUser.email))
          );

          if (playerSnapshot.empty) {
            await addDoc(askingPlayersCollection, {
              name,
              pin,
              score: 0,
              userEmail: auth.currentUser.email,
              section: gameSection,
              createAt: createAt,
              gameType: "asking", // บันทึกประเภทเกมที่นี่
            });
            console.log("Player added to asking_players in Firestore!");
            navigate("/user/index/wait-askinggame", { state: { pin, name } });
          } else {
            const previousSection = playerSnapshot.docs[0].data().section;
            if (previousSection === gameSection) {
              await addDoc(askingPlayersCollection, {
                name,
                pin,
                score: 0,
                userEmail: auth.currentUser.email,
                section: gameSection,
                createAt: createAt,
                gameType: "asking", // บันทึกประเภทเกมที่นี่
              });
              console.log("Player added to asking_players in Firestore!");
              navigate("/user/index/wait-askinggame", { state: { pin, name } });
            } else {
              alert("คุณไม่สามารถเข้าร่วมเกมนี้ได้ เนื่องจากอยู่ในเซคที่แตกต่างกัน");
            }
          }
        } else {
          alert("ชื่อผู้เล่นนี้ถูกใช้แล้วในเกม Asking นี้ กรุณาเปลี่ยนชื่อใหม่");
        }
      } else {
        alert("ไม่พบ PIN ที่ถูกต้อง");
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${tree})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
          backgroundColor: "rgba(255, 255, 255, 0.85)", // Slightly transparent background
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}
          >
            เข้าร่วมกิจกรรม
          </Typography>
  
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="ชื่อผู้เล่น"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
  
            <Grid item xs={12}>
              <TextField
                label="กรอก PIN"
                fullWidth
                type="number"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
            </Grid>
  
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={joinRoom}
                sx={{
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                  },
                  borderRadius: "12px",
                  padding: "10px 0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                เข้าร่วม
              </Button>
            </Grid>
  
            <Grid item xs={12}>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/user/index/introduce"
                sx={{
                  borderColor: "#1976d2",
                  color: "#1976d2",
                  borderRadius: "12px",
                  padding: "10px 0",
                  fontSize: "16px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                  },
                }}
              >
                แนะนำการเล่น
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
  
  
};

export default HomepageUser;
