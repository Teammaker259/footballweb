const express = require("express");
const app = express();
// 跨域配置
const cors = require("cors");
app.use(cors());

app.use(express.urlencoded({ extended: true })); //配置post请求
app.use(express.json());

const mysql = require("mysql");
// 创建数据库连接
const connection = mysql.createConnection({
  host: "rm-cn-9lb3g93gs0003jmo.rwlb.rds.aliyuncs.com",
  port: "3306",
  user: "root",
  password: "Solexfont!",
  database: "comments",
});

// 连接到数据库
connection.connect((error) => {
  if (error) {
    console.error("Failed to connect to MySQL database:", error);
  } else {
    console.log("Connected to MySQL database");
  }
});

connection.on("error", (err) => {
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("MySQL connection was lost. Reconnecting...");
    connection.connect(); // 重新连接
  } else {
    console.error("MySQL error:", err);
  }
});

// 在路由处理程序中使用数据库连接进行查询等操作
app.get("/comment", (req, res) => {
  connection.query("SELECT * FROM comment", (error, results) => {
    if (error) {
      console.error("Error executing MySQL query:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    } else {
      res.json(results);
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const port = 3002;

app.post("/update", (req, res) => {
  // 处理 POST 请求的逻辑
  const { num, date, comment } = req.body;
  console.log(num, date, comment);
  connection.query(
    "INSERT INTO comment (num, comment, date) VALUES (?,?,?)", [num, comment, date],
    (error, results) => {
      if (error) {
        console.error("Error executing MySQL query:", error);
      } else {
        console.log("Successfully inserted into MySQL database");
      }
    }
  );
  res.json({ success: true, message: "更新成功" });
});

app.post("/delete", (req, res) => {
  // 处理 POST 请求的逻辑
  const { num } = req.body;
  console.log(num);
  connection.query(
    "DELETE FROM comment WHERE num = ?", [num - 1],
    (error, results) => {
      if (error) {
        console.error("Error executing MySQL query:", error);
      } else {
        console.log("Successfully deleted from MySQL database");
      }
    }
  );
  res.json({ success: true, message: "删除成功" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
