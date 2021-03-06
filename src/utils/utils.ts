import {
  PlayerInfo,
  RoomDetailInfo,
  RoomDynamicState,
  RoomBaseInfo,
  RespondRawInfo,
  RequestRawInfo,
  PlayerRawInfo,
} from "../types/types";

const makeRoomBaseInfo = function (
  e: RespondRawInfo | RequestRawInfo
): RoomBaseInfo {
  return {
    roomName: e.room_name ?? "一个魂儿们一起来玩吧！",
    roomId: e.room_id ?? "-1",
    maxUsers: e.max_users ?? "10",
    onwerId: e.owner_id ?? "-1",
  } as RoomBaseInfo;
};
const makeRoomDynamicState = function (
  e: RespondRawInfo | RequestRawInfo
): RoomDynamicState {
  return {
    wordLib: e.word_lib ?? "abc",
    round: e.round ?? 3,
    drawTime: e.draw_time ?? 60,
    userInRoom: e.user_in_room ?? 0,
    privacy: e.privacy??false,
    users:
      e.users?.map((v: PlayerRawInfo) => makePlayerInfo(v)) ??
      ([] as Array<PlayerInfo>),
    isPlaying: e.is_playing ?? false,
  } as RoomDynamicState;
};
const makeRoomDetailInfo = function (
  e: RespondRawInfo | RequestRawInfo
): RoomDetailInfo {
  return {
    roomBaseInfo: makeRoomBaseInfo(e),
    roomDynamicState: makeRoomDynamicState(e),
  } as RoomDetailInfo;
};
const getUserString = function (num: number): string {
  return num < 10 ? "0" + num : "" + num;
};
const makePlayerInfo = function (e: PlayerRawInfo): PlayerInfo {
  return {
    name: e.name ?? "未知用户",
    id: e.id ?? "-1",
    ready: e.ready ?? false,
  } as PlayerInfo;
};
const demToHex = function (sc:number):string{
  const HEX=['A','B','C','D','E','F']
  let res=''
  while(sc){
    const nowbit=sc%16
    res=(nowbit>=10?HEX[nowbit-10]:`${nowbit}`)+res
    sc=Math.floor(sc/16);
  }
  if(res===''){
    res='00'
  }
  else if(res.length===1){
    res='0'+res
  }
  return res

}
const rgbToHex = function (r:number,g:number,b:number):string{
  return '#'+demToHex(r)+demToHex(g)+demToHex(b);
}
const getToken= function(cookie:string):string|null{
  const rawCookie=cookie.split(';')
  const s = rawCookie.find(v=>{
    const p=v.split('=')
    return p[0].trim()==='asoulFanToken'
  })
  if(s){
    return s.trim().split("=")[1]
  }else{
    return null
  }

}

function isMobileAccurately():boolean{
  const userAgentInfo = navigator.userAgent;

  const mobileAgents = [ "Android", "iPhone", "SymbianOS", "Windows Phone", "iPad","iPod"];

  let mobile_flag = false;

  for (let v = 0; v < mobileAgents.length; v++) {
    if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
      mobile_flag = true;
      break;
    }
  }
  return mobile_flag;
}

export {
  makeRoomBaseInfo,
  makeRoomDynamicState,
  makeRoomDetailInfo,
  getUserString,
  makePlayerInfo,
  rgbToHex,
  getToken,
  isMobileAccurately
};
