<template>
  <div class="controlBarMain">
    <div class="close" @click="changeState">
      <img src="../../assets/Draw/CloseWindow.png" />
    </div>
    <div class="iceSkating">
      随机溜冰
      <input type="radio" value="true" v-model="settings.iceSkating"/>默认开启 <input type="radio" value="false" v-model="settings.iceSkating"/>默认关闭
    </div>
    <div class="musicVolume">
      游戏内音量
      <input type="range" v-model="settings.volume"/>
    </div>
    <div class="effectVolume">
      游戏音效
      <input type="radio" value="true" v-model="settings.volumeSE"/>默认开启 <input type="radio" value="false" v-model="settings.volumeSE"/>默认关闭
    </div>
    <div class="talkingBox">
      聊天框
      <input type="radio" value="true" v-model="settings.muteAll"/>全体禁言
    </div>

    <div class="patternChoosing">
      <div class="patternLabel">模式</div>
      <div class="patternBox">
        <div class="patternMouse">
          <img src="../../assets/Draw/Mouse.png" />
          <span>鼠标</span>
          <input type="radio" value="0" v-model="settings.pointerType">
          <ul class="desc">
            <li>按住左键绘画</li>
            <li>移动端触屏绘画</li>
          </ul>
        </div>
        <div class="patternDigitBoard">
          <img src="../../assets/Draw/DigitBoard.png" />
          数位板
          <input type="radio" value="1" v-model="settings.pointerType">
          <ul class="desc">
            <li>笔尖触碰绘画</li>
            <li>单击空格选择</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import {useGlobalSettings} from "@/store/store";
import {storeToRefs} from "pinia";

export default defineComponent({
  name: "ControlBar",
  emits: ["stateHandler"],
  setup(props, context) {
    const {settings} = storeToRefs(useGlobalSettings())
    const changeState = function () {
      context.emit("stateHandler");
      console.log(settings)
    };
    return {
      changeState,
      settings
    };
  },
});
</script>
<style scoped>
.controlBarMain {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 3px solid white;
  justify-content: space-between;
  border-radius: 8px;
  width: 80%;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  background-color: rgb(8, 8, 8);
}
.iceSkating {
  text-align: left;
  margin-top: 10%;
  margin-left: 5%;
  flex: 1 1 10%;
}
.musicVolume {
  text-align: left;
  margin-left: 5%;
  flex: 1 1 10%;
}
.effectVolume {
  text-align: left;
  margin-left: 5%;
  flex: 1 1 10%;
}
.talkingBox {
  text-align: left;
  margin-left: 5%;
  flex: 1 1 10%;
}
.patternChoosing {
  height: 45%;
  display: flex;
  flex-direction: column;
}
.patternBox {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  height: 60%;
  position: relative;
}
.patternLabel {
  text-align: left;
  margin-left: 5%;
  margin-bottom: 1%;
}
.patternMouse {
  border: 3px solid white;
  border-radius: 8px;
  text-align: left;
  width: 40%;
  font-size: 1.2rem;
  height: 100%;
}
.patternMouse:hover{
  cursor: pointer;
  background-color:rgba(255,255,255,.3)
}

.patternMouse .desc {
  margin-top: 15%;
}
.patternMouse .desc li {
  margin-top: 8%;
}
.patternMouse span {
  display: block;
  margin-left: 17%;
  margin-top: 3%;
}
.patternMouse img {
  position: absolute;
  left: 6%;
  top: 5%;
  width: 5%;
}
.patternDigitBoard {
  border: 3px solid white;
  border-radius: 8px;
  text-align: left;
  font-size: 1.2rem;
  width: 40%;
  height: 100%;
}
.patternDigitBoard:hover{
  cursor: pointer;
  background-color:rgba(255,255,255,.3)
}
.patternDigitBoard .desc {
  margin-top: 15%;
}
.patternDigitBoard img {
  width: 10%;
}
.patternDigitBoard .desc li {
  margin-top: 8%;
}
.close {
  position: absolute;
  left: -7%;
  top: 2%;
}
.close:hover {
  cursor: pointer;
}
.close img {
  width: 16%;
}
</style>
