<template>
  <div class="drawRoomMain"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { usePlayerStateStore } from "../../store/store";

export default defineComponent({
  name: "drawBox",
  emits: [],
  setup(props, context) {
    return {};
  },
});
</script>

<style scoped>
.drawRoomMain {
  background-color: rgb(230, 230, 230);
}
</style>
