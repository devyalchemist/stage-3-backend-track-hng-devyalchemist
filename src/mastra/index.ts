import { Mastra } from "@mastra/core";
import { projecthor } from "./agents/projecthor";
import { weatherWorkflow } from "./workflows/weather-workflow";

export const mastra = new Mastra({
	agents: { projecthor },
	workflows: { weatherWorkflow },
});
