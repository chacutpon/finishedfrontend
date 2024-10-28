import React from 'react';
import { Typography, Paper, Box, List, ListItem, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Introduce = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleBackClick = () => {
    navigate('/teacher/index'); // Navigate to the user/index page
  };
  return (
    <Box sx={{ width: '100%', backgroundColor: '#f5f5f5', p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fff' }}>
        
        {/* Title */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center', fontSize: '2.5rem' }}>
          กิจกรรมทั้งหมดมี 3 กิจกรรมหลักๆคือ
        </Typography>

        {/* Activities List */}
        <List>
          <ListItem sx={{ display: 'block', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }}>
              1. กิจกรรมตอบคำถามสั้น
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }}>
              การสร้างกิจกรรมตอบคำถามสั้นนั้นจะเห็นตามหน้าเลยคือมี:
            </Typography>
            <List sx={{ pl: 4 }}>
              <ListItem>- ชื่อหัวข้อเรื่อง: ทำการตั้งชื่อหัวข้อเรื่องที่จะสร้าง</ListItem>
              <ListItem>- section: เลือก section ที่จะใช้</ListItem>
              <ListItem>- คำถาม: สร้างคำถามและเพิ่มคำถามได้ที่ปุ่มเพิ่มคำถาม เมื่อสร้างจนพอใจแล้วกดสร้างกิจกรรม</ListItem>
              <ListItem>- เพิ่มคำตอบที่ถูกต้อง: สามารถเพิ่มคำตอบที่ถูกต้องเพื่อเป็นการกำหนดคำตอบที่ถูกต้องให้กับนักเรียนซึ่งสามารถเพิ่มคำตอบที่ถูกต้องได้มากกว่า 1 ข้อกรณีมีหลายคำตอบในข้อนั้น</ListItem>
              <ListItem>- คำถาม: สร้างคำถามและเพิ่มคำถามได้ที่ปุ่มเพิ่มคำถาม เมื่อสร้างจนพอใจแล้วกดสร้างกิจกรรม</ListItem>
              <ListItem>- เลือกกิจกรรมตอบคำถามสั้นที่เคยสร้าง: ดูคำถาม, ลบคำถาม, และเลือกคำถามเก่ามาใช้ได้ เลือกรายการคำถามตาม section ได้</ListItem>
            </List>
          </ListItem>
          
          <Divider />

          <ListItem sx={{ display: 'block', mt: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }}>
              2. กิจกรรมตอบคำถามแบบกลุ่ม
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }}>
              การสร้างกิจกรรมตอบคำถามแบบกลุ่มนั้นจะมี:
            </Typography>
            <List sx={{ pl: 4 }}>
              <ListItem>- ชื่อหัวข้อเรื่อง: ทำการตั้งชื่อหัวข้อเรื่องที่จะสร้าง</ListItem>
              <ListItem>- section: เลือก section ที่จะใช้</ListItem>
              <ListItem>- จำนวนกลุ่ม และ จำนวนคนต่อกลุ่ม: ระบุจำนวนตามต้องการ, ระบบจะคำนวณกลุ่มที่มีเศษให้อัตโนมัติ</ListItem>
              <ListItem>- คำถาม: สร้างคำถามและเพิ่มคำถามได้ที่ปุ่มเพิ่มคำถาม เมื่อสร้างจนพอใจแล้วกดสร้างกิจกรรม</ListItem>
              <ListItem>- เลือกกิจกรรมตอบคำถามแบบกลุ่มที่เคยสร้าง: ดูคำถาม, ลบคำถาม, และเลือกคำถามเก่ามาใช้ได้ เลือกรายการคำถามตาม section ได้</ListItem>
            </List>
          </ListItem>
          
          <Divider />

          <ListItem sx={{ display: 'block', mt: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }}>
              3. กิจกรรมควิซ
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }}>
              การสร้างกิจกรรมควิซนั้นจะมี:
            </Typography>
            <List sx={{ pl: 4 }}>
              <ListItem>- ชื่อหัวข้อเรื่อง: ทำการตั้งชื่อหัวข้อเรื่องที่จะสร้าง</ListItem>
              <ListItem>- section: เลือก section ที่จะใช้</ListItem>
              <ListItem>- คำถาม: สร้างคำถามและเพิ่มคำถามได้ที่ปุ่มเพิ่มคำถาม เมื่อสร้างจนพอใจแล้วกดสร้างกิจกรรม</ListItem>
              <ListItem>- เลือกกิจกรรมควิซที่เคยสร้าง: ดูคำถาม, ลบคำถาม, และเลือกคำถามเก่ามาใช้ได้ เลือกรายการคำถามตาม section ได้</ListItem>
            </List>
          </ListItem>

          <Divider />
          
          <ListItem sx={{ display: 'block', mt: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }}>
              4. กิจกรรมคำถามท้ายคาบ
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }}>
              ในส่วนของกิจกรรมคำถามท้ายคาบนั้นจะเป็นการดูคำถามของนักเรียนที่สงสัยในคาบเรียนโดยนักเรียนจะเป็นคนพิมคำถามมาโดยอาจารย์จะรู้หรือไม่รู้ว่านักเรียนเป็นใครเพราะนักเรียนจะตั้งชื่ออะไรก็ได้เพื่อป้องกันความไม่กล้าแสดงออกของนักเรียนบางคน
              ซึ่งขึ้นอยู่กับนักเรียนว่าอยากให้อาจารย์รู้ไหมโดยอาจารย์ก็จะเป็นคนตอบคำถามที่นักเรียนสงสัยนั้นเองในห้องและในแต่ละคำถามมีปุ่มลบคำถามเมื่ออาจารย์ตอบคำถามแล้วก็สามารถลบออกได้เลย
            </Typography>

          </ListItem>
        </List>

        {/* Additional Notes */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mt: 4, mb: 2 }}>
          หมายเหตุ
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.25rem' }}>
          - หลังจากสร้างกิจกรรมหรือเลือกคำถามที่เคยสร้าง ระบบจะพานักเรียนไปสู่หน้ารอ เพื่อให้กรอกโค้ดที่อาจารย์สร้างไว้ กิจกรรมตอบคำถามแบบกลุ่มจะมีปุ่มสุ่มกลุ่มและหัวหน้าอัตโนมัติ<br />
          - section: ต้องมั่นใจว่านักเรียนอยู่ใน section นั้นแล้ว เพราะระบบจะบันทึก section และไม่ว่าเข้าร่วมกิจกรรมไหนจะอยู่ section นั้นตลอดเวลา ไม่สามารถเข้าร่วม section อื่นได้<br />
          - ชื่อหัวข้อเรื่อง: การตั้งชื่อหัวข้อเรื่องมีความสำคัญ เนื่องจากจะใช้เป็นชื่อที่ทำการแสดงสำหรับเลือกคำถามที่เคยสร้างได้
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleBackClick} 
            sx={{ backgroundColor: '#1976d2', color: '#fff', fontSize: '1.25rem' }}
          >
            กลับ
          </Button>
        </Box>
      </Paper>
    </Box>

  );
}

export default Introduce;
