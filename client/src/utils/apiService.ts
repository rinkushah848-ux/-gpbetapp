import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface RoomData {
  _id: string;
  name: string;
  fee: number;
  type: string;
  size: string;
  headshot: string;
  rounds: string;
  coin: string;
  throwable: string;
  charAbility: string;
  character: string;
  gun: string;
  unallowedGuns: string[];
  unallowedChars: string[];
  unallowedArmor: string;
  creator: { _id: string; username: string; uid: string; points: number };
  creatorName: string;
  status: string;
  joinedBy: { _id: string; username: string; uid: string; points: number } | null;
  joinedByName: string;
  joinStatus: string;
  roomIdPass: string;
  roomPass: string;
  winner: any;
  createdAt: string;
}

export interface GameData {
  _id: string;
  room: string | any;
  player1: { _id: string; username: string; uid: string; points: number };
  player2: { _id: string; username: string; uid: string; points: number };
  status: string;
  screenshot1: string;
  screenshot2: string;
  message1: string;
  message2: string;
  winner: any;
  reviewedBy: any;
  pointsAwarded: number;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  private updateToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  // ---- ROOMS ----
  async getRooms() {
    this.updateToken();
    const res = await this.api.get<{ rooms: RoomData[] }>('/api/rooms');
    return res.data.rooms;
  }

  async getMyRoom() {
    this.updateToken();
    const res = await this.api.get<{ room: RoomData | null }>('/api/rooms/mine');
    return res.data.room;
  }

  async createRoom(data: any) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>('/api/rooms', data);
    return res.data.room;
  }

  async joinRoom(id: string) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>(`/api/rooms/${id}/join`);
    return res.data.room;
  }

  async acceptJoin(id: string) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>(`/api/rooms/${id}/accept`);
    return res.data.room;
  }

  async rejectJoin(id: string) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>(`/api/rooms/${id}/reject`);
    return res.data.room;
  }

  async giveIdPass(id: string, roomId: string, roomPass?: string) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>(`/api/rooms/${id}/give-idpass`, { roomId, roomPass });
    return res.data.room;
  }

  async finishRoom(id: string) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>(`/api/rooms/${id}/finish`);
    return res.data.room;
  }

  async cancelRoom(id: string) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>(`/api/rooms/${id}/cancel`);
    return res.data.room;
  }

  async cancelJoin(id: string) {
    this.updateToken();
    const res = await this.api.post<{ room: RoomData }>(`/api/rooms/${id}/cancel-join`);
    return res.data.room;
  }

  async deleteRoom(id: string) {
    this.updateToken();
    const res = await this.api.delete<{ message: string }>(`/api/rooms/${id}`);
    return res.data;
  }

  // ---- GAMES ----
  async uploadScreenshot(roomId: string, screenshot: string, message: string) {
    this.updateToken();
    const res = await this.api.post<{ game: GameData }>('/api/games/upload-screenshot', { roomId, screenshot, message });
    return res.data.game;
  }

  async getGameReview(roomId: string) {
    this.updateToken();
    const res = await this.api.get<{ game: GameData }>(`/api/games/review/${roomId}`);
    return res.data.game;
  }

  async getPendingReviews() {
    this.updateToken();
    const res = await this.api.get<{ games: GameData[] }>('/api/games/pending-review');
    return res.data.games;
  }

  async approveGame(gameId: string, winnerId: string) {
    this.updateToken();
    const res = await this.api.post<{ game: GameData }>(`/api/games/approve/${gameId}`, { winnerId });
    return res.data.game;
  }

  // ---- ADMIN ----
  async getAdminUsers() {
    this.updateToken();
    const res = await this.api.get<{ users: any[] }>('/api/admin/users');
    return res.data.users;
  }

  async adminCredit(userId: string, amount: number, description: string) {
    this.updateToken();
    const res = await this.api.post('/api/admin/credit', { userId, amount, description });
    return res.data;
  }

  async adminDebit(userId: string, amount: number, description: string) {
    this.updateToken();
    const res = await this.api.post('/api/admin/debit', { userId, amount, description });
    return res.data;
  }

  async getTransactions() {
    this.updateToken();
    const res = await this.api.get('/api/admin/transactions');
    return res.data.transactions;
  }
}

export default new ApiService();
