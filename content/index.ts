import { departments } from "./departments.ts";
import { technologies } from "./technologies.ts";
import { roadmaps } from "./roadmaps.ts";
import programmingLanguages from "./resources/programming-languages.ts";
import webDevelopment from "./resources/web-development.ts";
import cloudComputing from "./resources/cloud-computing.ts";
import devops from "./resources/devops.ts";
import databases from "./resources/databases.ts";
import computerScience from "./resources/computer-science.ts";
import mobileDevelopment from "./resources/mobile-development.ts";
import aiMachineLearning from "./resources/ai-machine-learning.ts";
import uiUxDesign from "./resources/ui-ux-design.ts";

export const resources = [
  ...programmingLanguages,
  ...webDevelopment,
  ...cloudComputing,
  ...devops,
  ...databases,
  ...computerScience,
  ...mobileDevelopment,
  ...aiMachineLearning,
  ...uiUxDesign,
];

export { departments, technologies, roadmaps };
