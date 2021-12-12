/** 备忘录 * choosewordlib暂时在开始游戏时自动选择 * * * 状态可能还有点问题 *
room visibility 搜索 * 猜的格式可能要变 * 猜的正确性还没表达到界面上 *
聊天框的显示问题 UI * set_guess返回值 清空面板 */

<template>
  <div class="mainPage">
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
import { makeRoomDetailInfo } from "../../utils/utils";

export default defineComponent({
  name: "drawMain",
  components: {
    controlBar,
    roomList,
    inRoom,
  },
  setup: function () {
    let isSettingOpen = ref(false);
    let intervalLoopId = null;
    let leftCurrentView = "controlBar";
    let rightCurrentView = "roomList";
    const websocketClient = new WebSocket("ws://52.130.177.41:1001");
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
    onMounted((): void => {
      websocketClient.onopen = () => {
        websocketClient.send("asoulFanToken=123456");
      };

      websocketClient.onmessage = (evt) => {
        let datas = JSON.parse(evt.data);
        console.log(datas)
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
              }
            })();
            break;
          //准备
          case "user_ready":
            (function () {
              let roomInfo = datas.data.user_info as PlayerInfo;
              if (roomInfo) {
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
              if (Array.isArray(data)) {
                playerStateStore.appendChat(
                  data.map((v) => ({
                    playerName: v.userName,
                    text: `猜了${v.guess_word}`,
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
          case "chooseWordLib":
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
              alert("修改成功！")
            })();
            break;
          default:
            throw new Error(JSON.stringify(datas));
        }
      };
    });
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
      onChangeRoomInfo
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
</style>
