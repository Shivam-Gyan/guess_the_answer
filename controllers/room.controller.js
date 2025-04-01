import roomService from "../database/services/room.service.js";
import userServices from "../database/services/user.services.js";
import socketService from "../socket/index.js";
import { RoomEventEnum } from "../utils/RoomEvents.js";
import crypto from "crypto";

const roomController = {
  createRoom: async (req, res) => {
    const { name, password, participants } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        message: "Please fill the entire form",
        success: false,
      });
    }

    try {
      const { email } = req.user;

      const user = await userServices.getByEmail(email);

      if (!user) {
        throw new Error("User not found");
      }

      if (participants?.includes(user._id.toString())) {
        throw new Error("Admin cannot be a participant");
      }

      const members = [...new Set([...participants, user._id.toString()])]; // Remove duplicates

      // generate hex of random value for url
      const urlHEX = crypto.randomBytes(10).toString("hex");

      // room ID egenration
      const roomId = `${name}$gta$${urlHEX}`;

      // url generation
      const roomUrl = `${process.env.FRONTEND_URI}room/${roomId}`;

      const room = await roomService.addRoom({
        createdBy: user._id,
        name,
        password,
        roomId,
        url: roomUrl,
        participants: members,
      });

      //
      members?.forEach((member) => {
        socketService.emitSocketEvent(
          req,
          member,
          RoomEventEnum.ROOM_CREATED_EVENT,
          room
        );
      });

      return res.status(201).json({
        message: "Room created successfully",
        success: true,
        room,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },

  getRooms: async (req, res) => {
    try {
      const { email } = req.user;

      const user = await userServices.getByEmail(email);

      if (!user) {
        throw new Error("User not found");
      }

      const rooms = await roomService.getRooms(user._id.toString());

      if (!rooms) {
        return res.status(404).json({
          message: "No rooms found",
          success: false,
        });
      }

      return res.status(200).json({
        message: "Rooms fetched successfully",
        success: true,
        rooms,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  },
};

export default roomController;
