import { createReference } from "~/runtime";
import { type InferSelectModel, sql } from "drizzle-orm";
import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { db } from "~/db";
import { nanoid } from "~/utils/nanoid";

const organisations = mysqlTable("organisations", {
	id: varchar("id", { length: 13 })
		.$defaultFn(() => nanoid())
		.primaryKey(),
	name: varchar("name", { length: 32 }).unique().notNull(),
	createdAt: timestamp("createdAt")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp("updatedAt")
		.default(sql`CURRENT_TIMESTAMP`)
		.onUpdateNow()
		.notNull(),
	deletedAt: timestamp("deletedAt"),
});

export type Organisation = InferSelectModel<typeof organisations>;
export interface Org extends InferSelectModel<typeof organisations> {}
type Org1 = Pick<Organisation, "id" | "name">;
export type { Org1 };
type Org2 = Pick<Organisation, "id" | "name">;
export { type Org2 };

export const getOrganisations = createReference(
	async function getOrganisations() {
		return [
			{
				id: "1",
				name: "Alice",
			},
			{
				id: "2",
				name: "Bob",
			},
		];
		return db.select().from(organisations);
	},
	"test",
	"getOrganisations",
);
