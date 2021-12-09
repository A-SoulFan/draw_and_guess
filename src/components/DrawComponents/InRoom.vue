<template>
  <div class="roomMain">
    <draw-box
      v-if="
        playerStateStore.playerState === PlayerState.PLAYING_ANSWERING ||
        playerStateStore.playerState === PlayerState.PLAYING_DRAWING
      "
      class="roomDrawBox"
    >
    </draw-box>

    <div class="firstCol">
      <div class="wordLibName">
        嘉然，我真的好喜欢你啊,为了你我要听猫中毒(100)
      </div>
      <div class="chatBox">优化中······敬请期待</div>
      <div class="chatBoxInput"></div>
    </div>
    <div class="waitingRoom">
      <ul class="playerList">
        <li
          class="playerEle"
          v-for="item in playerStateStore.playerInRoom.roomDynamicState.users"
          :key="item.id"
        >
          <img class="headPicture" src="../../assets/Draw/diana.jpg" />
          <div class="playerName">{{ item.id }}</div>
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
    <div class="scoreBoard">4</div>

    <img class="close" @click="onExitRoom" src="../../assets/Draw/exit.png" />
    <img class="leftBackground" src="../../assets/Draw/backgroundASF.png" />
    <img class="rightBackground" src="../../assets/Draw/backgroundASF.png" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { usePlayerStateStore } from "../../store/store";
import { PlayerState } from "../../types/types";
import drawBox from "./DrawBox.vue";

export default defineComponent({
  name: "inRoom",
  emits: ["onReadyChange", "onExitRoom"],
  components: {
    drawBox,
  },
  setup(props, context) {
    const playerStateStore = usePlayerStateStore();
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
    return {
      playerStateStore,
      PlayerState,
      changeReadyState,
      onExitRoom,
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
}
.leftBackground {
  position: absolute;
  width: 50%;
  left: 0;
  top: -25%;
  z-index: -99;
}
.rightBackground {
  position: absolute;
  width: 50%;
  left: 50%;
  top: -25%;
  z-index: -99;
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
  height: 100vh;
}
.wordLibName {
  font-size: 40px;
  font-weight: 600;
  color: black;
  margin-top: 17%;
}
.chatBox {
  margin-top: 15%;
  height: 40%;
  border: 3.2px solid black;
  border-radius: 8px;
  font-size: 50px;
  font-weight: 600;
  color: black;
}
.chatBoxInput {
  margin-top: 8%;
  border-radius: 8px;
  height: 5%;
  width: 80%;
  border: 3.2px solid black;
}
.waitingRoom {
  border: 3.2px solid black;
  border-radius: 8px;
  height: 85%;
  width: 30%;
  flex: 1 1 0.3;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.scoreBoard {
  border: 3.2px solid black;
  border-radius: 8px;
  height: 85%;
  width: 30%;
  flex: 1 1 0.3;
}
.headPicture {
  border: 3.2px solid black;
  border-radius: 80px;
  width: 15%;
}
.playerList {
  list-style: none;
  margin-top: 70px;
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
  width: 65px;
}
.playerName {
  width: 60%;
  margin-left: 10px;
  font-size: 28px;
  font-weight: 600;
  color: black;
}
.playerState {
  font-size: 20px;
}
.playerReady {
  font-weight: 600;
}

.playerWaiting {
  color: black;
  opcaity: 0.7;
}

.readyButton {
  min-height: 220px;
}
.readyButton button {
  font-size: 20px;
  width: 50%;
  height: 20%;
  border: 3.2px solid black;
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
  left: 30%;
  right: 2%;
  top: 5%;
  bottom: 7%;
  border-radius: 8px;
  border: 3.2px solid black;
}
</style>
