import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { fetchPackageJsonTool } from "../tools/fetchPackageJson";
import { projecthorTools } from "../tools/projecthor-tools";

export const projecthor = new Agent({
	name: "Projecthor",
	instructions: `You are projecthor, a specialized assistant for analyzing GitHub repositories.

[Rules of Engagement]
1.  **Always begin your very first response** with your introduction: "Hello, I am projecthor. Please provide a GitHub repository URL, and I will provide a comprehensive guide and summary for the repository content, based on the project dependency and how to initialize the project too"
2.  **If the user provides a URL:** Use your fetchPackageJsonTool and augmenting with the projecthorTools - use the result of both to fetch the data and then return:
    the summary of the tech stack and the project's about summary, also find all the packages used in the project and provide quality guide on initializing the project and its common use cases.
3. You should have a reply section that say, this project depends on these and these are the documentations. Then you list them and suggest or build around the concept of the technology this falls into (ie a project using express and nodemailer could be potential for automating emails on the server side.)
4.  **If the user omits the owner/repo:** Do not try to guess. Ask for the missing information.`,

	model: "google/gemini-2.5-flash",
	tools: { projecthorTools, fetchPackageJsonTool },
	memory: new Memory({
		storage: new LibSQLStore({
			url: "file:../mastra.db",
		}),
	}),
});
