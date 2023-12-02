import React, { Component } from "react";
import dataJson from "../../data/en.1.json";
import styled from "styled-components";
import LeagueTableRow from "./league-table-row";
import FlipMove from "react-flip-move";
import RoundSelector from "../round-selector/index";
import window from "global";
import { warn } from "next/dist/lib/utils";

const newTeam = {
  won: 0,
  drawn: 0,
  lost: 0,
  goalFor: 0,
  goalAgainst: 0,
  point: 0,
};

const images = [
  { src: "static/ESPN.jpg", link: 'https://global.espn.com/football/' },
  { src: 'static/goal.png', link: 'https://www.goal.com/en' },
  { src: "static/skysports.jpg", link: "https://www.skysports.com/football" },
  { src: 'static/FIFA.png', link: 'https://www.fifa.com/fifaplus/en' },
  { src: 'static/FIFAworld.png', link: 'https://www.fifa.com/worldcup/' }
];
const news = [
  {
    date: "04/11/23 10:30pm",
    image:"https://e1.365dm.com/23/11/384x216/skysports-gary-neville-arsenal_6348905.jpg?20231104222249",
    link: "https://www.skysports.com/football/news/29326/13000920/the-gary-neville-podcast-var-chaos-at-st-james-park-why-arsenal-need-a-striker-rashfords-birthday-celebrations",
    title:"The Gary Neville Podcast"
  },
  {
    date: "04/11/23 11:00pm",
    image: "https://e2.365dm.com/19/10/384x216/skysports-paper-talk-papers_4819668.jpg?20200516213727",
    link: "https://www.skysports.com/football/news/30778/13000923/manchester-united-want-striker-gabriel-barbosa-in-january-and-willing-to-offer-antony-in-part-exchange-on-loan-paper-talk",
    title: "Papers: Man Utd want Barbosa and willing to offer Antony loan sweetener"
  },
];


class LeagueTable extends Component {
  constructor() {
    super();
    this.state = {
      commentIndex: 10,
      count:0,
      length:0,
      round: 38,
      comment: "", // 初始化评论输入框的状态
      comments: [], // 用于保存评论的数组
      currentImage: 0,
      currentnews:[],
      currentnewsindex:0,
    };
    this.fetchdata();
    this.getnews();
    this.componentDidMount();
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

  fetchdata1 = async (comment, date) => {
    const response1 = await fetch("http://localhost:3002/comment");
    const data1 = await response1.json();
    console.log(data1.length)
    this.setState({ length:data1.length})
    const response = await fetch("http://localhost:3002/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ num: this.state.length, comment: comment, date: date.toLocaleString()}),
    });
    this.setState({ length:this.state.length + 1, commentIndex:this.state.length})
    const data = await response.json();
    console.log("post", data);
    // window.location.reload();
    // console.log("length:", data1.length)
  };


  fetchdata = async () => {
    const response = await fetch("http://localhost:3002/comment");
    const data = await response.json();
    console.log(data.length);
    const tmplen = data.length;
    
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
    this.setState({count:1, length:tmplen, commentIndex:tmplen});
    // console.log("success");
    console.log("length:", this.state.length)
    // window.location.reload();
    // console.log(this.state.comments);
  };


  handleCommentSubmit = async() => {
    const { comment, comments } = this.state;
    if (comment) {
    
      const newComment = {
        text: comment,
        timestamp: new Date().toLocaleString(),
      };

      const date = new Date();
      this.fetchdata1(comment, date);

      this.setState({
        comment: "", // 清空评论输入框
        comments: [...comments, newComment], // 将新评论添加到评论列表
      });
    }
    // const dataToUpdate = { num: this.state.length + 1, comment: comment, date: new Date().toLocaleString() };
    // this.fetchdata1();
  };
  showPreviousComments = () => {
    const newIndex = this.state.commentIndex - 10;
    if (newIndex >= 10) {
      this.setState({ commentIndex: newIndex + 10 });
    } else {
      this.setState({ commentIndex: 10 });
    }
    console.log(this.state.commentIndex);
  };
  frontComments = () => {
    this.setState({ commentIndex: 10 });
    console.log(this.state.commentIndex);
  }
  backComments = () => {
    if(this.state.comments.length < 10) this.setState({ commentIndex: this.state.comments.length});
    else this.setState({ commentIndex: this.state.comments.length});
    console.log(this.state.commentIndex);
  }
  showNextComments = () => {
    const newIndex = this.state.commentIndex + 10;
    if (newIndex < this.state.comments.length) {
      this.setState({ commentIndex: newIndex });
    } else {
      this.setState({ commentIndex: this.state.comments.length});
    }
    console.log(this.state.commentIndex);
  };
  deletelast = async (comment, date) => {
    const response1 = await fetch("http://localhost:3002/comment");
    const data1 = await response1.json();
    this.setState({length:data1.length})
    if(this.state.length <= 11) return;
    const response = await fetch("http://localhost:3002/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ num: this.state.length}),
    });
    this.setState({length:this.state.length - 1, commentIndex:this.state.length - 1})
    const data = await response.json();
    // window.location.reload();
    console.log("post", data);
  };

  showImage = () => {
    this.setState({currentImage:(this.state.currentImage + 1) % 5})
    if(this.state.currentnews.length > 2)
    this.setState({currentnewsindex:(this.state.currentnewsindex + 1) % this.state.currentnews.length})
    else this.setState({currentnewsindex:(this.state.currentnewsindex + 1) % 2})
    // console.log(this.state.currentImage)
  };

  componentDidMount = () => {
    setInterval(() => this.showImage(), 5000);
  }

  getnews = async() => {
    const response = await fetch("http://localhost:3002/news", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    // 构建队列newqueue
    for(let i=0; i<data.length; i++){
      const newnews = {
        image: data[i].image,
        link: data[i].link,
        title: data[i].title,
        date: data[i].date,
      }
      news.push(newnews);
      // console.log(news[i]);
      // 如果队列长度大于5, 则删除队首元素
      while(news.length > 10) news.shift();
    }
    this.setState({currentnews : news});
    // console.log(this.state.currentnews);
    // console.log(news);
    // console.log(news.length);
  }

  render() {
    return (
      <html>
        <body>
        < Spacer2 ></Spacer2>
          <div>
            <a href={images[this.state.currentImage].link}>
              <img src={images[this.state.currentImage].src} width="1000px" height="300px"></img>
            </a>
          </div>
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
                    <div id="commentList">
                      <h2>评论区</h2>
                      <Box>
                      {this.state.comments
                        .slice(this.state.commentIndex - 10, this.state.commentIndex)
                        .map((comment, index) => (
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
                              {" — "}
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
                    <button onClick={this.frontComments}>首页</button>
                    <button onClick={this.showPreviousComments}>上一页</button>
                    <button onClick={this.showNextComments}>下一页</button>
                    <button onClick={this.backComments}>尾页</button>
                    <button onClick={this.deletelast}>撤回</button>
                    </div>
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
                  </CommentContainer>
                </td>
              </tr>
            </table>
          </div>
          <div>
            <h2 class = "center">足球新闻</h2>
            <div class="center">
              <a href={news[this.state.currentnewsindex].link}>
                <img src={news[this.state.currentnewsindex].image} width="1000px" height="300px"></img>
              </a>
              <CTA>
                {news[this.state.currentnewsindex].title} <br />
                {news[this.state.currentnewsindex].date}
              </CTA>
            </div>
          </div>
          <div>
          <h2 class = "center">精彩直播</h2>
          </div>
          <div class="center">
          <table class="center" text-align="center" margin="0">
            <Spacer>

            </Spacer>
            <td class = "center">
              <a href="https://www.miguvideo.com/p/home/27a0e23e93354541a2c76595a7e51129" style={{color: "blue"}}>
                <font>欧联</font>
              </a>
            </td>
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
            <td>
              <a href="https://www.miguvideo.com/p/home/d386e8a7c78c49d68e0e39db6cfaf26a" style={{color: "blue"}}>
                    欧冠
              </a>
            </td>
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
            <td>
              <a href="https://www.miguvideo.com/p/home/565a623a9d3a468b8e6062f1a9f77a7f" style={{color: "blue"}}>德甲</a>
            </td>
          
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
            <td>
              <a href="https://www.miguvideo.com/p/home/1db96d7e85ef4564aed5163a24ff454e" style={{color: "blue"}}>法甲</a>
            </td>
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
            <td>
              <a href="https://www.miguvideo.com/p/home/180a8bbc33504b2882b3923884673a9c/" style={{color: "blue"}}>
                意甲
              </a>
            </td>
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
            <td>
              <a href="https://www.miguvideo.com/p/home/7e2528a8a9324e90b3c7e6e9b58b14fa" style={{color: "blue"}}>
                西甲
              </a>
            </td>
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
            <td>
              <a href="https://www.miguvideo.com/p/home/0c40bbc85fa345bbba20f8e5fd11a922" style={{color: "blue"}}>英超</a>
            </td>
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
            <td>
              <a href="https://www.jyutv.com/score" style={{color: "blue"}}>
                鲸鱼直播
              </a>
            </td>
            <td> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </td>
          </table>
        </div>
        <a href="https://10259.github.io/football/">
          <button style={{ width: "300px", height: "35px" }}>
            气死了,我来当教练
          </button>
        </a>
        </body>
      </html>
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
  height: 640px; /* 框的高度 */
  border: 5px solid #000; /* 边框：2像素宽，黑色 */
  padding: 20px; /* 内边距：在内容和边框之间增加20像素的间距 */
  background-color: #ffffff;
`;
const Spacer = styled.div`
  width:350px
`
const Spacer2 = styled.div`
  height:50px
`
const CTA = styled.p`
position: relative;
display: block;
width:100%;
margin-top: 15px;
font-size: 16px;
line-height: 30px;
text-align: center;
background: #fafafa;
border-radius: 2px;
text-decoration: none;
color: rgba(0, 0, 0, 0.95);
cursor: pointer;
box-shadow: 0 3px 6px 3px rgba(0, 0, 0, 0.06);
font-family: Arial, sans-serif;
`
