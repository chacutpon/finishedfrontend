import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listUserAdmin, removeUser } from '../../functions/authBackend';
import { Table, TableHead, TableRow, TableBody, TableCell, Paper, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import 'moment/locale/th';
import { db } from "../../firebase"; // นำเข้า db จาก firebase
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

const HomepageAdmin = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData(user.user.token);
  }, []);

  const loadData = (authtoken) => {
    listUserAdmin(authtoken)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };
  const handleRemoveUser = async (id, email) => {
    if (window.confirm('แน่ใจนะว่าจะลบ!')) {
      try {
        // ลบจาก MongoDB
        await removeUser(user.user.token, id);
        console.log("User removed from MongoDB");
  
        // ลบจาก Firestore
        await removeFirestoreUser(email);
        console.log("User removed from Firestore");
  
        // โหลดข้อมูลใหม่
        loadData(user.user.token);
      } catch (err) {
        console.log(err.response);
      }
    }
  };
  const removeFirestoreUser = async (email) => {
    const collectionsToCheck = ["players", "group_players", "game_players"];

  const deletePromises = collectionsToCheck.map(async (collectionName) => {
    const collectionRef = collection(db, collectionName);

    // ตรวจสอบ collection ที่มีฟิลด์ที่แตกต่างกัน
    let q;
    if (collectionName === "players") {
      q = query(collectionRef, where("email", "==", email)); // ใช้ 'email' สำหรับ collection 'users'
    } else {
      q = query(collectionRef, where("userEmail", "==", email)); // ใช้ 'userEmail' สำหรับ collection 'group_players' และ 'game_players'
    }

    const snapshot = await getDocs(q);

    const deleteCollectionPromises = snapshot.docs.map(async (userDoc) => {
      await deleteDoc(doc(collectionRef, userDoc.id)); // ลบเอกสารจาก Firestore
    });

    return Promise.all(deleteCollectionPromises); // รอให้การลบทั้งหมดเสร็จสิ้น
  });

  await Promise.all(deletePromises); // รอให้การลบทั้งหมดในทุก collection เสร็จสิ้น
};

  // กำหนดสีพื้นหลังของ role ตามเงื่อนไข
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'teacher':
        return 'green';
      case 'user':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Paper
      sx={{
        width: '90%',
        margin: 'auto',
        marginTop: '20px',
        padding: '20px',
      }}
    >
      <Typography variant="h4" align="center" sx={{ marginBottom: '20px' }}>
        รายการผู้ใช้
      </Typography>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ backgroundColor: 'primary.main' }}>
          <TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ลำดับที่</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชื่อ</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่เข้าร่วม</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>เข้าร่วมล่าสุดเมื่อ</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>จัดการผู้ใช้</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell align="">{index + 1}</TableCell>
              <TableCell align="">{item.name}</TableCell>
              <TableCell align="">{item.email}</TableCell>

              {/* ตกแต่งสีพื้นหลังตาม role */}
              <TableCell align="center">
                <Box
                  sx={{
                    backgroundColor: getRoleColor(item.role),
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {item.role}
                </Box>
              </TableCell>

              <TableCell align="center">
                {moment(item.createdAt).locale('th').format('LL')}
              </TableCell>
              <TableCell align="center">
                {moment(item.updatedAt).locale('th').fromNow()}
              </TableCell>
              <TableCell align="center">
                <IconButton onClick={() => handleRemoveUser(item._id, item.email)}>
                  <DeleteIcon sx={{ color: 'error.main' }} fontSize="large" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default HomepageAdmin;
