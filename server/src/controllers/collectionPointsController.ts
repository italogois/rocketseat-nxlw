import { Request, Response } from "express";
import Knex from "../database/connection";

class CollectionPointsControler {
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      cidade,
      uf,
      materials,
    } = req.body;

    const transaction = await Knex.transaction();

    const insert_collection_points = await transaction(
      "collection_points"
    ).insert({
      name,
      image: req.file.filename,
      email,
      whatsapp,
      latitude,
      longitude,
      cidade,
      uf,
    });

    const collection_point_id = insert_collection_points[0];

    const collection_points_materials = materials
      .split(", ")
      .map((material_id: number) => {
        return {
          material_id,
          collection_point_id,
        };
      });

    await transaction("collection_points_materials").insert(
      collection_points_materials
    );

    await transaction.commit();

    return res.json({
      id: collection_point_id,
      ...collection_points_materials,
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const collectionPoint = await Knex("collection_points")
      .where("id", id)
      .first();

    const serializedPoint = {
      ...collectionPoint,
      image_url: `http://192.168.1.6:3333/uploads/${collectionPoint.image}`,
    };

    const materials = await Knex("materials")
      .join(
        "collection_points_materials",
        "materials.id",
        "=",
        "collection_points_materials.material_id"
      )
      .where("collection_points_materials.collection_point_id", id);

    return collectionPoint
      ? res.json({ serializedPoint, materials })
      : res.status(400).json({ message: "Nada foi encontrado" });
  }

  async index(req: Request, res: Response) {
    const { cidade, uf, materials } = req.query;

    const parsedMaterials = String(materials)
      .split(",")
      .map((material) => Number(material));

    const collectionPoints = await Knex("collection_points")
      .join(
        "collection_points_materials",
        "collection_points.id",
        "=",
        "collection_points_materials.collection_point_id"
      )
      .whereIn("collection_points_materials.material_id", parsedMaterials)
      .where("cidade", String(cidade))
      .where("uf", String(uf))
      .distinct()
      .select("collection_points.*");

    return res.json(collectionPoints);
  }
}

export default CollectionPointsControler;
