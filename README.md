# 🚀 Projecthor - HNG Stage 3 AI Agent

> An AI agent built with the **Mastra** framework to analyze GitHub repositories.  
> This project is submitted for the **HNG Internship Stage 3** task, demonstrating integration with **Telex.im** via the **A2A protocol**.

---

## 🧠 Overview

**Projecthor** is a specialized AI assistant that acts as an expert GitHub repository analyst.  
When a user in Telex provides a repository URL, Projecthor fetches, analyzes, and synthesizes data from both the `README.md` and `package.json` files to generate a single, comprehensive summary.

This summary includes the project's tech stack, its core purpose, a complete list of all dependencies, and actionable setup guides.

---

## ✨ Core Features

- **README Analysis:** Summarizes the project's purpose, tech stack, and setup instructions from its `README.md`.
- **Dependency Extraction:** Fetches and lists all production (`dependencies`) and development (`devDependencies`) packages from the `package.json` file.
- **Actionable Guidance:** Provides quality setup guides and suggests common use cases based on the detected tech stack (e.g., _“This project uses Express and NodeMailer, making it ideal for automating server-side emails.”_).
- **Persistent Memory:** Built with `LibSQLStore`, the agent remembers the conversation context to answer follow-up questions.
- **A2A Protocol Ready:** Exposes a custom, standardized `/a2a/agent/projecthor` endpoint for seamless integration with **Telex.im**.

---

## 🔗 Live Endpoint & Telex Integration

The agent is deployed on **Mastra Cloud**.  
To integrate with **Telex**, the workflow must call the agent's full **A2A endpoint**.

- **Live A2A Endpoint:**  
  `https://harsh-faint-park.mastra.cloud/a2a/agent/projecthor`

### 🧩 Telex Workflow JSON

Use this JSON in your **Telex.im** workflow to connect to the live agent:

```json
{
  "active": true,
  "category": "utilities",
  "description": "Analyzes GitHub repos for summaries and dependencies.",
  "id": "sGC3u7y4vBaZww0G",
  "long_description": "\n      You are projecthor, a specialized assistant for analyzing GitHub repositories.\n\n      [Rules of Engagement]\n      1.  **Always begin your very first response** with your introduction: \"Hello, I am projecthor. Please provide a GitHub repository URL, and I will provide a comprehensive guide and summary for the repository content, based on the project dependency and how to initialize the project too\"\n      2.  **If the user provides a URL:** Use your fetchPackageJsonTool and augmenting with the projecthorTools - use the result of both to fetch the data and then return:\n          the summary of the tech stack and the project's about summary, also find all the packages used in the project and provide quality guide on initializing the project and its common use cases.\n      3.  You should have a reply section that say, this project depends on these and these are the documentations. Then you list them and suggest or build around the concept of the technology this falls into (ie a project using express and nodemailer could be potential for automating emails on the server side.)\n      4.  **If the user omits the owner/repo:** Do not try to guess. Ask for the missing information.\n",
  "name": "projecthorWorkflow",
  "nodes": [
    {
      "id": "projecthor_agent_node",
      "name": "Projecthor Agent",
      "parameters": {},
      "position": [816, -112],
      "type": "a2a/mastra-a2a-node",
      "typeVersion": 1,
      "url": "https://harsh-faint-park.mastra.cloud/a2a/agent/projecthor"
    }
  ],
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "short_description": "Summarize GitHub repos and list dependencies."
}

| Component      | Technology                          |
| -------------- | ----------------------------------- |
| **Framework**  | Mastra                              |
| **Language**   | TypeScript                          |
| **LLM**        | Google Gemini 2.5 Flash             |
| **Database**   | LibSQLStore (for persistent memory) |
| **Deployment** | Mastra Cloud (with GitHub CI/CD)    |

💻 Running Locally
1️⃣ Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

2️⃣ Install dependencies
npm install

3️⃣ Set up environment variables

Create a .env file in the root directory and add your API keys:

GEMINI_API_KEY="your-gemini-api-key"
GITHUB_TOKEN="your-github-personal-access-token"

4️⃣ Run the development server
npm run dev


The agent will be available locally at http://localhost:4111

📂 Project Structure

The project follows a standard Mastra architecture for clean separation of concerns:

/src
├── agents/         # Agent definitions (projecthor.ts)
├── tools/          # External API tools (fetchReadme.ts, fetchPackageJson.ts)
├── routes/         # Custom API routes (a2aHandler.ts)
├── lib/            # Shared utilities (llm.ts)
└── mastra/
    └── index.ts    # Main Mastra registration for agents, storage, and routes
```
