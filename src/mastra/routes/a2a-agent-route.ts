import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

interface A2ARequestBody {
	jsonrpc?: string;
	id?: string;
	method?: string;
	params?: {
		message?: any;
		messages?: any[];
		contextId?: string;
		taskId?: string;
		metadata?: Record<string, any>;
	};
}

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
	method: "POST",
	handler: async (c) => {
		try {
			const mastra = c.get("mastra");
			const agentId = c.req.param("agentId");

			// --- Safely parse JSON body ---
			let body: A2ARequestBody = {};
			try {
				body = (await c.req.json()) as A2ARequestBody;
			} catch {
				body = {}; // Default to empty object if body parsing fails
			}

			const { jsonrpc, id: requestId, params } = body || {};

			// --- Handle completely empty requests ---
			if (!jsonrpc && !requestId && !params) {
				return c.json(
					{
						jsonrpc: "2.0",
						id: null,
						result: {
							id: randomUUID(),
							contextId: randomUUID(),
							kind: "task",
							status: {
								state: "completed",
								timestamp: new Date().toISOString(),
								message: {
									kind: "message",
									role: "agent",
									messageId: randomUUID(),
									parts: [
										{
											kind: "text",
											text: "No input received — But I am all ears",
										},
									],
								},
							},
							artifacts: [],
							history: [],
						},
					},
					200
				);
			}

			// --- Validate JSON-RPC 2.0 structure ---
			if (jsonrpc !== "2.0" || !requestId) {
				return c.json(
					{
						jsonrpc: "2.0",
						id: requestId || null,
						error: {
							code: -32600,
							message:
								'Invalid Request: "jsonrpc" must be "2.0" and "id" must be provided.',
						},
					},
					400
				);
			}

			// --- Retrieve the agent ---
			const agent = mastra.getAgent(agentId);
			if (!agent) {
				return c.json(
					{
						jsonrpc: "2.0",
						id: requestId,
						error: {
							code: -32602,
							message: `Agent '${agentId}' not found.`,
						},
					},
					404
				);
			}

			// --- Extract parameters ---
			const { message, messages, contextId, taskId, metadata } = params || {};

			let messagesList: any[] = [];
			if (message) {
				messagesList = [message];
			} else if (Array.isArray(messages)) {
				messagesList = messages;
			}

			// --- Convert messages to Mastra format ---
			const mastraMessages = messagesList.map((msg) => ({
				role: msg.role,
				content:
					msg.parts
						?.map((part: any) => {
							if (part.kind === "text") return part.text;
							if (part.kind === "data") return JSON.stringify(part.data);
							return "";
						})
						.join("\n") || "",
			}));

			// --- Generate agent response ---
			const response = await agent.generate(mastraMessages);
			const agentText = response.text || "No response generated.";

			// --- Build artifacts ---
			const artifacts = [
				{
					artifactId: randomUUID(),
					name: `${agentId}Response`,
					parts: [{ kind: "text", text: agentText }],
				},
			];

			if (response.toolResults?.length > 0) {
				artifacts.push({
					artifactId: randomUUID(),
					name: "ToolResults",
					parts: response.toolResults.map((result: any) => ({
						kind: "data",
						text: typeof result === "string" ? result : JSON.stringify(result),
					})),
				});
			}

			// --- Build conversation history ---
			const history = [
				...messagesList.map((msg) => ({
					kind: "message",
					role: msg.role,
					parts: msg.parts,
					messageId: msg.messageId || randomUUID(),
					taskId: msg.taskId || taskId || randomUUID(),
				})),
				{
					kind: "message",
					role: "agent",
					parts: [{ kind: "text", text: agentText }],
					messageId: randomUUID(),
					taskId: taskId || randomUUID(),
				},
			];

			// --- Return A2A-compliant response ---
			return c.json({
				jsonrpc: "2.0",
				id: requestId,
				result: {
					id: taskId || randomUUID(),
					contextId: contextId || randomUUID(),
					status: {
						state: "completed",
						timestamp: new Date().toISOString(),
						message: {
							messageId: randomUUID(),
							role: "agent",
							parts: [{ kind: "text", text: agentText }],
							kind: "message",
						},
					},
					artifacts,
					history,
					kind: "task",
				},
			});
		} catch (error: any) {
			console.error("A2A route error:", error);
			return c.json(
				{
					jsonrpc: "2.0",
					id: null,
					error: {
						code: -32603,
						message: "Internal error",
						data: { details: error.message || "Unknown error" },
					},
				},
				500
			);
		}
	},
});
