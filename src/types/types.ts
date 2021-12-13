enum PlayerState {
  PENDING,
  CONNECTED,
  HANGING,
  INROOM_WAITING,
  INROOM_READY,
  PLAYING_ANSWERING,
  PLAYING_DRAWING,
  DISCONNECTED,
}
interface GlobalSetting {
  Volume: number;
}

interface PlayerInfo {
  [key: string]: string | boolean;

  name: string;
  id: string;
  ready: boolean;
}
type PlayerRawInfo = PlayerInfo;
interface RoomBaseInfo {
  roomName: string;
  roomId: string;
  maxUsers: number;
  onwerId: string;
}

interface RoomDynamicState {
  wordLib: string;
  round: number;
  drawTime: number;
  userInRoom: number;
  users: Array<PlayerInfo>;
  isPlaying: boolean;
  privacy: boolean
}
interface RoomDetailInfo {
  roomBaseInfo: RoomBaseInfo;
  roomDynamicState: RoomDynamicState;
}
interface RespondRawInfo {
  room_name: string;
  room_id: string;
  max_users: number;
  owner_id: string;
  word_lib: string;
  round: number;
  draw_time: number;
  user_in_room: number;
  privacy:boolean;
  users: Array<PlayerInfo>;
  is_playing: boolean;
}
interface ChatInfo {
  playerName: string;
  text: string;
}
type RequestRawInfo = RespondRawInfo;
export {
  PlayerInfo,
  RoomDetailInfo,
  RoomBaseInfo,
  RoomDynamicState,
  PlayerState,
  RespondRawInfo,
  RequestRawInfo,
  PlayerRawInfo,
  ChatInfo,
};
