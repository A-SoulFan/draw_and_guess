<template>
  <div class="barMain">
    <createRoom
      v-if="isCreatingRoom === true"
      class="createRoomBox"
      @change-state="changeCreateRoomState"
      @on-create-btn-clicked="onCreateBtnClicked"
    ></createRoom>
    <div class="roomList">
      <ul>
        <li
          v-for="item in roomInfoStore.roomList.filter(v=>{
            return v.roomDynamicState.privacy===false
          })"
          :key="item.roomBaseInfo.roomId"
          @click="onEnterRoomClicked(item.roomBaseInfo.roomId)"
        >
          <div class="roomName">&nbsp;{{ item.roomBaseInfo.roomName }}</div>
          <div class="peopleNum">
            {{ getUserString(item.roomDynamicState.userInRoom) }}/{{
              getUserString(item.roomBaseInfo.maxUsers)
            }}
          </div>
        </li>
      </ul>
    </div>
    <div class="roomSearch">
      <input
        type="text"
        class="roomIdInput"
        placeholder="输入房间号"
        v-model="roomSearchId"
      />
      <img class="searchIcon" src="../../assets/Draw/SearchIcon.png" />
    </div>
    <div class="roomBtn">
      <button
        :class="{ btnActive: isCreatingRoom }"
        class="makeNewRoom"
        @click="changeCreateRoomState"
      >
        创建房间
      </button>
      <button class="wordLib">题库</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import {
  RoomBaseInfo,
  RoomDetailInfo,
  RequestRawInfo,
} from "../../types/types";
import { useRoomInfoStore } from "../../store/store";
import createRoom from "../../components/DrawComponents/CreateRoom.vue";
import { getUserString } from "../../utils/utils";

export default defineComponent({
  name: "RoomList",
  emits: ["onCreateRoom", "onEnterRoom"],
  components: {
    createRoom,
  },
  setup(props, context) {
    let roomSearchId = "";
    let isCreatingRoom = ref(false);
    const roomInfoStore = useRoomInfoStore();
    const changeCreateRoomState = function () {
      if (isCreatingRoom.value) {
        isCreatingRoom.value = false;
      } else {
        isCreatingRoom.value = true;
      }
    };
    const onCreateBtnClicked = function (e: RequestRawInfo) {
      context.emit("onCreateRoom", e);
      changeCreateRoomState();
    };
    const onEnterRoomClicked = function (e: string) {
      context.emit("onEnterRoom", e);
    };
    return {
      roomInfoStore,
      roomSearchId,
      isCreatingRoom,
      changeCreateRoomState,
      onCreateBtnClicked,
      getUserString,
      onEnterRoomClicked,
    };
  },
});
</script>

<style scoped>
.barMain {
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: space-between;
  overflow: hidden;
}
.roomList {
  flex: 1 1 50%;
  border: 3px solid black;
  border-radius: 8px;
  width: 74%;
  margin-left: 12.5%;
  min-height: 100px;
  margin-bottom: 5%;
  text-align: left;
  overflow: hidden;
}
.roomBtn {
  margin-top: 5%;
  flex: 0 0 20%;
  display: flex;
  justify-content: center;
}
.roomListBox {
  width: 75%;
}
.roomSearch {
  width: 74%;
  height: 5%;
  min-height: 30px;
  margin-left: 12.5%;
  border: 3px solid black;
  border-radius: 8px;
  position: relative;
}
.roomIdInput {
  height: 100%;
  width: 90%;
  min-height: 30px;
  margin-left: 8%;
  background-color: transparent;
  font-size: 20px;
  outline: none;
  border: 0;
}
.searchIcon {
  width: 6%;
  left: 8px;
  top: 53%;
  transform: translateY(-50%);
  position: absolute;
}
.makeNewRoom {
  background-color: rgba(230, 230, 230, 0.3);
  width: 42%;
  height: 25%;
  font-size: 20px;
  border: 3px solid black;
  min-height: 30px;
  border-radius: 8px;
}
.makeNewRoom:hover {
  background-color: rgba(92, 92, 92, 0.5);
}
.makeNewRoom:active {
  background-color: rgba(92, 92, 92, 0.7);
}
.wordLib {
  background-color: rgba(230, 230, 230, 0.3);
  width: 30%;
  font-size: 20px;
  margin-left: 20px;
  height: 25%;
  min-height: 30px;
  border: 3px solid black;
  border-radius: 8px;
}
.roomList ul {
  margin-top: 10%;
  list-style: none;
  position: relative;
}
.roomList ul li {
  line-height: 25px;
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 600;
  color: black;
  display: flex;
  justify-content: space-between;
}
.peopleNum {
  margin-right: 10px;
}
.roomList li:hover {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.2);
}
.btnActive {
  background-color: rgb(92, 92, 92, 0.7);
}
</style>
