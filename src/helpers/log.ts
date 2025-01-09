import chalk from "chalk";
import dayjs from "dayjs";

// Initialize the package name
const packageName = chalk.white.bold.bgGreenBright(" @advena/supabase ");

/**
 * Logs a message with a timestamp.
 *
 * @param message - The message to log.
 */
export const log = (
    message: string,
    level?: "debug" | "info" | "error" | "warn",
    throws = false,
    verbose?: boolean,
) => {
    // Check if the message should be verbose
    if (verbose && process?.env?.NODE_ENV !== "development") return;

    // Get the current time
    const time = chalk.gray(dayjs().format("HH:mm:ss"));

    // Parameterise the message
    const output = `${packageName} ${time} ${message}`;

    // Log the message
    console.log(output);

    // Check if the message should throw
    if (throws) throw new Error(output);
};
