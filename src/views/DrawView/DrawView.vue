/** 备忘录 * choosewordlib暂时在开始游戏时自动选择 * * * 状态可能还有点问题 *
room visibility 搜索 * 猜的格式可能要变 * 猜的正确性还没表达到界面上 *
聊天框的显示问题 UI * set_guess返回值 清空面板 */

<template>
  <div class="mainPage" v-if="playerStateStore.playerState!==PlayerState.PENDING">
    <in-room
      v-if="
        playerStateStore.playerState === PlayerState.INROOM_WAITING ||
        playerStateStore.playerState === PlayerState.INROOM_READY ||
        playerStateStore.playerState === PlayerState.PLAYING_ANSWERING ||
        playerStateStore.playerState === PlayerState.PLAYING_DRAWING
      "
      class="inRoomBox"
      @on-ready-change="onReadyChange"
      @on-exit-room="onExitRoom"
      @on-path-drawn="onPathDrawn"
      @on-submit-guess="onSubmitGuess"
      @on-change-room-info="onChangeRoomInfo"
    ></in-room>
    <div class="leftBar">
      <component
        v-show="isSettingOpen"
        :is="leftCurrentView"
        class="controlBar"
        @state-handler="changeSettingConpShowState"
      ></component>
      <div class="setting" @click="changeSettingConpShowState">
        <img src="../../assets/Draw/setting.png" />
      </div>
      <img class="leftBarLine" src="../../assets/Draw/LeftBarLine.png" />
      <img class="leftBarDrawLogo" src="../../assets/Draw/DrawLogo.png" />
    </div>
    <div class="rightBar">
      <component
        :is="rightCurrentView"
        @on-create-room="onCreateRoom"
        @on-enter-room="onEnterRoom"
        class="roomComp"
      ></component>
    </div>
    <img class="logoASF" src="../../assets/Draw/LOGO.png" />
  </div>
  <div class="mainPage2" v-else>

    <div class="login">
      <div class="label">你画我猜</div>
      <div>
        账号:<input type="text" v-model="account">
      </div>
      <div>
        密码:<input type="password" v-model="password">
      </div>

      <button @click="login">登录</button>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import controlBar from "../../components/DrawComponents/ControlBar.vue";
import roomList from "../../components/DrawComponents/RoomList.vue";
import inRoom from "../../components/DrawComponents/InRoom.vue";
import {
  PlayerInfo,
  PlayerState,
  RequestRawInfo,
  RespondRawInfo,
} from "../../types/types";
import { usePlayerStateStore, useRoomInfoStore } from "../../store/store";
import { getToken, makeRoomDetailInfo } from "../../utils/utils";

export default defineComponent({
  name: "drawMain",
  components: {
    controlBar,
    roomList,
    inRoom,
  },
  setup: function () {
    let account=ref('')
    let password=ref('')
    let isSettingOpen = ref(false);
    let intervalLoopId = null;
    let leftCurrentView = "controlBar";
    let rightCurrentView = "roomList";
    let websocketClient = null as any;
    let counter=0;
    const playerStateStore = usePlayerStateStore();
    const roomInfoStore = useRoomInfoStore();
    const changeSettingConpShowState = () => {
      if (isSettingOpen.value) {
        isSettingOpen.value = false;
      } else {
        isSettingOpen.value = true;
      }
    };
    const onCreateRoom = function (e: RequestRawInfo) {
      websocketClient.send(
        JSON.stringify({
          api: "makenewroom",
          param: {
            room_name: e.room_name,
            round: `${e.round}`,
            draw_time: `${e.draw_time}`,
            max_users: `${e.max_users}`,
            visible: `${e.privacy}`
          },
        })
      );
    };
    const login=function(){
      if(counter===0){
        counter=1;
        setTimeout(()=>{
            counter=0;
        },10000)
        fetch('https://api.asoulfan.com/user/user/login',{
          method:'POST',
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            username:`${account.value}`,
            password:`${password.value}`
          })
        }).then(response=>response.json())
        .then(res=>{
          if(res.code===500){
            alert("账号或密码错误。")
          }else{
            let token=res.data.token
            document.cookie=`asoulFanToken=${token}`
            checkToken()
          }
        })
      }else{
          alert('十秒钟最多验证一次！')
      }
    }
    const onChangeRoomInfo= function(e:RequestRawInfo){
      console.log(playerStateStore.playerInRoom.roomDynamicState)
      console.log(JSON.stringify({
        api: "updateRoom",
        param: {
          room_name: e.room_name,
          round: `${e.round}`,
          draw_time: `${e.draw_time}`,
          max_users: `${e.max_users}`,
          visible:`${e.privacy}`,
          word_library:`${e.word_lib}`
        },
      }))
      websocketClient.send(
        JSON.stringify({
          api: "updateRoom",
          param: {
            room_name: e.room_name,
            round: `${e.round}`,
            draw_time: `${e.draw_time}`,
            max_users: `${e.max_users}`,
            visible:`${e.privacy}`,
            word_libary:`${e.word_lib}`
          },
        })
      );
    }
    const onEnterRoom = function (e: string) {
      websocketClient.send(
        JSON.stringify({
          api: "joinroom",
          param: {
            id: e,
          },
        })
      );
    };
    const onReadyChange = function () {
      websocketClient.send(
        JSON.stringify({
          api: "ready",
          param: {
            nil: "nil",
          },
        })
      );
    };
    const onExitRoom = function () {
      websocketClient.send(
        JSON.stringify({
          api: "exitroom",
          param: {
            nil: "nil",
          },
        })
      );
      playerStateStore.changePlayerState(PlayerState.HANGING);
    };
    const onPathDrawn = function (e: any) {
      websocketClient.send(
        JSON.stringify({
          api: "transfer",
          data: {
            pathInfo: e,
          },
        })
      );
    };
    const onSubmitGuess = function (e: string) {
      websocketClient.send(
        JSON.stringify({
          api: "setguess",
          param: {
            word: e,
          },
        })
      );
    };

    //private:
    const websocketOnMessage= (evt:any) => {
      console.log(evt.data)
      let datas = JSON.parse(evt.data.replace(/"*\d{18,}"*/g,(v:any)=>`"${v.replace(/"*/g,'')}"`));
      //console.log(datas+'222')
      //连接建立
      switch (datas.api) {
        case "connect":
          intervalLoopId = setInterval(() => {
            if (playerStateStore.playerState !== PlayerState.HANGING) {
              return;
            }
            websocketClient.send('{"api": "getallrooms"}');
          }, 10000);
          playerStateStore.changePlayerState(PlayerState.HANGING);
          (function () {
            let rawInfo = datas.data;
            if (rawInfo.user_info) {
              playerStateStore.updatePlayerInfo(
                  rawInfo.user_info as PlayerInfo
              );
            }
            if (rawInfo.room_info?.rooms_info) {
              roomInfoStore.updateAllState(
                  rawInfo.room_info.rooms_info.map((v: RespondRawInfo) => {
                    return makeRoomDetailInfo(v);
                  })
              );
            }
          })();
          break;
          //获取房间||系统主动更新房间
        case "getAllRooms":
          (function () {
            if (playerStateStore.playerState !== PlayerState.HANGING) {
              return;
            }
            let roomInfo = datas.data.rooms_info;

            if (roomInfo) {
              roomInfoStore.updateAllState(
                  roomInfo.map((v: RespondRawInfo) => {
                    return makeRoomDetailInfo(v);
                  })
              );
            }
          })();
          break;
        case "roomUpdate":
          (function () {
            if (playerStateStore.playerState !== PlayerState.HANGING) {
              return;
            }
            let roomInfo = datas.data;

            if (roomInfo) {
              roomInfoStore.updateAllState(
                  roomInfo.map((v: RespondRawInfo) => {
                    return makeRoomDetailInfo(v);
                  })
              );
            }
          })();
          break;
        case "rooms_update":
          (function () {
            if (playerStateStore.playerState !== PlayerState.HANGING) {
              return;
            }
            let roomInfo = datas.data;
            if (roomInfo) {
              roomInfoStore.updateAllState(
                  roomInfo.map((v: RespondRawInfo) => {
                    return makeRoomDetailInfo(v);
                  })
              );
            }
          })();
          break;
        case "AllRoomUpdates":
          (function () {
            if (playerStateStore.playerState !== PlayerState.HANGING) {
              return;
            }
            let roomInfo = datas.data;
            if (roomInfo) {
              roomInfoStore.updateAllState(
                  roomInfo.map((v: RespondRawInfo) => {
                    return makeRoomDetailInfo(v);
                  })
              );
            }
          })();
          break;
          //创建房间
        case "makeNewRoom":
          (function () {
            let roomInfo = datas.data;
            if (roomInfo) {
              roomInfo.users = [playerStateStore.playerInfo];
              roomInfo.owner_id = playerStateStore.playerInfo.id;
              playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
              );
              playerStateStore.changePlayerState(PlayerState.INROOM_WAITING);
              console.log(playerStateStore.playerInRoom);
            }
          })();
          break;
          //加入房间
        case "joinRoom":
          (function () {
            let roomInfo = datas.data;
            if (roomInfo) {
              playerStateStore.changePlayerState(PlayerState.INROOM_WAITING);
              playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
              );
            }
          })();
          break;
          //更新房间内信息
        case "inRoomInfoUpdate":
          (function () {
            let roomInfo = datas.data;
            if (roomInfo) {
              playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
              );
            }
          })();
          break;
          //退出房间
        case "gamer_exit":
          (function () {
            let roomInfo = datas.data;
            if (roomInfo) {
              playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
              );
            }
          })();
          break;
        case "exitRoom":
          (function () {
            let roomInfo = datas.data.rooms_info;
            if (roomInfo) {
              roomInfoStore.updateAllState(
                  roomInfo.map((v: RespondRawInfo) => {
                    return makeRoomDetailInfo(v);
                  })
              );
              playerStateStore.clearTimer()
            }
          })();
          break;
          //准备
        case "user_ready":
          (function () {
            let roomInfo = datas.data.user_info as PlayerInfo;
            if (roomInfo) {
              console.log(roomInfo)
              playerStateStore.onInRoomPlayerStateChanged(roomInfo);
              if (
                  playerStateStore.isAllPlayerReady() &&
                  playerStateStore.isRoomOwner() &&
                  playerStateStore.playerInRoom.roomDynamicState.users.length >
                  1
              ) {
                websocketClient.send(
                    JSON.stringify({
                      api: "choosewordlib",
                      param: {
                        lib_name: "abc",
                      },
                    })
                );
                websocketClient.send(
                    JSON.stringify({
                      api: "startgame",
                      param: {
                        nil: "nil",
                      },
                    })
                );
              }
            }
          })();
          break;
        case "info_update":
          (function () {
            let data = datas.data;
            if (Object.hasOwnProperty.call(data,"answer")) {
              playerStateStore.appendChat({
                    playerName: "广播工具人",
                    text: `正确答案是 ${data.answer}!`
                  }
              );
              playerStateStore.appendChat(
                  data.result.map((v:any) => ({
                    playerName: v.user_name,
                    text: v.guess_word==='nil'?"什么也没猜":`猜了${v.guess_word}`
                  }))
              );
            } else if (data.type === "game_over") {
              playerStateStore.changePlayerState(PlayerState.INROOM_WAITING);
              playerStateStore.onGameOver()
            } else {
              if (data.type === "current_drawer") {
                playerStateStore.appendChat({
                  playerName: "广播工具人",
                  text: `接下来由:${data.info}来画`,
                });
                if (data.info === playerStateStore.playerInfo.id) {
                  playerStateStore.changePlayerState(
                      PlayerState.PLAYING_DRAWING
                  );
                } else if (
                    playerStateStore.playerState === PlayerState.PLAYING_DRAWING
                ) {
                  playerStateStore.changePlayerState(
                      PlayerState.PLAYING_ANSWERING
                  );
                } else if (
                    playerStateStore.playerState === PlayerState.INROOM_READY
                ) {
                  playerStateStore.changePlayerState(
                      PlayerState.PLAYING_ANSWERING
                  );
                }
              } else if (data.type === "next_word") {
                playerStateStore.appendChat({
                  playerName: "广播工具人",
                  text: `请画:${data.info}!`,
                });
              }else if(data.type==="start in"){
                (function () {
                  playerStateStore.appendChat({
                    playerName: "广播工具人",
                    text: `还有 ${data.info}s 开始游戏`,
                  });
                  if(parseInt(data.info)===1){
                    playerStateStore.setTimer(playerStateStore.playerInRoom.roomDynamicState.drawTime)
                    console.log(playerStateStore.playerInRoom.roomDynamicState.drawTime)
                  }
                })();
              }
            }
          })();
          break;
        case "choose_word_library":
          playerStateStore.changeWordLib(datas.data.library_name);
          break;
        case "transfer":
          playerStateStore.changePath(datas.data.pathInfo);
          break;
        case "set_guess":
          playerStateStore.appendChat({
            playerName: "广播工具人",
            text: `你现在猜了:${datas.data}`,
          });
          break;
        case "updateRoom":
          (function () {
            let roomInfo = datas.data;
            if (roomInfo) {
              playerStateStore.onPlayerEnterRoom(
                  makeRoomDetailInfo(roomInfo)
              );
            }
            if(playerStateStore.isRoomOwner()){
              alert("修改成功！")
            }

          })();
          break;
        default:
          if(datas.error===25){
            alert("人数不足！")
            playerStateStore.clearTimer()
            playerStateStore.changePlayerState(
                PlayerState.INROOM_WAITING
            )
            playerStateStore.onGameOver()

          }else if(datas.error===-1){
            alert('登录验证失败！请登录后重试。')
          }else{
            throw new Error(JSON.stringify(datas));
          }

      }
    };
    const createWebsocket = function(){
      websocketClient=new WebSocket("ws://localhost:1001");
      //websocketClient=new WebSocket("ws://localhost:1001");
      websocketClient.onopen = () => {
        let token=getToken(document.cookie)
        if(token){
          websocketClient.send(`asoulFanToken=${token}`);
        }
      };
      websocketClient.onmessage = websocketOnMessage
    }
    const checkToken = function(){
      let token=getToken(document.cookie)
      if(token){
        if(websocketClient===null){
          createWebsocket()
        }else if(websocketClient.readyState===1){
          websocketClient.send(`asoulFanToken=${token}`);
        }else{
          websocketClient.close()
          createWebsocket()
        }
      }
    }
    // onMounted(()=>{
    //   checkToken()
    // })
    return {
      websocketClient,
      intervalLoopId,
      playerStateStore,
      roomInfoStore,
      leftCurrentView,
      rightCurrentView,
      isSettingOpen,
      changeSettingConpShowState,
      onCreateRoom,
      PlayerState,
      onEnterRoom,
      onReadyChange,
      onExitRoom,
      onPathDrawn,
      onSubmitGuess,
      onChangeRoomInfo,
      login,
      account,
      password
    };
  },
});
</script>

<style scoped>
.mainPage {
  border: 3px solid black;
  border-radius: 8px;
  background-color: transparent;
  display: flex;
  height: calc(85vw / 16 * 9);
  overflow: hidden;
  position: absolute;
  z-index: 0;
  left: 20px;
  right: 20px;
}
.mainPage .logoASF {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 5%;
  z-index: 10000;
}
.leftBar {
  flex: 0 0 56%;
  position: relative;
  background-color: rgb(28, 28, 28);
  z-index: -1;
}
.rightBar {
  flex: 0 0 44%;
  position: relative;
}
.rightBar .backgroundASF {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  z-index: -1;
  margin-top: -30%;
}
.leftBar .leftBarLine {
  position: absolute;
  width: 100%;
  left: 0;
  z-index: -1;
}
.leftBar .leftBarDrawLogo {
  position: absolute;
  width: 50%;
  left: 50%;
  top: 25%;
  z-index: -1;
  transform: translateX(-50%);
}
.leftBar .leftBarBackground {
  position: absolute;
  width: 100%;
  left: 0;
  opacity: 0.99;
  z-index: -1;
}
.roomComp {
  height: 100%;
  margin-top: 10%;
}
.setting {
  position: absolute;
  right: 15px;
  bottom: 5px;
}
.setting img {
  width: 30px;
}
.setting:hover {
  cursor: pointer;
  z-index: 1;
}
.controlBar {
  position: absolute;
  height: 80%;
  top: 10%;
  right: 10%;
}
.inRoomBox {
  z-index: 99;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.mainPage2{
  border: 3px solid black;
  border-radius: 8px;
  display: flex;
  height: calc(85vw / 16 * 9);
  overflow: hidden;
  position: absolute;
  z-index: 0;
  left: 20px;
  right: 20px;

  background-image:url(../../assets/Draw/background.png);
  background-repeat: no-repeat;
  background-size:cover;
}
.login{
  position: absolute;
  right:10%;
  top:20%;
  display: flex;
  flex-direction: column;
  background-color: rgba(230,230,230,.5);
  border-radius: 8px;
  width:25%;
  height:60%;
  border:3px solid black;
  justify-content:space-around;
  font-size:1rem;
}
.login div{
  display: flex;
  align-items: center;
  margin-left:5%;
}
.login input{
  border: 3px solid black;
  border-radius: 8px;
  height:2rem;
  width:70%;
  background-color:rgba(230,230,230,.5);
  margin-left:3%;
  margin-right:3%;
}
.login button{
  width:50%;
  align-self:center;
  height:30px;
  background-color:rgba(230,230,230,.5);
  border: 3px solid black;
  border-radius: 8px;
}
.login button:hover{
  background-color:rgba(23,23,23,.3);
}
.login button:active{
  background-color:rgba(23,23,23,.5);
}
.label{
  align-self:center;
  flex:0 0 10%;
  font-size:2rem;
}
</style>
