import roomModel from '../../models/room.model.js';

const roomService = {

    addRoom: async (room) => {
        const newRoom = new roomModel(room);
        if (!newRoom) {
          throw new Error("Error while adding the room");
        }
        await newRoom.save();
        return newRoom;
    },

    getRooms: async (userId) => {
      const rooms = await roomModel.find({ participants: { $elemMatch: { $eq: userId } } });
      if (!rooms) {
        throw new Error("Error while fetching the rooms");
      }
      return rooms;
    },

    getRoomById: async (roomId) => {
      const room = await roomModel.findById(roomId);
      if (!room) {
        throw new Error("Error while fetching the room");
      }
      return room;
    },

    addParticipants: async (roomId, participants) => {
      const room = await roomModel.findById(roomId);
      if (!room) {
        throw new Error("Error while fetching the room");
      }
      room.participants.push(...participants);
      await room.save();
      return room;
    },
}

export default roomService;