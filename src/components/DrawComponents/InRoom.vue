<template>
  <div class="roomMain">
    <draw-box
      v-if="
        playerStateStore.playerState === PlayerState.PLAYING_ANSWERING ||
        playerStateStore.playerState === PlayerState.PLAYING_DRAWING
      "
      class="roomDrawBox"
      @draw-one-path="onDrawOnePath"
    >
    </draw-box>

    <div class="firstCol">
      <div class="wordLibName">
        嘉然，我真的好喜欢你啊,为了你我要听猫中毒(100)
      </div>
      <div class="chatBox" id="chatBox">
        <ul>
          <li
            v-for="(chatItem, index) in playerStateStore.playerInRoomChatArray"
            :key="`${chatItem.playerName + index}`"
          >
            {{ chatItem.playerName }}:{{ chatItem.text }}
          </li>
        </ul>
      </div>
      <div class="chatBoxInput">
        <input type="text" v-model="setGuessInput" placeholder="请输入答案" />
        <img
          src="../../assets/Draw/submit.png"
          class="submitBtn"
          v-if="
            true ||
            (playerStateStore.playerState === PlayerState.PLAYING_ANSWERING &&
              !btnSubmitGuessDisabled)
          "
          @click="setGuess"
        />
      </div>
    </div>
    <div class="waitingRoom">
      <ul class="playerList">
        <li
          class="playerEle"
          v-for="item in playerStateStore.playerInRoom.roomDynamicState.users"
          :key="item.id"
        >
          <img class="headPicture" src="../../assets/Draw/diana.jpg" />
          <div class="playerName">{{ item.name }}</div>
          <div class="playerState">
            <span v-if="item.ready === 'true'" class="playerReady">已准备</span>
            <span v-else class="playerWaiting">未准备</span>
          </div>
        </li>
      </ul>
      <div class="readyButton">
        <button
          v-if="playerStateStore.playerState === PlayerState.INROOM_READY"
          @click="changeReadyState"
        >
          取消准备
        </button>
        <button v-else @click="changeReadyState">准备</button>
      </div>
    </div>
    <div class="roomInfoBoard">
      <div class="roomName">
        <img src="../../assets/Draw/username.png" />
        <input
          type="text"
          v-model="roomNameInput"
          :disabled="
            playerStateStore.playerInfo.id !==
            playerStateStore.playerInRoom.roomBaseInfo.onwerId
          "
        />
      </div>
      <div class="maxUser">
        <img src="../../assets/Draw/maxuser.png" />
        <input
          type="text"
          v-model="maxUserInput"
          :disabled="
            playerStateStore.playerInfo.id !==
            playerStateStore.playerInRoom.roomBaseInfo.onwerId
          "
        />
        /20
      </div>
      <div class="drawTime rowCenter">
        <img src="../../assets/Draw/round.png" />
        <div class="drawTimeElement rowCenter">
          <input
            type="radio"
            value="60"
            v-model="drawTimeInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />60s
        </div>
        <div class="drawTimeElement rowCenter">
          <input
            type="radio"
            value="90"
            v-model="drawTimeInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />90s
        </div>
        <div class="drawTimeElement rowCenter">
          <input
            type="radio"
            value="120"
            v-model="drawTimeInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />120s
        </div>
      </div>
      <div class="round">
        <div class="roundElement rowCenter">
          <input
            type="radio"
            value="1"
            v-model="roundInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />一轮
        </div>
        <div class="roundElement rowCenter">
          <input
            type="radio"
            value="2"
            v-model="roundInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />两轮
        </div>
        <div class="roundElement rowCenter">
          <input
            type="radio"
            value="3"
            v-model="roundInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />三轮
        </div>
      </div>
      <div class="roomType">
        <img src="../../assets/Draw/privateRoom.png" />
        <div class="publicRoom">
          <input
            type="radio"
            value="true"
            v-model="roomTypeInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />开放房间
        </div>
        <div class="privateRoom">
          <input
            type="radio"
            value="false"
            v-model="roomTypeInput"
            :disabled="
              playerStateStore.playerInfo.id !==
              playerStateStore.playerInRoom.roomBaseInfo.onwerId
            "
          />仅能通过房间号搜索
        </div>
      </div>
      <button
        class="btnCreate"
        @click="updateBtnClick"
        :disabled="
          playerStateStore.playerInfo.id !==
          playerStateStore.playerInRoom.roomBaseInfo.onwerId
        "
      >
        修改
      </button>
    </div>

    <img class="close" @click="onExitRoom" src="../../assets/Draw/exit.png" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from "vue";
import { usePlayerStateStore } from "../../store/store";
import { PlayerState, RequestRawInfo } from "../../types/types";
import drawBox from "./DrawBox.vue";
import { storeToRefs } from "pinia";

export default defineComponent({
  name: "inRoom",
  emits: [
    "onReadyChange",
    "onExitRoom",
    "onPathDrawn",
    "onSubmitGuess",
    "onChangeRoomInfo",
  ],
  components: {
    drawBox,
  },
  setup(props, context) {
    const playerStateStore = usePlayerStateStore();
    const { playerInRoomChatArray, playerInRoom } = storeToRefs(
      usePlayerStateStore()
    );
    let roomNameInput = ref(playerInRoom.value.roomBaseInfo.roomName);
    let maxUserInput = ref(playerInRoom.value.roomBaseInfo.maxUsers);
    let roundInput = ref(playerInRoom.value.roomDynamicState.round);
    let roomTypeInput = ref(playerInRoom.value.roomDynamicState.privacy);
    let drawTimeInput = ref(playerInRoom.value.roomDynamicState.drawTime);

    onMounted(function () {
      const chatElement = document.getElementById("chatBox") as any;
      watch(playerInRoomChatArray, (now) => {
        chatElement.scrollTop = chatElement.scrollHeight;
      });
    });
    let setGuessInput = ref("");
    let btnSubmitGuessDisabled = ref(false);
    const setGuess = function () {
      if (playerStateStore.playerState === PlayerState.PLAYING_DRAWING) {
        return;
      }
      context.emit("onSubmitGuess", setGuessInput.value);
    };
    const changeReadyState = function () {
      if (playerStateStore.playerState === PlayerState.INROOM_READY) {
        playerStateStore.changePlayerState(PlayerState.INROOM_WAITING);
        context.emit("onReadyChange");
      } else if (playerStateStore.playerState === PlayerState.INROOM_WAITING) {
        playerStateStore.changePlayerState(PlayerState.INROOM_READY);
        context.emit("onReadyChange");
      }
    };
    const onExitRoom = function () {
      context.emit("onExitRoom");
      playerStateStore.changePlayerState(PlayerState.HANGING);
    };
    const onDrawOnePath = function (e: any) {
      context.emit("onPathDrawn", e);
    };
    const updateBtnClick = function () {
      context.emit("onChangeRoomInfo", {
        room_name: roomNameInput.value,
        round: roundInput.value,
        draw_time: drawTimeInput.value,
        max_users: maxUserInput.value,
        privacy: roomTypeInput.value,
        word_lib: "abc",
      });
    };
    return {
      playerStateStore,
      PlayerState,
      changeReadyState,
      onExitRoom,
      onDrawOnePath,
      setGuessInput,
      setGuess,
      btnSubmitGuessDisabled,
      drawTimeInput,
      roomTypeInput,
      roundInput,
      maxUserInput,
      roomNameInput,
      updateBtnClick,
    };
  },
});
</script>

<style scoped>
.roomMain {
  background-color: rgb(230, 230, 230);
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-image: url("../../assets/Draw/backgroundASF.png");
  background-size: auto 150%;
  background-position: 0 50%;
}
.close {
  position: absolute;
  width: 10%;
  left: 10px;
  top: 10px;
}
.close:hover {
  cursor: pointer;
}
.firstCol {
  border-radius: 8px;
  width: 25%;
  display: flex;
  flex-direction: column;
  height: 95%;
}
.wordLibName {
  font-size: 2.4em;
  font-weight: 600;
  color: black;
  margin-top: 17%;
  flex: 0 0 20%;
}
.chatBox {
  height: 60%;
  border: 3px solid black;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: 600;
  color: black;
  overflow-y: scroll;
  overflow-y: -moz-scrollbars-none;
  -ms-overflow-style: none;
}
.chatBoxInput {
  margin-top: 5%;
  border-radius: 8px;
  height: 5%;
  width: 100%;
  display: flex;
  align-items: center;
}
.chatBoxInput input {
  height: 100%;
  border: 3px solid black;
  border-radius: 8px;
  font-size: 1.5rem;
  background-color: transparent;
  width: 90%;
}
.chatBox::-webkit-scrollbar {
  width: 0;
}
.submitBtn {
  width: 10%;
  margin-left: 5px;
}
.submitBtn:hover {
  cursor: pointer;
}
.waitingRoom {
  border: 3px solid black;
  border-radius: 8px;
  height: 85%;
  width: 30%;
  flex: 0 0 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.headPicture {
  border: 3px solid black;
  border-radius: 80px;
  width: 15%;
}
.playerList {
  margin-left: 10%;
  list-style: none;
  margin-top: 8%;
  flex: 0 0 75%;
  overflow-y: scroll;
  overflow-y: -moz-scrollbars-none;
  -ms-overflow-style: none;
}
.playerList::-webkit-scrollbar {
  width: 0;
}

.playerEle {
  text-align: left;
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.playerEle img {
  width: 4rem;
}
.playerName {
  width: 60%;
  margin-left: 10px;
  font-size: 2rem;
  font-weight: 600;
  color: black;
}
.playerState {
  font-size: 2rem;
}
.playerReady {
  font-weight: 600;
}

.playerWaiting {
  color: black;
  opacity: 0.7;
}

.readyButton {
  margin-bottom: 20px;
  align-self: center;
}
.readyButton button {
  font-size: 1.5rem;
  width: 14rem;
  height: 3rem;
  border: 3px solid black;
  border-radius: 8px;
}
.readyButton button:hover {
  cursor: pointer;
  background-color: rgba(9, 9, 9, 0.3);
}
.readyButton button:active {
  cursor: pointer;
  background-color: rgba(9, 9, 9, 0.5);
}
.roomDrawBox {
  position: absolute;
  left: 26%;
  right: 0.5%;
  top: 6%;
  bottom: 2%;
  border-radius: 8px;
  border: 3px solid black;
  z-index: 10000;
}
.roomInfoBoard {
  display: flex;
  flex-direction: column;
  border: 3px solid black;
  border-radius: 8px;
  background-color: rgb(230, 230, 230);
  justify-content: space-around;
  align-items: flex-start;
  font-size: 1.2rem;
  font-weight: 600;
  height: 80%;
  width: 20%;
  overflow: hidden;
}
.roomName {
  margin-top: 6%;
  margin-left: 12.5%;
  width: 90%;
  display: flex;
  align-items: center;
}
.roomName img {
  width: 10%;
}
.roomName input {
  height: 24px;
  width: 80%;
  border: 3px solid black;
  border-radius: 8px;
  font-size: 1.4rem;
  background-color: transparent;
}
.round {
  margin-left: 15%;
  width: 90%;
  display: flex;
  align-items: center;
}
.roundElement input {
  width: 1.5rem;
  height: 1.5rem;
}
.maxUser {
  display: flex;
  align-items: center;
  align-self: flex-start;
  margin-left: 10%;
  width: 90%;
}
.maxUser img {
  width: 10%;
}
.maxUser input {
  font-size: 1.4rem;
  height: 24px;
  width: 30px;
  border: 3px solid black;
  border-radius: 8px;
  background-color: transparent;
}
.roomType {
  margin-left: 10%;
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.roomType img {
  width: 10%;
}
.publicRoom {
  margin-left: 10%;
}
.privateRoom {
  margin-left: 10%;
}
.drawTime {
  margin-left: 10%;
  width: 90%;
}
.drawTime img {
  width: 10%;
}
.drawTime input {
  width: 1.5rem;
  height: 1.5rem;
}
.btnCreate {
  z-index: 1;
  min-height: 25px;
  height: 7%;
  width: 40%;
  align-self: center;
  border-radius: 8px;
  border: 3px solid black;
}
.btnCreate:hover {
  background-color: rgb(9, 9, 9, 0.3);
}
.btnCreate:active {
  background-color: rgb(9, 9, 9, 0.5);
}
.rowCenter {
  display: flex;
  align-items: center;
}
</style>
