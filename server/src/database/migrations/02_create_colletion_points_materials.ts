import Knex from "knex";

export async function up(knex: Knex) {
  return knex.schema.createTable("collection_points_materials", (table) => {
    table.increments("id").primary();
    table
      .integer("material_id")
      .notNullable()
      .notNullable()
      .references("id")
      .inTable("materials");
    table
      .integer("collection_point_id")
      .notNullable()
      .references("id")
      .inTable("colletion_points");
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable("collection_points_materials");
}
