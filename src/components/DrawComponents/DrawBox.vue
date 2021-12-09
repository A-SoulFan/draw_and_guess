<template>
  <div class="drawRoomMain" id="drawRoomMain">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { usePlayerStateStore } from "../../store/store";

export default defineComponent({
  name: "drawBox",
  emits: ["drawOnePath"],
  setup(props, context) {
    let mouseTrace = [] as any;
    let drawContext = null as any;
    let drawFlag = false;
    let penType = ref(1);
    const onMouseDown = function (e: any) {
      mouseTrace = [[e.offsetX, e.offsetY]];
      drawFlag = true;
      if (penType.value === 0) {
        drawContext.strokeStyle = "#E6E6E6";
        drawContext.lineWidth = 15;
      } else {
        drawContext.strokeStyle = "#000";
        drawContext.lineWidth = 3;
      }
      drawContext.beginPath();
      drawContext.moveTo(e.offsetX, e.offsetY);
    };
    const onMouseMove = function (e: any) {
      if (drawFlag) {
        mouseTrace.push([e.offsetX, e.offsetY]);
        drawContext.lineTo(e.offsetX, e.offsetY);
        drawContext.stroke();
      }
    };
    const onMouseUp = function (e: any) {
      drawFlag = false;
      drawContext.closePath();
    };
    const onPenChose = function () {
      penType.value = 0;
    };
    const onEraserChose = function () {
      penType.value = 1;
    };
    onMounted(() => {
      const canvas: any = document.getElementById("drawCanvasBoard");
      const drawRoom: any = document.getElementById("drawRoomMain");
      canvas.width = drawRoom.offsetWidth;
      canvas.height = drawRoom.offsetHeight;
      const canvasContext: any = canvas.getContext("2d");
      drawContext = canvasContext;
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
    };
  },
});
</script>

<style scoped>
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
</style>
