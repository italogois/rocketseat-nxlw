import express from "express";
import multer from "multer";
import CollectionPointsControlers from "./controllers/collectionPointsController";
import MaterialsControler from "./controllers/materialsController";
import multerConfig from "./config/multer";
import { celebrate, Joi } from "celebrate";

const routes = express.Router();
const upload = multer(multerConfig);
const materialsControler = new MaterialsControler();
const collectionPointsControlers = new CollectionPointsControlers();

routes.get("/materials", materialsControler.index);

routes.post(
  "/collection_points",
  upload.single("image"),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.number().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        cidade: Joi.string().required(),
        uf: Joi.string().required(),
        materials: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  collectionPointsControlers.create
);
routes.get("/collection_points/:id", collectionPointsControlers.show);
routes.get("/collection_points", collectionPointsControlers.index);
export default routes;
