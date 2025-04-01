import socketMiddleware from "../middleware/socket.middleware.js";
import { RoomEventEnum } from "../utils/RoomEvents.js";

const socketService = {
  // Mounting the room join event
  mountRoomJoinEvent: (socket) => {
    socket.on(RoomEventEnum.JOIN_ROOM_EVENT, (roomId) => {
      console.log(`${socket.user?.username} joined room ${roomId}`);
      socket.join(roomId);
    });
  },

  // Mounting the start game event
  mountStartGameEvent: (socket) => {
    socket.on(RoomEventEnum.START_GAME_EVENT, (roomId) => {
      console.log(`${socket.user?.username} started game in room ${roomId}`);
      socket.to(roomId).emit(RoomEventEnum.START_GAME_EVENT);
    });
  },

  // Mounting the next question event
  mountNextQuestionEvent: (socket) => {
    socket.on(RoomEventEnum.NEXT_QUESTION_EVENT, (roomId) => {
      console.log(`Next question in room ${roomId}`);
      socket.to(roomId).emit(RoomEventEnum.NEXT_QUESTION_EVENT);
    });
  },

  initializeSocketIO: (io) => {
    // Middleware for socket authentication
    io.use(socketMiddleware.verifySocketAuth);

    // Connection handling
    return io.on("connection", (socket) => {
      socket.join(socket.user?._id.toString());
      socket.emit(RoomEventEnum.CONNECTED_EVENT);
      console.log(
        `${socket.user?.username} connected 🗼. userId: ${socket.user?._id}`
      );

      // Common events that needs to be mounted on the initialization
      socketService.mountRoomJoinEvent(socket);
      socketService.mountStartGameEvent(socket);
      socketService.mountNextQuestionEvent(socket);

      // Disconnect handling
      socket.on(RoomEventEnum.DISCONNECTED_EVENT, () => {
        console.log(`${socket.user?.username} disconnected`);
        socket.leave(socket.user?._id);
      });

      // Error handling
      socket.on("error", (err) => {
        console.log(`Socket error: ${err.message}`);
        socket.emit("error", { error: err.message });
      });
    });
  },

  emitSocketEvent: (req, roomId, event, data) => {
    console.log(`Emitting event ${event} to room ${roomId}`);
    req.app.get("io").to(roomId).emit(event, data);
  },
};

export default socketService;
