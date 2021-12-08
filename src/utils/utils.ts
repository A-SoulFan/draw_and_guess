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
    roomName: e.room_name ?? "一个魂儿们，期待你们的加入~",
    roomId: e.room_id ?? "-1",
    maxUsers: e.max_users ?? "20",
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
export {
  makeRoomBaseInfo,
  makeRoomDynamicState,
  makeRoomDetailInfo,
  getUserString,
  makePlayerInfo,
};
