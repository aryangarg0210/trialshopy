import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { OpenAPIObject } from "@nestjs/swagger";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { json, urlencoded } from "express";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { auth } from "./common/auth";
import { config } from "./common/config";
import { GlobalExceptionFilter } from "./common/filter/global-exception.filter";

// Better Auth mounts /api/auth/* via a catch-all, so those routes don't show up
// in NestJS's Swagger scan. Its openAPI plugin can generate their schema, which
// we fold into the same /docs so signup/signin/etc. are visible in one place.
async function mergeAuthOpenApi(document: OpenAPIObject) {
	try {
		const authSchema = (await auth.api.generateOpenAPISchema()) as {
			paths?: Record<string, unknown>;
			components?: { schemas?: Record<string, unknown> };
		};
		const paths = document.paths as Record<string, unknown>;
		for (const [path, def] of Object.entries(authSchema.paths ?? {})) {
			paths[`/api/auth${path}`] = def;
		}
		document.components ??= {};
		document.components.schemas = {
			...(document.components.schemas ?? {}),
			...(authSchema.components?.schemas ?? {}),
		} as NonNullable<OpenAPIObject["components"]>["schemas"];
	} catch (error) {
		console.error("Failed to merge Better Auth OpenAPI schema:", error);
	}
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false, // Required for Better Auth
	});

	app.enableCors({
		origin: config.urls.cors,
		credentials: true,
	});
	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (errors) => {
				return new BadRequestException({
					message: "Something went wrong",
					data: errors,
				});
			},
			whitelist: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: false,
			},
		}),
	);
	app.useGlobalFilters(new GlobalExceptionFilter());
	app.use(json({ limit: "10mb" }));
	app.use(urlencoded({ extended: true, limit: "10mb" }));
	app.setGlobalPrefix("/api");
	app.useLogger(app.get(Logger));

	const swaggerConfig = new DocumentBuilder()
		.setTitle("TrialShopy API")
		.setDescription("TrialShopy API Documentation")
		.setVersion("1.0")
		.addCookieAuth("better-auth.session_token")
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	await mergeAuthOpenApi(document);
	if (config.environment !== "production") {
		SwaggerModule.setup("docs", app, document);
	}

	await app.listen(config.port, config.host);
}
bootstrap();
