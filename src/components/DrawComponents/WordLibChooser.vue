<template>
  <div class="wordLibChooser">
    <img src="../../assets/Draw/x.png" @click="onCloseClicked" class="exitbtn">
    <span style="font-size:1rem">本地词库</span>
    <div class="localWordLibStore">
      <ul>
        <li v-for="item in globalSettings.localWordList" :key="item">
          <div class="localWordListStyle">
            <img src="../../assets/Draw/x.png" @click="delWordLib(item)">{{item}}
          </div>
        </li>
      </ul>
    </div>
    <span style="font-size:1rem">网络词库</span>
    <div class="wordlibBrowser">
      <ul>
        <li v-for="item in globalSettings.wordList.filter((v)=>{
          console.log(1)
          return !globalSettings.localWordList.includes(v);
        })" :key="item">
          <div class="wordListStyle">
            <img src="../../assets/Draw/save.png" @click="saveWordLib(item)">{{item}}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useGlobalSettings} from "@/store/store";

export default defineComponent({
  name:"wordLibChooser",
  emits:["onCloseClicked"],
  setup(props,ctx){
    const globalSettings = useGlobalSettings()
    const saveWordLib =function(word:string){
      globalSettings.appendLocalWordLib(word)
      globalSettings.deleteWordLib(word)
    }
    const delWordLib = function(word:string){
      globalSettings.deleteLocalWordLib(word)
      globalSettings.updateWordLib(word)
    }
    const onCloseClicked =function(){
      ctx.emit("onCloseClicked");
    }
    return{
      globalSettings,
      onCloseClicked,
      saveWordLib,
      delWordLib,
      console
    }
  }
})
</script>

<style lang="scss" scoped>
.wordLibChooser{
  background-color: rgb(230, 230, 230);
  display: flex;
  flex-direction: column;
  justify-content:space-around;
  align-items:center;
  border: 3px solid black;
  border-radius: 8px;
  z-index:99;

}

.localWordLibStore{
  flex:0 0 45%;
  border: 3px solid black;
  border-radius: 8px;
  width:90%;
  overflow-y:scroll;
}
.wordlibBrowser{
  flex:0 0 45%;
  border: 3px solid black;
  border-radius: 8px;
  width:90%;
  overflow-y:scroll;
}
.localWordListStyle{
  display: flex;
  align-items:center;
  margin-top:5%;
  padding-top:2px;
  border-top: 2px solid black;
  font-size:1.6rem;

  img{
    width: 1.3rem;
    margin-right:3px;
    margin-left: 1rem;
  }
  img:hover{
    cursor: pointer;
  }
}
.wordListStyle{
  display: flex;
  align-items:center;
  margin-top:5%;
  padding-top:2px;
  border-top: 2px solid black;
  font-size:1.6rem;
  img{
    width: 1.3rem;
    margin-right:3px;
    margin-left: 1rem;

  }
  img:hover{
    cursor: pointer;
  }
}
.exitbtn{
  position: absolute;
  left:5px;
  top:5px;
  width:1rem;
}
.exitbtn:hover{
  cursor: pointer;
}

</style>
