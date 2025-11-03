import { Mastra } from "@mastra/core";
import { projecthor } from "./agents/projecthor";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { a2aAgentRoute } from "./routes/a2a-agent-route";
export const mastra = new Mastra({
	agents: { projecthor },
	storage: new LibSQLStore({ url: "file:./mastra.db" }),
	logger: new PinoLogger({
		name: "Mastra",
		level: "debug",
	}),
	observability: {
		default: { enabled: true },
	},
	server: {
		build: {
			openAPIDocs: true,
			swaggerUI: true,
		},
		apiRoutes: [a2aAgentRoute],
	},
});
