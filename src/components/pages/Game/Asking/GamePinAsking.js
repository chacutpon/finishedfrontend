import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  Box,
  Paper,
  Divider
} from '@mui/material';
import { auth } from '../../../firebase';

const GamePinAsking = () => {
  const location = useLocation();
  const pin = location.state?.pin; 
  const askingGame = location.state?.askingGame; 
  const [playerNames, setPlayerNames] = useState([]);
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState(null);
  const [gameNotFound, setGameNotFound] = useState(false);

  const askingGamesCollection = collection(db, 'asking_games');
  const user = auth.currentUser; // รับข้อมูลผู้ใช้ที่ล็อกอิน

  useEffect(() => {
    if (!user) {
      alert('กรุณาล็อกอินเพื่อเข้าถึงข้อมูลนี้');
      navigate('/login'); // หากไม่ได้ล็อกอิน นำทางไปยังหน้าล็อกอิน
      return;
    }


    const gamePlayersCollectionRef = collection(db, 'asking_players');
    
    // สร้าง query เพื่อค้นหาผู้เล่นตาม PIN
    const unsubscribePlayers = onSnapshot(
      query(gamePlayersCollectionRef, where('pin', '==', pin)), 
      (snapshot) => {
        const names = snapshot.docs.map((doc) => doc.data().name);
        setPlayerNames(names);
      }
    );

    const unsubscribeGame = onSnapshot(doc(askingGamesCollection, pin), (doc) => {
      if (doc.exists()) {
        setGameStarted(doc.data().gameStarted);
      } else {
        setGameNotFound(true); // ถ้าไม่พบเอกสารเกม
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeGame();
    };
  }, [pin, navigate, user]);

  const handleStartGame = async () => {
    if (gameStarted) {
      setError('เกมได้เริ่มไปแล้ว');
      return;
    }

    try {
      const askingGameRef = doc(askingGamesCollection, pin);
      await updateDoc(askingGameRef, { gameStarted: true });
      navigate('/teacher/create/asking-game/see-point', { state: { pin, askingGame } }); 
    } catch (error) {
      console.error('Error starting game:', error);
      if (error.code === 'permission-denied') {
        setError('คุณไม่มีสิทธิ์ในการเริ่มเกม');
      } else if (error.code === 'not-found') {
        setError('ไม่พบเอกสารเกม');
      } else {
        setError('เกิดข้อผิดพลาดในการเริ่มเกม กรุณาลองอีกครั้ง');
      }
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
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: '20px', width: '90%', textAlign: 'center', fontFamily: 'Kanit, sans-serif', backgroundColor: '#ffffff' }}>
        {gameNotFound ? (
          <Alert severity="error" onClose={() => setGameNotFound(false)} sx={{ mb: 2, borderRadius: 2 }}>
            ไม่พบเกมนี้
          </Alert>
        ) : (
          <>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: '#3f51b5' }}>
              Game PIN: {pin}
            </Typography>
            <Divider sx={{ mb: 3 }} />
  
            <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'medium', color: '#4caf50' }}>
              ผู้เล่นที่เข้าร่วม:
            </Typography>
            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, boxShadow: 2 }}>
              {playerNames.map((name, index) => (
                <ListItem key={index} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <ListItemText primary={name} primaryTypographyProps={{ fontFamily: 'Kanit, sans-serif', fontWeight: 'medium', color: '#424242' }} />
                </ListItem>
              ))}
            </List>
  
            {!gameStarted && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="contained" color="success" onClick={handleStartGame} sx={{ width: '50%', fontFamily: 'Kanit, sans-serif', boxShadow: 3 }}>
                  เริ่ม
                </Button>
              </Box>
            )}
  
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </Paper>
    </Container>
    </div>
  );
};

export default GamePinAsking;
