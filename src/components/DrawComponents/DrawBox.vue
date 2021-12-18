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
      <img src="../../assets/Draw/colorpan.png" width="0" id="colorimg">
      <canvas id="colorChooser" width="90" height="40"
              @mousemove="onColorMouseMove"
              @mousedown="onColorMouseDown"
              @mouseup="onColorMouseUp"
      ></canvas>
      <canvas id="colorDisplayer" width="40" height="40"></canvas>
    </div>
    <button class="delBtn"
            @click="onDelbtnClick"
            :disabled="playerStateStore.playerInfo.id!==playerStateStore.playerInRoom.roomBaseInfo.onwerId"
    >清空</button>
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
    let canvas=null as any;
    let colorDisplayer=null as any;
    let playerStateStore=usePlayerStateStore()
    let canvasWidth= 0;
    let canvasHeight=0;
    let colorChooser=null as any;
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


    const onDelbtnClick = function(e:any){
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      if(drawContext){
        drawContext.clearRect(0,0,canvas.width,canvas.height);
      }
      context.emit("drawOnePath", [-1]);
    }
    const onMouseDown = function (e: any) {
      if (playerState.value !== PlayerState.PLAYING_DRAWING) {
        return;
      }
      mouseTrace = [
        [penType.value, drawContext.strokeStyle, drawContext.lineWidth],
        [e.offsetX/canvasWidth, e.offsetY/canvasHeight],
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
        mouseTrace.push([e.offsetX/canvasWidth, e.offsetY/canvasHeight]);
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
    let isDown=0;
    const onColorMouseMove=function(e:any){
      if(isDown===0){
        return;
      }
      let x=e.offsetX
      let y=e.offsetY
      let color=colorChooser.getImageData(x,y,1,1)
      redColor.value=color.data[0]
      greenColor.value=color.data[1]
      blueColor.value=color.data[2]
    }
    const onColorMouseUp=function(e:any){
      let x=e.offsetX
      let y=e.offsetY
      let color=colorChooser.getImageData(x,y,1,1)
      redColor.value=color.data[0]
      greenColor.value=color.data[1]
      blueColor.value=color.data[2]
      isDown=0
    }
    const onColorMouseDown=function(e:any){
      let x=e.offsetX
      let y=e.offsetY
      let color=colorChooser.getImageData(x,y,1,1)
      redColor.value=color.data[0]
      greenColor.value=color.data[1]
      blueColor.value=color.data[2]
      isDown=1
    }

    onMounted(() => {
      colorDisplayer = (document.getElementById('colorDisplayer') as HTMLCanvasElement).getContext("2d");
      canvas = document.getElementById("drawCanvasBoard");
      colorChooser=(document.getElementById("colorChooser") as HTMLCanvasElement).getContext("2d");
      let colorimg:HTMLElement|null=document.getElementById("colorimg")
      if(colorimg)colorimg.onload=()=>{colorChooser.drawImage(colorimg,0,0,90,40)}

      const drawRoom: any = document.getElementById("drawRoomMain");
      canvas.width = drawRoom.offsetWidth;
      canvasWidth=canvas.width
      canvas.height = drawRoom.offsetHeight;
      canvasHeight=canvas.height
      const canvasContext: any = canvas.getContext("2d");
      drawContext = canvasContext;

      watch(timer,(now,pre)=>{
        if(now>pre){
          canvasContext.clearRect(0,0,canvas.width,canvas.height);
        }
      })
      watch(pathInfo, (now) => {
        if (playerState.value === PlayerState.PLAYING_ANSWERING) {
          if (drawContext) {
            if(now[0]===-1){
              drawContext.clearRect(0,0,canvas.width,canvas.height);
              return;
            }
            penType.value = now[0][0];
            drawContext.strokeStyle = now[0][1];
            drawContext.lineWidth = now[0][2];
            if (now.length === 1) return;
            drawContext.beginPath();
            drawContext.moveTo(now[1][0]*canvasWidth, now[1][1]*canvasHeight);
            now.slice(2).forEach((v: any) => {
              drawContext.lineTo(v[0]*canvasWidth, v[1]*canvasHeight);
              drawContext.stroke();
            });
            drawContext.closePath();
          }
        }
      });
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
      timer,
      onDelbtnClick,
      playerStateStore,
      canvasWidth,
      canvasHeight,
      colorChooser,
      onColorMouseMove,
      onColorMouseDown,
      onColorMouseUp,
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
  width: 3rem;
  left: 20px;
  bottom: -50px;
}
.eraser {
  position: absolute;
  width: 3rem;
  left: 7rem;
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
  left: 10rem;
  bottom: 0px;
  display: flex;
  justify-content: space-between;
}
.changeColor input{
  width:10rem;
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
.delBtn{
  position: absolute;
  right: 0;
  bottom: 0;
  border-radius: 8px;
}
</style>
