<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@import "~reset-css";
@media screen and (max-width: 1024px) and (min-width: 769px) {
  html {
    font-size: 12px;
  }
}
@media screen and (min-width: 1025px) {
  html {
    font-size: 16px;
  }
}
@media screen and (max-width: 768px) and (min-width: 481px) {
  html {
    font-size: 8px;
  }
}
@media screen and (max-width: 480px) {
  html {
    font-size: 4px;
  }
}
#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(230, 230, 230);
  background-image: url("./assets/Draw/backgroundASF.png");
  background-size: auto 150%;
  background-position: 0 50%;
}
</style>
