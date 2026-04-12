/* eslint-disable */
/**
 * Generated data model types.
 *
 * Regenerate with `npx convex dev`.
 * @module
 */

import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 */
export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

export type Id<TableName extends TableNames = TableNames> =
  GenericId<TableName>;
