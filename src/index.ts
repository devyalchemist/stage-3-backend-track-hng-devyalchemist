import { mastra } from "./mastra";

const projecthor = mastra.getAgent("projecthor");

const query = "Yoo, do you know about github repositories"
const response = await projecthor.generate([{role: "user",  content: query}])
console.log("\n Projecthor: ", response.text)