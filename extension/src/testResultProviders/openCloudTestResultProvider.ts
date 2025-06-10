import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";
import TestEZ from "../TestEZTypes";
import Log from "../LogServiceMessage";
import TestResultProviderExtraData from "./TestResultProviderExtraData";
import TestResultProviderOutput from "./TestResultProviderOutput";
import getWorkspaceFolder from "../vscode/getWorkspaceFolder";

export default (
    timeout: number,
    extraData: TestResultProviderExtraData,
    onLogReceived: (log: Log) => void
) =>
    new Promise<TestResultProviderOutput>((resolve, reject) => {
        const workspaceFolder = getWorkspaceFolder();
        if (!workspaceFolder) {
            return reject("Could not find a workspace folder.");
        }

        // Look for the test.sh script in the scripts/shell directory
        const scriptPath = path.join(workspaceFolder.uri.fsPath, "scripts", "shell", "test.sh");

        onLogReceived({
            message: `Running tests via OpenCloud using script: ${scriptPath}`,
            messageType: 0,
        });

        // Execute the test script
        const testProcess = spawn("bash", [scriptPath], {
            cwd: workspaceFolder.uri.fsPath,
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";
        let hasTimedOut = false;

        const timeoutId = setTimeout(() => {
            hasTimedOut = true;
            testProcess.kill();
            reject(`Test execution timed out after ${timeout / 1000} seconds.`);
        }, timeout);

        testProcess.stdout?.on("data", (data) => {
            const output = data.toString();
            stdout += output;

            // Forward output to log
            onLogReceived({
                message: output.trim(),
                messageType: 0,
            });
        });

        testProcess.stderr?.on("data", (data) => {
            const output = data.toString();
            stderr += output;

            // Forward errors to log
            onLogReceived({
                message: output.trim(),
                messageType: 1, // Error
            });
        });

        testProcess.on("close", (code) => {
            if (hasTimedOut) return;

            clearTimeout(timeoutId);

            if (code !== 0) {
                reject(`Test execution failed with exit code ${code}. Error: ${stderr}`);
                return;
            }

            try {
                // Parse Jest-Lua output from the logs
                // For now, we'll create a mock result structure that matches TestEZ format
                // You'll need to adapt this based on actual Jest-Lua output format
                const testResults = parseJestLuaOutput(stdout);

                resolve({
                    reporterOutput: testResults,
                    caughtTestEZError: false,
                });
            } catch (error) {
                reject(`Failed to parse test results: ${error}`);
            }
        });

        testProcess.on("error", (error) => {
            if (hasTimedOut) return;

            clearTimeout(timeoutId);
            reject(`Failed to start test process: ${error.message}`);
        });
    });

function parseJestLuaOutput(output: string): TestEZ.ReporterOutput {
    // Parse Jest-Lua/Jest output format
    const lines = output.split('\n');
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const testResults: TestEZ.ReporterChildNode[] = [];

    let currentDescribe: TestEZ.ReporterChildNode | null = null;
    let currentTest: TestEZ.ReporterChildNode | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Jest output patterns
        if (trimmedLine.includes('PASS') || trimmedLine.includes('✓') || trimmedLine.includes('✔')) {
            successCount++;
            if (currentDescribe && currentTest) {
                currentTest.status = "Success";
                currentTest.errors = [];
            }
        } else if (trimmedLine.includes('FAIL') || trimmedLine.includes('✗') || trimmedLine.includes('✖')) {
            failureCount++;
            errors.push(trimmedLine);
            if (currentDescribe && currentTest) {
                currentTest.status = "Failure";
                currentTest.errors = [trimmedLine];
            }
        } else if (trimmedLine.includes('SKIP') || trimmedLine.includes('○') || trimmedLine.includes('pending')) {
            skippedCount++;
            if (currentDescribe && currentTest) {
                currentTest.status = "Skipped";
                currentTest.errors = [];
            }
        }

        // Try to parse describe blocks
        if (trimmedLine.includes('describe(') || trimmedLine.startsWith('describe ')) {
            const match = trimmedLine.match(/describe\s*\(\s*["']([^"']+)["']/);
            if (match) {
                currentDescribe = {
                    children: [],
                    errors: [],
                    planNode: {
                        phrase: match[1],
                        type: "Describe",
                        modifier: "None",
                    },
                    status: "Success",
                };
                testResults.push(currentDescribe);
            }
        }

        // Try to parse test blocks
        if (trimmedLine.includes('it(') || trimmedLine.includes('test(') || trimmedLine.startsWith('it ') || trimmedLine.startsWith('test ')) {
            const match = trimmedLine.match(/(?:it|test)\s*\(\s*["']([^"']+)["']/);
            if (match && currentDescribe) {
                currentTest = {
                    children: [],
                    errors: [],
                    planNode: {
                        phrase: match[1],
                        type: "It",
                        modifier: "None",
                    },
                    status: "Success",
                };
                currentDescribe.children.push(currentTest);
            }
        }
    }

    // If no structured parsing worked, create a basic result
    if (testResults.length === 0) {
        testResults.push({
            children: [],
            errors: errors,
            planNode: {
                phrase: "Jest-Lua Tests",
                type: "Describe",
                modifier: "None",
            },
            status: failureCount > 0 ? "Failure" : "Success",
        });
    }

    // Update describe block status based on children
    for (const describe of testResults) {
        if (describe.children.length > 0) {
            const hasFailures = describe.children.some(child => child.status === "Failure");
            describe.status = hasFailures ? "Failure" : "Success";
        }
    }

    return {
        children: testResults,
        errors: errors,
        failureCount: failureCount,
        skippedCount: skippedCount,
        successCount: successCount,
    };
}
