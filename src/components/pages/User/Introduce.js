import React from 'react';
import { Typography, Paper, Box, List, ListItem, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const Introduce = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleBackClick = () => {
    navigate('/user/index'); // Navigate to the user/index page
  };

  return (
    <Box sx={{ width: '100%', backgroundColor: '#f5f5f5', p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: '#fff' }}>
        {/* Replaced div with Typography for consistent styling */}
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center', fontSize: '3rem' }} 
        >
          เมื่อ login เข้ามา
        </Typography>      
        <Typography 
          variant="body1" 
          paragraph 
          sx={{ lineHeight: 1.8, fontSize: '1.5rem', mb: 2 }} 
        >
          หน้าเข้าร่วมกิจกรรมจะเห็นชื่อผู้เล่นและ pin ชื่อผู้เล่นสามารถกรอกอะไรก็ได้ที่ตัวเองอยากตั้งโดยไม่ให้คนอื่นรู้หรือจะตั้งให้คนอื่นรู้ก็ได้และในส่วนของ pin ต้องรออาจารย์ให้ pin ผ่านทางหน้าจอของอาจารย์ก่อนจากนั้นถึงจะกดเข้าร่วมกิจกรรมได้
        </Typography>
        <Divider />
       
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center', fontSize: '3rem' }} 
        >
          วัตถุประสงค์ของกิจกรรม
        </Typography>
        <Typography 
          variant="body1" 
          paragraph 
          sx={{ lineHeight: 1.8, fontSize: '1.5rem' }} 
        >
          กิจกรรมนี้จัดทำมาเพื่อให้นักศึกษามีส่วนร่วมในการเรียนมากขึ้นมีความสนใจและสนุกไปกับกิจกรรมที่ได้เข้าร่วมมากขึ้นโดยทำให้เหมือนเป็นการเล่นเกมเพื่อให้นักศึกษารู้สึกมีความสนใจในการเรียนและกระตุ้น
          เพื่ออยากให้เอาชนะและเป็นที่ 1 ในหน้า scoreboard โดยไม่มีผู้ใดรู้ว่าเราเป็นใครเพื่อป้องกันความไม่กล้าแสดงออกของนักศึกษาโดยที่นักศึกษาจะตั้งชื่ออะไรก็ได้
        </Typography>
       
        <Divider />
       
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: '#1976d2', textAlign: 'center', fontSize: '2.5rem' }} 
        >
          กิจกรรมทั้งหมดมี 3 กิจกรรมหลักๆคือ
        </Typography>



        <List>
          <ListItem sx={{ display: 'block', mb: 3 }}>
            <Typography 
              variant="h5" 
              component="h3" 
              sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }} 
            >
              1. กิจกรรมตอบคำถามสั้น
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              เป็นกิจกรรมที่ให้นักศึกษาพิมตอบคำถามที่อาจารย์ได้สร้างขึ้นมาตามจำนวนข้อเมื่อตอบถูกจะนับคะแนนเป็น 1 คะแนนต่อ 1 ข้อ
            </Typography>
            <Typography 
              variant="body2" 
              paragraph 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              นักศึกษาจะได้เห็นคำถามจากหน้าจอของอาจารย์และต้องพิมคำตอบให้ถูกต้องทุกคำ (จะคล้ายๆ เกมฝึกพิมที่ต้องพิมให้ถูกทุกตัวถึงจะได้คะแนนแต่กรณีตัวพิมเล็กตัวพิมใหญ่จะนับคะแนนอยู่ดี)
              เมื่อถูกต้องจะได้ 1 คะแนนแล้วก็ทำกิจกรรมไปให้จนเสร็จสิ้นเป็นอันจบกิจกรรม
            </Typography>
          </ListItem>

          <Divider />

          <ListItem sx={{ display: 'block', mb: 3 }}>
            <Typography 
              variant="h5" 
              component="h3" 
              sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }} 
            >
              2. กิจกรรมตอบคำถามแบบกลุ่ม
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              เป็นกิจกรรมที่จะให้นักศึกษาเข้าร่วมห้องแล้วทำการรออาจารย์กดสุ่มเพื่อที่จะสุ่มนักศึกษาให้อยู่ในกลุ่มที่สร้างและระบบจะทำการสุ่มหัวหน้ากลุ่มในกลุ่มนั้นๆอีกด้วย
            </Typography>
            <Typography 
              variant="body2" 
              paragraph 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              นักศึกษาจะได้เห็นคำถามจากหน้าจอของอาจารย์และต้องพิมคำตอบแล้วส่งคำตอบที่ปุ่มกดส่งจากนั้นเมื่อสมาชิกทุกคนในกลุ่มพิมเสร็จแล้วกดส่งจะมีปุ่มโหวตว่านักศึกษาในกลุ่มนั้นๆชอบคำตอบของใครในสมาชิกกลุ่ม
              แต่สมาชิกในกลุ่มจะไม่รู้ว่าผลโหวตมีกี่คะแนนแล้วเพื่อเป็นการอยากรู้ว่ามั่นใจในคำตอบของตนเองหรือเจอคำตอบที่ดีกว่าเพราะสามารถโหวตได้เพียง 1 choice คำตอบต่อ 1 ข้อคำถามเท่านั้นจากนั้นเมื่อสมาชิกโหวตเสร็จแล้วหัวหน้าจะเห็นคำตอบที่ถูกโหวตมากที่สุดและเลือกคำตอบตามแต่หัวหน้าจะพิจารณา (สามารถเลือกได้มากกว่า 1 คำตอบ) แล้วทำการกดส่งไปให้อาจารย์ ในส่วนของกิจกรรมนี้จะไม่มีผิดมีถูก อาจารย์จะเป็นคนพิจารณาคำตอบของนักศึกษาเอง
            </Typography>
          </ListItem>

          <Divider />

          <ListItem sx={{ display: 'block', mb: 3 }}>
            <Typography 
              variant="h5" 
              component="h3" 
              sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }} 
            >
              3. กิจกรรมควิซ
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              เป็นกิจกรรมที่ให้นักศึกษาทุกคนตอบคำถามโดยการเลือก choice ที่ถูกต้องเมื่อตอบถูกจะนับคะแนนเป็น 1 คะแนนต่อ 1 ข้อ
            </Typography>
            <Typography 
              variant="body2" 
              paragraph 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              นักศึกษาจะได้เห็นคำถามจากหน้าจอของอาจารย์จากนั้นนักศึกษาต้องเลือกคำตอบที่คิดว่าตัวเองถูกในส่วนของหน้าจออาจารย์ในข้อนั้นจะเป็นคนบอกเองว่าถูกหรือไม่ โดยจะมีคะแนนโชว์บนหน้าจอของอาจารย์ตามด้วยเวลาที่ทำ
              โดยแต่ละข้อจะมีการจับเวลาข้อละ 15 วินาทีแล้วให้นักศึกษาตอบให้ทันเวลาถ้าไม่ทันจะนับเป็น 0 คะแนนในข้อนั้นทันที
            </Typography>
          </ListItem>

          <Divider />


          <ListItem sx={{ display: 'block', mb: 3 }}>
            <Typography 
              variant="h5" 
              component="h3" 
              sx={{ fontWeight: 'bold', color: '#333', fontSize: '2rem' }} 
            >
              4. กิจกรรมคำถามท้ายคาบ
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              เป็นกิจกรรมที่ให้นักศึกษาทุกคนที่มีข้อสงสัยในคาบเรียนแต่ไม่กล้าถามต่อหน้าอาจารย์หรือต่อหน้าเพื่อนๆ
            </Typography>
            <Typography 
              variant="body2" 
              paragraph 
              sx={{ lineHeight: 1.6, fontSize: '1.25rem', mt: 1 }} 
            >
              โดยกิจกรรมนี้เมื่อจบคาบให้กรอกที่ PIN เป็นตัวเลข 123456 เพื่อเข้าไปหน้าคำถามที่สงสัยในคาบเรียนโดยนักเรียนสามารถถามอาจารย์กี่คำถามก็ได้แล้วกดส่งไป
              โดยคำถามจะแสดงชื่อที่นักเรียนตั้งไว้กับคำถามที่ถามไว้โดยอาจารย์จะเป็นคนตอบในห้องคลายข้อสงสัยในคำถามนั้นได้โดยที่จะไม่มีใครรู้ว่าใครเป็นคนถาม
            </Typography>
          </ListItem>
        </List>

        {/* Back Button */}
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
};

export default Introduce;
