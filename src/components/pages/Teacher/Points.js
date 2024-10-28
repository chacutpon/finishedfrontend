import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { listUserTeacher } from "../../functions/authBackend";
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  Typography,
  Button,
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const Points = () => {
  const { user } = useSelector((state) => ({ ...state }));
  const [data, setData] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");

  useEffect(() => {
    loadData(user.user.token);
  }, [user.user.token]);

  const loadData = async (authtoken) => {
    try {
      const res = await listUserTeacher(authtoken);
      if (!res || !res.data) {
        console.error("No data returned from API");
        return;
      }

      const filterUser = res.data.filter((item) => item.role === "user");

      const updatedData = await Promise.all(
        filterUser.map(async (item) => {
          let totalScore = 0;
          let dailyScore = 0;
          let weeklyScore = 0;
          let monthlyScore = 0;
          let section = "";
          let countQuiz = 0; // จำนวนการเข้าร่วม quiz
          let countGroup = 0; // จำนวนการเข้าร่วม group game
          let countAsking = 0; // จำนวนการเข้าร่วม asking game
          let loginCount = 0; // จำนวนครั้งการล็อกอิน
          let quizTotalScore = 0; // คะแนนรวมจากกิจกรรมควิซ
          let askingTotalScore = 0; // คะแนนรวมจากกิจกรรมตอบคำถามสั้น
          // ดึงข้อมูลจาก Firestore สำหรับจำนวนครั้งการล็อกอิน
          const playerRef = doc(db, "players", item.email);
          const playerDoc = await getDoc(playerRef);
          if (playerDoc.exists()) {
            const playerData = playerDoc.data();
            loginCount = playerData.loginCount || 0; // ดึงจำนวนครั้งการล็อกอิน
          }

          // ดึงข้อมูลจาก game_players
          const scoresQueryGamePlayers = query(
            collection(db, "game_players"),
            where("userEmail", "==", item.email)
          );
          const scoresSnapshotGamePlayers = await getDocs(
            scoresQueryGamePlayers
          );

          scoresSnapshotGamePlayers.forEach((doc) => {
            const data = doc.data();
            totalScore += data.score || 0;
            dailyScore += data.dailyScore || 0;
            weeklyScore += data.weeklyScore || 0;
            monthlyScore += data.monthlyScore || 0;
            section = data.section || "";
            quizTotalScore += data.score || 0; // เพิ่มคะแนนจากควิซ
            if (data.gameType === "quiz" && data.pin) {
              countQuiz++; // เพิ่มจำนวนการเข้าร่วม quiz
            }
          });

          // ดึงข้อมูลจาก group_players
          const scoresQueryGroupPlayers = query(
            collection(db, "group_players"),
            where("userEmail", "==", item.email)
          );
          const scoresSnapshotGroupPlayers = await getDocs(
            scoresQueryGroupPlayers
          );

          scoresSnapshotGroupPlayers.forEach((doc) => {
            const data = doc.data();
            totalScore += data.score || 0;
            dailyScore += data.dailyScore || 0;
            weeklyScore += data.weeklyScore || 0;
            monthlyScore += data.monthlyScore || 0;
            section = data.section || "";

            if (data.gameType === "group" && data.pin) {
              countGroup++; // เพิ่มจำนวนการเข้าร่วม group game
            }
          });

          // ดึงข้อมูลจาก asking_players
          const scoresQueryAskingPlayers = query(
            collection(db, "asking_players"),
            where("userEmail", "==", item.email)
          );
          const scoresSnapshotAskingPlayers = await getDocs(
            scoresQueryAskingPlayers
          );

          scoresSnapshotAskingPlayers.forEach((doc) => {
            const data = doc.data();
            totalScore += data.score || 0;
            dailyScore += data.dailyScore || 0;
            weeklyScore += data.weeklyScore || 0;
            monthlyScore += data.monthlyScore || 0;
            section = data.section || "";
            askingTotalScore += data.score || 0; // เพิ่มคะแนนจาก asking game
            if (data.gameType === "asking" && data.pin) {
              countAsking++; // เพิ่มจำนวนการเข้าร่วม asking game
            }
          });

          return {
            ...item,
            totalScore,
            dailyScore,
            weeklyScore,
            monthlyScore,
            section,
            countQuiz,
            countGroup,
            countAsking, // จำนวนการเข้าร่วม asking game
            loginCount,
            quizTotalScore, // เพิ่มคะแนนรวมจากกิจกรรมควิซ
            askingTotalScore, // เพิ่มคะแนนรวมจากกิจกรรมตอบคำถามสั้น
          };
        })
      );

      setData(updatedData);
    } catch (err) {
      console.log(err.response ? err.response.data : err.message);
    }
  };

  const resetWeeklyScores = async () => {
    const scoresQuery = query(collection(db, "game_players"));
    const scoresSnapshot = await getDocs(scoresQuery);

    await Promise.all(
      scoresSnapshot.docs.map(async (doc) => {
        const userDocRef = doc.ref;
        await updateDoc(userDocRef, { weeklyScore: 0 });
      })
    );

    const updatedData = data.map((item) => ({ ...item, weeklyScore: 0 }));
    setData(updatedData);
  };

  const resetMonthlyScores = async () => {
    const scoresQuery = query(collection(db, "game_players"));
    const scoresSnapshot = await getDocs(scoresQuery);

    await Promise.all(
      scoresSnapshot.docs.map(async (doc) => {
        const userDocRef = doc.ref;
        await updateDoc(userDocRef, { monthlyScore: 0 });
      })
    );

    const updatedData = data.map((item) => ({ ...item, monthlyScore: 0 }));
    setData(updatedData);
  };

  const filteredData = selectedSection
    ? data.filter((item) => item.section === selectedSection)
    : data;

  return (
 <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          รายชื่อนักศึกษา
        </Typography>
        <FormControl sx={{ mt: 2, minWidth: 120 }}>
          <InputLabel>Section</InputLabel>
          <Select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <MenuItem value="">
              <em>ทั้งหมด</em>
            </MenuItem>
            {[...new Set(data.map((item) => item.section))]
              .sort()
              .map((section) => (
                <MenuItem key={section} value={section}>
                  {section}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ overflowX: "auto", padding: "20px", borderRadius: "10px" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "#2196f3" }}>
            <TableRow>
              {[
                "ลำดับที่",
                "ชื่อ",
                "section",
                "การเข้าร่วมกิจกรรมควิซ",
                "การเข้าร่วมกิจกรรมแบบกลุ่ม",
                "การเข้าร่วมกิจกรรมตอบคำถามสั้น",
                "คะแนนรวมควิซ",
                "คะแนนรวมถามตอบสั้น",
                "คะแนนรวม",
                "การเข้าร่วมชั้นเรียน",
              ].map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .sort((a, b) => a.section.localeCompare(b.section))
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell align="center">{item.countQuiz}</TableCell>
                  <TableCell align="center">{item.countGroup}</TableCell>
                  <TableCell align="center">{item.countAsking}</TableCell>
                  {/* <TableCell align="center">{item.weeklyScore}</TableCell> */}
                  <TableCell align="center">{item.quizTotalScore}</TableCell>{" "}
                  {/* แสดงคะแนนรวมควิซ */}
                  <TableCell align="center">{item.askingTotalScore}</TableCell>
                  <TableCell align="center">{item.totalScore}</TableCell>
                  <TableCell align="center">{item.loginCount}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ margin: "40px 0", textAlign: "center" }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "#1976d2", mb: 2 }}
        >
          กราฟสรุปภาพรวมของนักศึกษา
        </Typography>
        

  
<Box
  sx={{
    mb: 3,
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
<Typography sx={{ padding: "10px", fontWeight: "bold" }}>
  การเข้าร่วมกิจกรรมควิซ
</Typography>
  <BarChart
    width={700}
    height={300}
    data={filteredData}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar
      dataKey="countQuiz"
      fill="#ffc658"
      name="การเข้าร่วมกิจกรรมควิซ"
    />
  </BarChart>
</Box>

{/* คะแนนจากกิจกรรมควิซ */}

<Box
  sx={{
    mb: 3,
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
<Typography sx={{ padding: "10px", fontWeight: "bold" }}>
  คะแนนจากกิจกรรมควิซ
</Typography>
  <BarChart
    width={700}
    height={300}
    data={filteredData}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar
      dataKey="quizTotalScore"
      fill="#f31997"
      name="คะแนนจากกิจกรรมควิซ"
    />
  </BarChart>
</Box>

{/* การเข้าร่วมกิจกรรมตอบคำถามสั้น */}

<Box
  sx={{
    mb: 3,
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
<Typography sx={{ padding: "10px", fontWeight: "bold" }}>
  การเข้าร่วมกิจกรรมตอบคำถามสั้น
</Typography>
  <BarChart
    width={700}
    height={300}
    data={filteredData}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar
      dataKey="countAsking"
      fill="#ffcc99"
      name="การเข้าร่วมกิจกรรมตอบคำถามสั้น"
    />
  </BarChart>
</Box>

{/* คะแนนจากกิจกรรมตอบคำถามสั้น */}

<Box
  sx={{
    mb: 3,
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
<Typography sx={{ padding: "10px", fontWeight: "bold" }}>
  คะแนนจากกิจกรรมตอบคำถามสั้น
</Typography>
  <BarChart
    width={700}
    height={300}
    data={filteredData}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar
      dataKey="askingTotalScore"
      fill="#5a0017"
      name="คะแนนจากกิจกรรมตอบคำถามสั้น"
    />
  </BarChart>
</Box>

{/* การเข้าร่วมกิจกรรมแบบกลุ่ม */}

<Box
  sx={{
    mb: 3,
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
<Typography sx={{ padding: "10px", fontWeight: "bold" }}>
  การเข้าร่วมกิจกรรมแบบกลุ่ม
</Typography>
  <BarChart
    width={700}
    height={300}
    data={filteredData}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar
      dataKey="countGroup"
      fill="#d0ed57"
      name="การเข้าร่วมกิจกรรมแบบกลุ่ม"
    />
  </BarChart>
</Box>

{/* คะแนนรวม */}

<Box
  sx={{
    mb: 3,
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
<Typography sx={{ padding: "10px", fontWeight: "bold" }}>
  คะแนนรวม
</Typography>
  <BarChart
    width={700}
    height={300}
    data={filteredData}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="totalScore" fill="#8884d8" name="คะแนนรวม" />
  </BarChart>
</Box>

{/* จำนวนครั้งการล็อกอิน */}

<Box
  sx={{
    mb: 3,
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
  }}
>
<Typography sx={{ padding: "10px", fontWeight: "bold" }}>
  จำนวนครั้งการล็อกอิน
</Typography>
  <BarChart
    width={700}
    height={300}
    data={filteredData}
    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar
      dataKey="loginCount"
      fill="#ff7300"
      name="จำนวนครั้งการล็อกอิน"
    />
  </BarChart>
</Box>


        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            component={Link}
            to="/teacher/index"
            variant="contained"
            color="error"
            sx={{
              borderRadius: "20px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
              textTransform: "none",
            }}
          >
            กลับ
          </Button>
        </Box>
      </Box>
      </>
  );
};

export default Points;
