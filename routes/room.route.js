import { Router } from "express";
import roomController from "../controllers/room.controller.js";
import userMiddelware from "../middleware/user.middleware.js";

const roomRouter = Router();

roomRouter.use(userMiddelware.verifyToken);

roomRouter.post("/create-room", roomController.createRoom);
roomRouter.get("/get-rooms", roomController.getRooms);

export default roomRouter;