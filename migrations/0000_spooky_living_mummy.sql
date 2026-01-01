CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"date" text NOT NULL,
	"image" text NOT NULL,
	"category" text NOT NULL,
	"excerpt" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_generations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" varchar NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"year_start" integer NOT NULL,
	"year_end" integer,
	"image" text NOT NULL,
	"description" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_models" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"brand_slug" text NOT NULL,
	"model" text NOT NULL,
	"model_slug" text NOT NULL,
	"category" text NOT NULL,
	"image" text NOT NULL,
	"description" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_variants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" varchar NOT NULL,
	"engine_name" text NOT NULL,
	"slug" text NOT NULL,
	"engine_code" text,
	"displacement" text,
	"fuel_type" text NOT NULL,
	"power" text NOT NULL,
	"torque" text,
	"acceleration" text NOT NULL,
	"top_speed" text,
	"consumption" text NOT NULL,
	"transmission" text NOT NULL,
	"drive_type" text NOT NULL,
	"video_url" text,
	"reliability" integer DEFAULT 3 NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"submitted_by" text,
	"submitted_by_name" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"engine" text NOT NULL,
	"power" text NOT NULL,
	"acceleration" text NOT NULL,
	"consumption" text NOT NULL,
	"drive_type" text NOT NULL,
	"category" text NOT NULL,
	"video_url" text,
	"reliability" integer DEFAULT 3 NOT NULL,
	"status" text DEFAULT 'approved' NOT NULL,
	"submitted_by" text,
	"submitted_by_name" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_generations" ADD CONSTRAINT "car_generations_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_variants" ADD CONSTRAINT "car_variants_generation_id_car_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."car_generations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;