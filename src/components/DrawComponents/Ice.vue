<template>
  <div class="iceSkating">
    <iframe src="https://fm.asoulfan.com/public/asoul-fm/embed?theme=dark" frameborder="0" allowtransparency="true" style="width: 100%; min-height: 150px; border: 0;"></iframe>
  </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  name:'iceSkating',
  setup(){
    return{

    }
  }
})
</script>

<style scoped>
.iceSkating{
  background-color:rgba(0,0,0,0.8);
  border:3px solid black;
  border-radius: 8px;
  opacity:0.8;
}
</style>