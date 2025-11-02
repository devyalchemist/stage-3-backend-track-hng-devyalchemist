import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { Buffer } from "buffer";
interface RepoResponse {
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
	license: { name: string } | null;
	pushed_at: string;
	description: string | null;
}

export const projecthorTools = createTool({
	id: "get-github-repo-info",
	description: "Fetch basic insights for a public GitHub repository",
	inputSchema: z.object({
		owner: z.string().describe("GitHub username or organization"),
		repo: z.string().describe("Repository name"),
	}),
	outputSchema: z.object({
		stars: z.number(),
		forks: z.number(),
		issues: z.number(),
		license: z.string().nullable(),
		lastPush: z.string(),
		description: z.string().nullable(),
	}),
	execute: async ({ context }) => getRepo(context.owner, context.repo),
});

async function getRepo(owner: string, repo: string) {
	// const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {method: "POST", headers: { "Content-type

	// }});
	const res = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/readme`,
		{
			method: "GET",
			headers: {
				Accept: "application/vnd.github.v3+json",
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				// You don't need 'Content-Type' for a GET request
			},
		}
	);
	console.log(process.env.GITHUB_TOKEN);
	if (res.status === 404)
		throw new Error(`Repository ${owner}/${repo} not found`);
	// const data: RepoResponse = await res.json();
	const data = await res.json();
	const decodedContent = Buffer.from(data.content, "base64").toString("utf8");
	console.log(data);
	return {
		readMe: decodedContent,
		// stars: data.stargazers_count,
		// forks: data.forks_count,
		// issues: data.open_issues_count,
		// license: data.license?.name ?? null,
		// lastPush: data.pushed_at,
		// description: data.description,
	};
}
