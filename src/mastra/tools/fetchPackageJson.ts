import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Buffer } from "buffer"; // For decoding Base64

// 1. DEFINE THE TOOL
export const fetchPackageJsonTool = createTool({
	id: "fetchPackageJson",
	description:
		"Fetches the package.json file from a GitHub repo and returns a list of dependencies.",

	// 2. DEFINE THE INPUT (Same as your other tool)
	inputSchema: z.object({
		owner: z.string().describe("GitHub username or organization"),
		repo: z.string().describe("Repository name"),
	}),

	// 3. DEFINE THE OUTPUT (Specific to this tool)
	outputSchema: z.object({
		dependencies: z
			.array(z.string())
			.describe("A list of production dependencies (e.g., 'express', 'react')"),
		devDependencies: z
			.array(z.string())
			.describe(
				"A list of development dependencies (e.g., 'typescript', 'jest')"
			),
	}),

	// 4. DEFINE THE EXECUTE FUNCTION
	execute: async ({ context }) => getPackageJson(context.owner, context.repo),
});

// 5. IMPLEMENT THE HELPER FUNCTION
async function getPackageJson(owner: string, repo: string) {
	const res = await fetch(
		// The API endpoint for a specific file is /contents/
		`https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
		{
			method: "GET",
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
			},
		}
	);

	// Gracefully handle 404 (Not Found)
	// This is not an "error", it just means it's not a Node.js project.
	if (res.status === 404) {
		return { dependencies: [], devDependencies: [] };
	}

	// Handle other real errors
	if (!res.ok) {
		throw new Error(
			`Failed to fetch package.json: ${res.status} ${res.statusText}`
		);
	}

	const data = await res.json();

	// Check for content and encoding
	if (data && data.content && data.encoding === "base64") {
		const decodedContent = Buffer.from(data.content, "base64").toString("utf8");

		// --- This is the new, crucial part ---
		// Parse the decoded text into a JSON object
		const packageJson = JSON.parse(decodedContent);

		// Extract just the package names (the keys)
		const deps = packageJson.dependencies
			? Object.keys(packageJson.dependencies)
			: [];
		const devDeps = packageJson.devDependencies
			? Object.keys(packageJson.devDependencies)
			: [];
		// --- End of new part ---

		return {
			dependencies: deps,
			devDependencies: devDeps,
		};
	} else {
		throw new Error("Could not decode package.json content.");
	}
}
