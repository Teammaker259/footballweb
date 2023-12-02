import React, { Component } from "react";
import dataJson from "../../data/en.1.json";
import styled from "styled-components";
import LeagueTableRow from "./league-table-row";
import FlipMove from "react-flip-move";
import RoundSelector from "../round-selector/index";

const newTeam = {
  won: 0,
  drawn: 0,
  lost: 0,
  goalFor: 0,
  goalAgainst: 0,
  point: 0,
};
// const redis = require('redis');

// // 创建一个 Redis 客户端
// const client = redis.createClient({
//   host: 'r-bp1bb6cuwve8pjtosrpd.redis.rds.aliyuncs.com', // Redis服务器的主机名
//   port: 6379,        // Redis服务器的端口
//   password: "Solexbigdata!"
// });

// // 连接到 Redis 服务器
// client.on('connect', () => {
//   console.log('Connected to Redis');
// });

class LeagueTable extends Component {
  constructor() {
    super();
    this.state = {
      count:0,
      round: 38,
      comment: "", // 初始化评论输入框的状态
      comments: [], // 用于保存评论的数组
    };
    this.fetchdata();
  }

  onRoundChange = (num) => {
    this.setState({ round: num });
  };
  renderRow = (json) => {
    let teams = {};
    for (let i = 0; i < this.state.round; i++) {
      const round = json[i];
      round.forEach(function (match) {
        const team1 = match.substring(0, 3);
        const score1 = match.substring(3, 4) * 1; // performant string to number conversion
        const score2 = match.substring(5, 6) * 1;
        const team2 = match.substring(6, 9);
        if (!teams[team1]) {
          teams[team1] = Object.assign({}, newTeam);
        }
        if (!teams[team2]) {
          teams[team2] = Object.assign({}, newTeam);
        }
        teams[team1].goalFor += score1;
        teams[team2].goalFor += score2;
        teams[team1].goalAgainst += score2;
        teams[team2].goalAgainst += score1;
        if (score1 - score2 > 0) {
          teams[team1].won += 1;
          teams[team2].lost += 1;
          teams[team1].point += 3;
        } else if (score1 - score2 === 0) {
          teams[team1].drawn += 1;
          teams[team2].drawn += 1;
          teams[team1].point += 1;
          teams[team2].point += 1;
        } else {
          teams[team1].lost += 1;
          teams[team2].won += 1;
          teams[team2].point += 3;
        }
      }, this);
    }
    const sortedTeams = Object.entries(teams).sort((teamA, teamB) => {
      if (teamA[1].point > teamB[1].point) {
        return -1;
      } else if (teamA[1].point < teamB[1].point) {
        return 1;
      } else {
        return -1;
      }
    });
    return sortedTeams.map((team, index) => (
      <LeagueTableRow
        {...team[1]}
        key={team[0]}
        position={index + 1}
        name={team[0]}
      />
    ));
  };

  handleCommentChange = (e) => {
    this.setState({ comment: e.target.value });
  };

  fetchdata = async () => {
    const response = await fetch("http://localhost:3001/comment");
    const data = await response.json();
    console.log(data);
    
    for(let i=0;i < data.length; i++){
      const { comment, comments } = this.state;
      // console.log(data[i].text);
      // 修改date格式, 将其转化为2023/10/25 15:48:47
      const date = data[i].date;
      const year = date.substring(0,4);
      const month = date.substring(5,7);
      const day = date.substring(8,10);
      const hour = date.substring(11,13);
      const minute = date.substring(14,16);
      const second = date.substring(17,19);
      const newDate = year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;

      const newComment = {
        text: data[i].comment,
        timestamp: newDate,
      };
      this.setState({
        comment: "", // 清空评论输入框
        comments: [...comments, newComment], // 将新评论添加到评论列表
      });
    }
    this.setState({count:1});
    console.log("success");
    console.log(this.state.comments);
  };


  handleCommentSubmit = () => {
    if(this.state.count === 0) this.handleUpdate();
    const { comment, comments } = this.state;
    if (comment) {
      const newComment = {
        text: comment,
        timestamp: new Date().toLocaleString(),
      };
      this.setState({
        comment: "", // 清空评论输入框
        comments: [...comments, newComment], // 将新评论添加到评论列表
      });
    }
  };

  render() {
    return (
      <body background="./static/4.jpg">
        <div>
          <table>
            <tr>
              <td>
                <Table>
                  <RoundSelector onRoundChange={this.onRoundChange} />
                  <FlipMove duration={750} easing="ease-out">
                    <TableHeader />
                    {this.renderRow(dataJson)}
                  </FlipMove>
                </Table>
              </td>
              <td>
                <CommentContainer>
                  
                  <input
                    type="text"
                    placeholder="输入评论"
                    style={{ width: "500px", height: "50px" }}
                    onChange={this.handleCommentChange}
                    value={this.state.comment}
                  />
                  <button
                    onClick={this.handleCommentSubmit}
                    style={{ width: "300px", height: "35px" }}
                  >
                    提交评论
                  </button>
                  <div id="commentList">
                    <h2>评论区</h2>
                    <Box>
                      {this.state.comments.map((comment, index) => (
                        <div key={index}>
                          <p
                            style={{
                              display: "inline-block",
                              color: "#000000",
                            }}
                          >
                            {comment.timestamp}
                          </p>
                          <p
                            style={{
                              display: "inline-block",
                              color: "#000000",
                            }}
                          >
                            {" "}
                            ——{" "}
                          </p>
                          <p
                            style={{
                              display: "inline-block",
                              color: "#000000",
                            }}
                          >
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </Box>
                  </div>
                  <a href="https://11builder.com/">
                    <button style={{ width: "300px", height: "35px" }}>
                      气死了,我要当教练
                    </button>
                  </a>
                </CommentContainer>
              </td>
              <td>
                <CommentContainer>
                  <div>
                    <h2>友情链接</h2>
                    <table>
                      <tr>
                        <th>网站名称</th>
                        <th>链接</th>
                      </tr>
                      <tr>
                        <td>ESPN FC</td>
                        <td>
                          <a href="https://global.espn.com/football/">
                            <font color="red">ESPN FC</font>
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Sky Sports</td>
                        <td>
                          <a href="https://www.skysports.com/football">
                            Sky Sports
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Goal.com</td>
                        <td>
                          <a href="https://www.goal.com/en">Goal.com</a>
                        </td>
                      </tr>
                      <tr>
                        <td>FIFA</td>
                        <td>
                          <a href="https://www.fifa.com/">FIFA</a>
                        </td>
                      </tr>
                      <tr>
                        <td>FIFA World Cup</td>
                        <td>
                          <a href="https://www.fifa.com/worldcup/">
                            FIFA World Cup
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Premier League</td>
                        <td>
                          <a href="https://www.premierleague.com/">
                            Premier League
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>La Liga</td>
                        <td>
                          <a href="https://www.laliga.com/en-GB">La Liga</a>
                        </td>
                      </tr>
                      <tr>
                        <td>Bundesliga</td>
                        <td>
                          <a href="https://www.bundesliga.com/en/bundesliga">
                            Bundesliga
                          </a>
                        </td>
                      </tr>
                    </table>
                  </div>
                </CommentContainer>
              </td>
            </tr>
          </table>
        </div>
      </body>
    );
  }
}

export default LeagueTable;

const Table = styled.div`
  letter-spacing: 0.02em;
  display: flex;
  flex-direction: column;
`;

const TableHeader = () => (
  <div style={{ display: "flex", flexDirection: "row-reverse" }}>
    <Th>Pl</Th>
    <Th>W</Th>
    <Th>D</Th>
    <Th>L</Th>
    <Th>GF</Th>
    <Th>GA</Th>
    <Th>GD</Th>
    <Th>Pts</Th>
  </div>
);

const Th = styled.div`
  width: 2em;
  padding: 0.5em;
  border: solid #360037 1px;
  border-right: 0;
  font-weight: 400;
`;
// 添加样式
const CommentContainer = styled.div`
  margin-top: 20px; /* 调整垂直间距，根据需要更改值 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 可以根据需要更改对齐方式 */
`;
const Box = styled.div`
  width: 500px; /* 框的宽度 */
  height: 500px; /* 框的高度 */
  border: 5px solid #000; /* 边框：2像素宽，黑色 */
  padding: 20px; /* 内边距：在内容和边框之间增加20像素的间距 */
  background-color: #ffffff;
`;
