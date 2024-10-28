import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase'; 
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc, getDocs } from 'firebase/firestore'; // นำเข้า getDocs
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

const GamePinGroup = () => {
  const location = useLocation();
  const pin = location.state?.pin; 
  const groupGame = location.state?.groupGame; 
  const [playerNames, setPlayerNames] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState(null);
  const [gameNotFound, setGameNotFound] = useState(false);

  const groupGamesCollection = collection(db, 'group_games');
  const user = auth.currentUser; // รับข้อมูลผู้ใช้ที่ล็อกอิน
  const groupPlayersCollectionRef = collection(db, 'group_players'); // ประกาศที่นี่

  useEffect(() => {
    if (!user) {
      alert('กรุณาล็อกอินเพื่อเข้าถึงข้อมูลนี้');
      navigate('/login');
      return;
    }

    const unsubscribePlayers = onSnapshot(
      query(groupPlayersCollectionRef, where('pin', '==', pin)), 
      (snapshot) => {
        if (snapshot.empty) {
          console.log('No players found for this PIN:', pin);
        } else {
          const names = snapshot.docs.map((doc) => doc.data().name);
          setPlayerNames(names);
        }
      },
      (error) => {
        console.error("Error fetching players: ", error);
      }
    );

    const unsubscribeGame = onSnapshot(doc(groupGamesCollection, pin), (doc) => {
      if (doc.exists()) {
        setGameStarted(doc.data().gameStarted);
      } else {
        setGameNotFound(true);
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

    if (groups.length === 0) {
      window.alert('กรุณาสุ่มกลุ่มก่อนที่จะเริ่มเกม');
      return;
    }
    try {
      const groupGameRef = doc(groupGamesCollection, pin);
      await updateDoc(groupGameRef, { gameStarted: true });
      navigate('/teacher/create/group-game/see-point', { state: { pin, groupGame } }); 
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

  const handleRandomizeGroups = async () => {
    const totalPlayers = playerNames.length; // จำนวนผู้เล่นทั้งหมด
    const playersPerGroup = groupGame.playerCreate; // จำนวนผู้เล่นในแต่ละกลุ่มจาก Firestore
    const numberOfGroups = groupGame.groupCreate; // จำนวนกลุ่มจาก Firestore
  
    // หากจำนวนผู้เล่นทั้งหมดน้อยกว่าจำนวนกลุ่ม ให้ใช้จำนวนผู้เล่นทั้งหมดเป็นจำนวนกลุ่ม
    const effectiveGroups = Math.min(numberOfGroups, totalPlayers);
  
    // คำนวณจำนวนผู้เล่นในแต่ละกลุ่ม
    let adjustedPlayersPerGroup;
    if (effectiveGroups > 0) {
      adjustedPlayersPerGroup = Math.ceil(totalPlayers / effectiveGroups);
    } else {
      adjustedPlayersPerGroup = 0; // ไม่มีผู้เล่น
    }
  
    const shuffledPlayers = [...playerNames].sort(() => 0.5 - Math.random());
    const newGroups = [];
  
    let index = 0;
    for (let i = 0; i < effectiveGroups; i++) {
      const groupName = `กลุ่ม ${i + 1}`;
      const members = shuffledPlayers.slice(index, index + adjustedPlayersPerGroup);
  
      const leader = members[0] || null; // กำหนดหัวหน้ากลุ่ม
      const memberCount = members.length; // นับจำนวนสมาชิกในกลุ่มนี้
      newGroups.push({ groupName, members, leader, memberCount });
  
      // อัปเดต Firestore สำหรับสมาชิกแต่ละคน
      for (const member of members) {
        const playerRef = query(groupPlayersCollectionRef, where('name', '==', member), where('pin', '==', pin));
        const playerSnapshot = await getDocs(playerRef);
  
        if (!playerSnapshot.empty) {
          const playerDoc = playerSnapshot.docs[0];
          const playerRefToUpdate = doc(groupPlayersCollectionRef, playerDoc.id);
          await updateDoc(playerRefToUpdate, {
            groupName,
            leader,
            playerCount: totalPlayers,
            groupCount: effectiveGroups,
            memberCount: memberCount
          });
        } else {
          await setDoc(doc(groupPlayersCollectionRef), {
            name: member,
            pin,
            groupName,
            leader,
            playerCount: totalPlayers,
            groupCount: effectiveGroups,
            memberCount: memberCount
          });
        }
      }
  
      index += adjustedPlayersPerGroup; // เพิ่ม index สำหรับกลุ่มถัดไป
    }
  
    const groupRef = doc(groupGamesCollection, pin);
    await setDoc(groupRef, { groups: newGroups }, { merge: true });
  
    setGroups(newGroups);
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
  
            <Box sx={{ border: '2px solid #4caf50', borderRadius: '4px', p: 3, mt: 2, backgroundColor: '#e8f5e9' }}>
              <Typography variant="h6" gutterBottom>
                จำนวนกลุ่มที่สร้าง: {groupGame.groupCreate}
              </Typography>
              <Typography variant="body1" gutterBottom>
                จำนวนผู้เล่นในแต่ละกลุ่ม: {groupGame.playerCreate} คน
              </Typography>
            </Box>
  
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button variant="contained" color="warning" onClick={handleRandomizeGroups} sx={{ width: '50%', fontFamily: 'Kanit, sans-serif', boxShadow: 3 }}>
                สุ่มกลุ่ม
              </Button>
            </Box>
  
            <div>
              {groups.length > 0 ? groups.map((group, index) => (
                <Box key={index} sx={{ mt: 3, p: 3, border: '2px solid #1976d2', borderRadius: 2, backgroundColor: '#e3f2fd' }}>
                  <Typography variant="h5" sx={{ color: '#1976d2' }}>{group.groupName}</Typography>
                  <Typography variant="body1">หัวหน้ากลุ่ม: <strong>{group.leader}</strong></Typography>
                  <Typography variant="body2">สมาชิก: {Array.isArray(group.members) ? group.members.join(', ') : 'ไม่มีสมาชิก'}</Typography>
                </Box>
              )) : <Typography variant="body1" sx={{ mt: 2 }}>ยังไม่มีการสุ่มกลุ่ม</Typography>}
            </div>
  
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

export default GamePinGroup;
