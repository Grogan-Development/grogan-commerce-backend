import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260116235858 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "engraving_template" ("id" text not null, "name" text not null, "product_type" text not null, "canvas_config" jsonb not null, "constraints" jsonb null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "engraving_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_engraving_template_deleted_at" ON "engraving_template" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "engraving_zone" ("id" text not null, "name" text not null, "position" jsonb not null, "type" text check ("type" in ('text', 'image', 'both')) not null, "constraints" jsonb null, "template_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "engraving_zone_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_engraving_zone_template_id" ON "engraving_zone" ("template_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_engraving_zone_deleted_at" ON "engraving_zone" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "engraving_zone" add constraint "engraving_zone_template_id_foreign" foreign key ("template_id") references "engraving_template" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "engraving_zone" drop constraint if exists "engraving_zone_template_id_foreign";`);

    this.addSql(`drop table if exists "engraving_template" cascade;`);

    this.addSql(`drop table if exists "engraving_zone" cascade;`);
  }

}
