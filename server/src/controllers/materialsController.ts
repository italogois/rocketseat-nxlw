import { Request, Response } from "express";
import Knex from "../database/connection";

class MaterialsControlers {
  async index(req: Request, res: Response) {
    const materials = await Knex("materials").select("*");
    const serializedItems = materials.map((material) => {
      return {
        ...material,
        image_url: `http://192.168.1.6:3333/uploads/${material.image}`,
      };
    });

    return res.json(serializedItems);
  }
}

export default MaterialsControlers;
