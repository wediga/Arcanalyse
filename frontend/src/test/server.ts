import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Single MSW server for the whole test process
export const server = setupServer(...handlers);
