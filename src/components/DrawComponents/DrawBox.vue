<template>
  <div class="drawRoomMain" id="drawRoomMain">
    <div class="timer">
      <img src="../../assets/Draw/round.png" width="30">
      <span>{{timer}}</span>
    </div>
    <canvas
      class="drawBoard"
      id="drawCanvasBoard"
      @mousemove="onMouseMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
    ></canvas>
    <img
      src="../../assets/Draw/eraser.png"
      class="eraser"
      :class="{ drawToolActive: penType === 0 }"
      @click="onPenChose"
    />
    <img
      src="../../assets/Draw/pen.png"
      class="pen"
      :class="{ drawToolActive: penType === 1 }"
      @click="onEraserChose"
    />
    <div class="changeColor">
      <div>
        <input type="range" max="255" min="0" step="1" v-model="redColor">
        <input type="range" max="255" min="0" step="1" v-model="greenColor">
        <input type="range" max="255" min="0" step="1" v-model="blueColor">
      </div>
      <canvas id="colorDisplayer" width="40" height="40"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { usePlayerStateStore } from "../../store/store";
import { storeToRefs } from "pinia";
import { PlayerState } from "../../types/types";
import {rgbToHex} from "@/utils/utils";

export default defineComponent({
  name: "drawBox",
  emits: ["drawOnePath"],
  setup(props, context) {
    let mouseTrace = [] as any;
    let drawContext = null as any;
    let drawFlag = false;
    let penType = ref(1);
    let redColor=ref(0);
    let greenColor=ref(0);
    let blueColor=ref(0);
    let colorDisplayer=null as any;
    const {timer} = storeToRefs(usePlayerStateStore())
    const { pathInfo, playerState } = storeToRefs(usePlayerStateStore());

    watch(redColor,()=>{
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }

      colorDisplayer.fillStyle=rgbToHex(redColor.value,greenColor.value,blueColor.value)
      colorDisplayer.fillRect(0,0,40,40);
    })
    watch(greenColor,()=>{
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      colorDisplayer.fillStyle=rgbToHex(redColor.value,greenColor.value,blueColor.value)
      colorDisplayer.fillRect(0,0,40,40);
    })
    watch(blueColor,()=>{
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      colorDisplayer.fillStyle=rgbToHex(redColor.value,greenColor.value,blueColor.value)
      colorDisplayer.fillRect(0,0,40,40);
    })

    watch(pathInfo, (now) => {
      if (playerState.value === PlayerState.PLAYING_ANSWERING) {
        if (drawContext) {
          console.log(now[0]);
          penType.value = now[0][0];
          drawContext.strokeStyle = now[0][1];
          drawContext.lineWidth = now[0][2];
          if (now.length === 1) return;
          drawContext.beginPath();
          drawContext.moveTo(now[1][0], now[1][1]);
          now.slice(2).forEach((v: any) => {
            drawContext.lineTo(v[0], v[1]);
            drawContext.stroke();
          });
          drawContext.closePath();
        }
      }
    });
    const onMouseDown = function (e: any) {
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      mouseTrace = [
        [penType.value, drawContext.strokeStyle, drawContext.lineWidth],
        [e.offsetX, e.offsetY],
      ];
      drawFlag = true;
      if (penType.value === 0) {
        drawContext.strokeStyle = "#E6E6E6";
        drawContext.lineWidth = 15;
      } else {
        drawContext.strokeStyle = rgbToHex(redColor.value,greenColor.value,blueColor.value);
        drawContext.lineWidth = 3;
      }
      drawContext.beginPath();
      drawContext.moveTo(e.offsetX, e.offsetY);
    };
    const onMouseMove = function (e: any) {
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      if (drawFlag) {
        mouseTrace.push([e.offsetX, e.offsetY]);
        drawContext.lineTo(e.offsetX, e.offsetY);
        drawContext.stroke();
      }
    };
    const onMouseUp = function (e: any) {
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      drawFlag = false;
      drawContext.closePath();
      if (penType.value === 0) {
        mouseTrace[0][1] = "#E6E6E6";
        mouseTrace[0][2] = 15;
      } else {
        mouseTrace[0][1] = rgbToHex(redColor.value,greenColor.value,blueColor.value);
        mouseTrace[0][2] = 3;
      }
      console.log(mouseTrace[0]);
      context.emit("drawOnePath", mouseTrace);
    };
    const onPenChose = function () {
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      penType.value = 0;
      context.emit("drawOnePath", [
        [penType.value, drawContext.strokeStyle, drawContext.lineWidth],
      ]);
    };
    const onEraserChose = function () {
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      penType.value = 1;
    };
    onMounted(() => {
      colorDisplayer = (document.getElementById('colorDisplayer') as HTMLCanvasElement).getContext("2d");
      const canvas: any = document.getElementById("drawCanvasBoard");
      const drawRoom: any = document.getElementById("drawRoomMain");
      canvas.width = drawRoom.offsetWidth;
      canvas.height = drawRoom.offsetHeight;
      const canvasContext: any = canvas.getContext("2d");
      drawContext = canvasContext;
      watch(timer,(now,pre)=>{
        if(now>pre){
          canvasContext.clearRect(0,0,canvas.width,canvas.height);
        }
      })
    });
    return {
      onMouseMove,
      onMouseUp,
      onMouseDown,
      mouseTrace,
      drawContext,
      penType,
      onPenChose,
      onEraserChose,
      redColor,
      greenColor,
      blueColor,
      timer
    };
  },
});
</script>

<style lang="scss" scoped>
.drawRoomMain {
  background-color: rgb(230, 230, 230);
  overflow: hidden;
}
.drawBoard {
}
.pen {
  position: absolute;
  width: 30px;
  left: 20px;
  bottom: -50px;
}
.eraser {
  position: absolute;
  width: 30px;
  left: 80px;
  bottom: -20px;
}
.drawToolActive {
  bottom: -1px;
}
.pen:hover {
  cursor: pointer;
}
.eraser:hover {
  cursor: pointer;
}
.changeColor{
  position: absolute;
  width: 100px;
  left: 120px;
  bottom: 0px;
  display: flex;
  justify-content: space-between;
}
.changeColor input{

}
.timer{
  position: absolute;
  right:3%;
  top:2%;
  display: flex;
  align-items: center;
  span{
    margin-left: 4px;
    font-size:1.2rem;
  }
}
</style>
