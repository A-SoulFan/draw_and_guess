<template>
  <div class="drawRoomMain" id="drawRoomMain">
    <div class="timer">
      <img src="../../assets/Draw/round.png" width="30">
      <span>{{timer}}</span>
    </div>
    <canvas
      class="drawBoard"
      id="drawCanvasBoard"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
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
            :disabled="playerStateStore.playerState!==PlayerState.PLAYING_DRAWING"
    >清空</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import {useGlobalSettings, usePlayerStateStore} from "../../store/store";
import { storeToRefs } from "pinia";
import { PlayerState } from "../../types/types";
import {rgbToHex} from "@/utils/utils";

export default defineComponent({
  name: "drawBox",
  emits: ["drawOnePath"],
  setup(props, context) {
    let mouseTrace = [] as any;
    let drawContext = null as any;
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
    let offsetTopRoom=0
    let offsetLeftRoom=0;
    let isDown=0;
    let lstX=-1
    let lstY=-1
    const globalSettings=useGlobalSettings()
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
    /*
    const onMouseDown = function (e: any) {
      if (playerState.value === PlayerState.PLAYING_DRAWING) {
        return;
      }
      if(lstX===-1&&lstY===-1){
        lstX=Math.max(e.offsetX-1,0);
        lstY=Math.max(e.offsetY-1,0);;
      }
      if (penType.value === 0) {
        drawContext.strokeStyle = "#E6E6E6";
        drawContext.lineWidth = 15;
      } else {
        drawContext.strokeStyle = rgbToHex(redColor.value,greenColor.value,blueColor.value);
        drawContext.lineWidth = 3;
      }
      mouseTrace = [
        [penType.value, drawContext.strokeStyle, drawContext.lineWidth],
        [lstX/canvasWidth,lstY/canvasHeight,e.offsetX/canvasWidth, e.offsetY/canvasHeight],
      ];

      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(e.offsetX, e.offsetY);
      drawContext.closePath();
      drawContext.stroke()
      lstX=e.offsetX;
      lstY=e.offsetY;
    };
    const onMouseMove = function (e: any) {
      if (playerState.value === PlayerState.PLAYING_DRAWING) {
        return;
      }
      mouseTrace.push([lstX/canvasWidth,lstY/canvasHeight,e.offsetX/canvasWidth, e.offsetY/canvasHeight]);

      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(e.offsetX, e.offsetY);
      drawContext.closePath();
      drawContext.stroke()
      lstX=-1;
      lstY=-1;
    };
    const onMouseUp = function (e: any) {
      if (playerState.value === PlayerState.PLAYING_DRAWING) {
        return;
      }
      mouseTrace.push([lstX/canvasWidth,lstY/canvasHeight,e.offsetX/canvasWidth, e.offsetY/canvasHeight]);
      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(e.offsetX, e.offsetY);
      drawContext.closePath();
      drawContext.stroke()
      context.emit("drawOnePath", mouseTrace);
    };
    */
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
    const onTouchStart = function(e:any) {
      e.preventDefault();
      /*
      if ((playerState.value === PlayerState.PLAYING_DRAWING)) {
        return;
      }
      let x=e.targetTouches[0].pageX-offsetLeftRoom
      let y=e.targetTouches[0].pageY-offsetTopRoom
      if(lstX===-1&&lstY===-1){
        lstX=Math.max(x-1,0)
        lstY=Math.max(y-1,0)
      }
      if (penType.value === 0) {
        drawContext.strokeStyle = "#E6E6E6";
        drawContext.lineWidth = 15;
      } else {
        drawContext.strokeStyle = rgbToHex(redColor.value,greenColor.value,blueColor.value);
        drawContext.lineWidth = 3;
      }
      mouseTrace = [
        [penType.value, drawContext.strokeStyle, drawContext.lineWidth],
        [lstX/canvasWidth,lstY/canvasHeight,x/canvasWidth, y/canvasHeight,0.5],
      ];



      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(x, y);
      drawContext.closePath();
      drawContext.stroke()
      lstX=x
      lstY=y
       */
    }
    const onTouchMove = function(e:any){
      e.preventDefault();
      /*
      if ((playerState.value === PlayerState.PLAYING_DRAWING)) {
        return;
      }
      if(lstX===-1&&lstY===-1){
        return;
      }
      let x=e.targetTouches[0].pageX-offsetLeftRoom
      let y=e.targetTouches[0].pageY-offsetTopRoom

      mouseTrace.push([lstX/canvasWidth,lstY/canvasHeight,x/canvasWidth, y/canvasHeight,0.5]);
      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(x, y);
      drawContext.closePath();
      drawContext.stroke()
      lstX=x
      lstY=y


       */
    }
    const onTouchEnd = function(e:any){
      e.preventDefault();
      /*
      if ((playerState.value === PlayerState.PLAYING_DRAWING)) {
        return;
      }
      let x=e.targetTouches[0].pageX-offsetLeftRoom
      let y=e.targetTouches[0].pageY-offsetTopRoom
      mouseTrace.push([lstX/canvasWidth,lstY/canvasHeight,x/canvasWidth, y/canvasHeight,0.5]);
      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(x, y);
      drawContext.closePath();
      drawContext.stroke()
      lstX=-1
      lstY=-1
      context.emit("drawOnePath", mouseTrace);

       */
    }

    const onPointerDown =  (e: any)=>{
      e.preventDefault()
      if ((playerState.value !== PlayerState.PLAYING_DRAWING)) {
        return;
      }
      if(lstX===-1&&lstY===-1){
        lstX=Math.max(e.offsetX-1,0);
        lstY=Math.max(e.offsetY-1,0);;
      }else{
        context.emit("drawOnePath", mouseTrace);
        lstX=Math.max(e.offsetX-1,0);
        lstY=Math.max(e.offsetY-1,0);;
      }
      if (penType.value === 0) {
        drawContext.strokeStyle = "#E6E6E6";
        drawContext.lineWidth = 15;
      } else {
        drawContext.strokeStyle = rgbToHex(redColor.value,greenColor.value,blueColor.value);
        drawContext.lineWidth = 5;
      }
      mouseTrace = [
        [penType.value, drawContext.strokeStyle, drawContext.lineWidth],
        [lstX/canvasWidth,lstY/canvasHeight,e.offsetX/canvasWidth, e.offsetY/canvasHeight,e.pressure],
      ];
      drawContext.lineWidth=15*e.pressure;
      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(e.offsetX, e.offsetY);
      drawContext.closePath();
      drawContext.stroke()
      lstX=e.offsetX;
      lstY=e.offsetY;
    };
    const onPointerMove = (e: any)=>{
      e.preventDefault()
      if ((playerState.value !== PlayerState.PLAYING_DRAWING)) {
        return;
      }
      if(lstX===-1&&lstY===-1){
        return;
      }
      mouseTrace.push([lstX/canvasWidth,lstY/canvasHeight,e.offsetX/canvasWidth, e.offsetY/canvasHeight,e.pressure]);
      drawContext.lineWidth=15*e.pressure;
      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(e.offsetX, e.offsetY);
      drawContext.closePath();
      drawContext.stroke()
      lstX=e.offsetX;
      lstY=e.offsetY;
    };
    const onPointerUp = (e: any)=>{
      e.preventDefault()
      if ((playerState.value !== PlayerState.PLAYING_DRAWING)) {
        return;
      }
      mouseTrace.push([lstX/canvasWidth,lstY/canvasHeight,e.offsetX/canvasWidth, e.offsetY/canvasHeight,e.pressure]);
      drawContext.lineWidth=15*e.pressure;
      drawContext.beginPath();
      drawContext.moveTo(lstX, lstY);
      drawContext.lineTo(e.offsetX, e.offsetY);
      drawContext.closePath();
      drawContext.stroke()
      lstX=-1
      lstY=-1
      context.emit("drawOnePath", mouseTrace);
    };
    onMounted(() => {
      console.log(globalSettings.environment.isMobile,'11111')
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
      const canvasContext: any = canvas.getContext("2d",{desynchronized: true});
      canvasContext.imageSmoothingEnabled=true;
      drawContext = canvasContext;
      let tempRef=document.getElementById("drawRoomMain") as HTMLElement
      offsetTopRoom=tempRef.offsetTop
          +(tempRef.parentElement as HTMLElement).offsetTop
          +((tempRef.parentElement as HTMLElement).parentElement as HTMLElement).offsetTop
      offsetLeftRoom=tempRef.offsetLeft
          +(tempRef.parentElement as HTMLElement).offsetLeft
          +((tempRef.parentElement as HTMLElement).parentElement as HTMLElement).offsetLeft
      watch(timer,(now,pre)=>{
        if(now===playerStateStore.playerInRoom.roomDynamicState.drawTime){
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
            if (now.length === 1) return;
            now.slice(1).forEach((v: any) => {
              drawContext.lineWidth=15*v[4]
              drawContext.beginPath();
              drawContext.moveTo(v[0]*canvasWidth,v[1]*canvasHeight)
              drawContext.lineTo(v[2]*canvasWidth, v[3]*canvasHeight);
              drawContext.closePath();
              drawContext.stroke();
            });
          }
        }
      });
    });
    return {

      //onMouseMove,
      //onMouseUp,
      //onMouseDown,
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
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      offsetTopRoom,
      offsetLeftRoom,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      lstX,
      lstY,
      PlayerState
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
