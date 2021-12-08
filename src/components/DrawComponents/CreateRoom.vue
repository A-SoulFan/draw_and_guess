<template>
  <div class="createRoomMain">
    <div class="roomName">
      房间名<input type="text" v-model="roomNameInput" />
    </div>
    <div class="maxUser">
      最大人数<input type="text" v-model="maxUserInput" />/20
    </div>
    <div class="drawTime">
      每轮时间
      <input type="radio" value="60" v-model="drawTimeInput" />60s
      <input type="radio" value="90" v-model="drawTimeInput" />90s
      <input type="radio" value="120" v-model="drawTimeInput" />120s
    </div>
    <div class="round">轮数<input type="text" v-model="roundInput" /></div>
    <div class="roomType">
      房间类型
      <div>
        <input type="radio" value="0" v-model="roomTypeInput" />开放房间
      </div>
      <div>
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
    let roomNameInput = ref("");
    let maxUserInput = ref(10);
    let roundInput = ref(3);
    let roomTypeInput = ref(0);
    let drawTimeInput = ref(60);
    const changeCreateRoomWinodwState = function (): void {
      context.emit("changeState");
    };
    const createBtnClick = function (): void {
      let requestRawInfo = {
        room_name: roomNameInput.value,
        max_users: maxUserInput.value,
        round: roundInput.value,
        draw_time: drawTimeInput.value,
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
  border: 3.2px solid black;
  border-radius: 8px;
  background-color: rgb(230, 230, 230);
  z-index: 99;
  justify-content: space-around;
  font-size: 24px;
  font-weight: 600;
}
.roomName {
  flex: 1 1 0.1;
}
.round {
  flex: 1 1 0.1;
}
.maxUser {
  flex: 1 1 0.1;
}
.roomType {
  flex: 1 1 0.1;
}
.drawTime {
  flex: 1 1 0.1;
}
.btnCreate {
  z-index: 1;
}
.btnCreate:hover {
  background-color: rgb(9, 9, 9, 0.3);
}
.btnCreate:active {
  background-color: rgb(9, 9, 9, 0.5);
}
</style>
