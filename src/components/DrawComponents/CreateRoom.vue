<template>
  <div class="createRoomMain">
    <div class="roomName">
      <img src="../../assets/Draw/username.png" />
      <input type="text" v-model="roomNameInput" />
    </div>
    <div class="maxUser">
      <img src="../../assets/Draw/maxuser.png" />
      <input type="text" v-model="maxUserInput" /> /10
    </div>
    <div class="drawTime rowCenter">
      <img src="../../assets/Draw/round.png" />
      <div class="drawTimeElement rowCenter">
        <input type="radio" value="60" v-model="drawTimeInput" />60s
      </div>
      <div class="drawTimeElement rowCenter">
        <input type="radio" value="90" v-model="drawTimeInput" />90s
      </div>
      <div class="drawTimeElement rowCenter">
        <input type="radio" value="120" v-model="drawTimeInput" />120s
      </div>
    </div>
    <div class="round">
      <div class="roundElement rowCenter">
        <input type="radio" value="1" v-model="roundInput" />一轮
      </div>
      <div class="roundElement rowCenter">
        <input type="radio" value="2" v-model="roundInput" />两轮
      </div>
      <div class="roundElement rowCenter">
        <input type="radio" value="3" v-model="roundInput" />三轮
      </div>
    </div>
    <div class="roomType">
      <img src="../../assets/Draw/privateRoom.png" />
      <div class="publicRoom">
        <input type="radio" value="0" v-model="roomTypeInput" />开放房间
      </div>
      <div class="privateRoom">
        <input
          type="radio"
          value="1"
          v-model="roomTypeInput"
        />仅能通过房间号搜索
      </div>
    </div>
    <button class="btnCreate" @click="createBtnClick">创建</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { RequestRawInfo, RoomDetailInfo } from "../../types/types";

export default defineComponent({
  name: "createRoom",
  emits: ["changeState", "onCreateBtnClicked"],
  setup(props, context) {
    let roomNameInput = ref("一个魂儿们欢迎来玩呀~");
    let maxUserInput = ref(10);
    let roundInput = ref(3);
    let roomTypeInput = ref(0);
    let drawTimeInput = ref(60);
    const changeCreateRoomWinodwState = function (): void {
      context.emit("changeState");
    };
    const createBtnClick = function (): void {
      if(roomNameInput.value.length>20){
        alert("房间名过长，请限制在10个字符以内。")
        return;
      }
      if(maxUserInput.value>10){
        alert("最多人数不能超过限制！")
        return;
      }
      let requestRawInfo = {
        room_name: roomNameInput.value,
        max_users: maxUserInput.value,
        round: roundInput.value,
        draw_time: drawTimeInput.value,
        privacy: (roomTypeInput.value===0?true:false)
      } as RequestRawInfo;

      context.emit("onCreateBtnClicked", requestRawInfo);
    };
    return {
      roomNameInput,
      maxUserInput,
      roundInput,
      roomTypeInput,
      createBtnClick,
      drawTimeInput,
    };
  },
});
</script>
<style scoped>
.createRoomMain {
  display: flex;
  flex-direction: column;
  border: 3px solid black;
  border-radius: 8px;
  background-color: rgb(230, 230, 230);
  z-index: 99;
  justify-content: space-around;
  align-items: flex-start;
  font-size: 1.5rem;
  font-weight: 600;

  position: absolute;
  left: 10%;
  right: 10%;
  top: 0;
  bottom: 24%;
  overflow: hidden;
}
.roomName {
  margin-top: 6%;
  margin-left: 10%;
  width: 90%;
  display: flex;
  align-items: center;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
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
