import { store } from "../../extension";
import * as fs from "fs";
import * as toml from "toml";
import * as vscode from "vscode";
import Ajv from "ajv";
import getWorkspaceFolder from "../getWorkspaceFolder";
import openCloudTestResultProvider from "../../testResultProviders/openCloudTestResultProvider";
import type TestRoots from "../../TestRoots";
import getTestTimeoutPreference from "../preferences/getTestTimeoutPreference";

const ajv = new Ajv();

type ConfigFileType = {
	roots: TestRoots;
	extraOptions?: object;
};
const configFileSchema = {
	type: "object",
	required: ["roots"],
	properties: {
		roots: {
			type: "array",
			uniqueItems: true,
			items: {
				type: "string",
			},
		},
		extraOptions: {
			type: "object",
			properties: {
				showTimingInfo: {
					type: "boolean",
				},
				testNamePattern: {
					type: "string",
				},
			},
		},
	},
};

const validatorFunc = ajv.compile(configFileSchema);
/**
 * @param runAutomatically Used when this command is called by the run tests on save feature. Maybe the user does not have or intend to have the extension set up in the current project, so only bug them if running tests has been initiated explicitly.
 */
export default async (runAutomatically?: boolean) => {
	const optionallyShowError = (e: string) => {
		if (!runAutomatically) vscode.window.showErrorMessage(e);
	};

	if (store.getState().waitingForTestResults)
		return vscode.window.showInformationMessage(
			"Can't start running tests before the currently running tests finish."
		);

	const workspaceFolder = getWorkspaceFolder();
	if (!workspaceFolder) {
		return optionallyShowError("Could not find a workspace folder.");
	}

	const configPath = vscode.Uri.joinPath(
		workspaceFolder.uri,
		"./jest-lua-companion.toml"
	).fsPath;
	let config: ConfigFileType;
	try {
		config = toml.parse(
			fs.readFileSync(configPath, {
				encoding: "utf-8",
				flag: "r",
			})
		);
	} catch (e) {
		return optionallyShowError(
			`Couldn't parse/read from jest-lua-companion.toml (${configPath}).`
		);
	}

	if (!validatorFunc(config) as boolean)
		return vscode.window.showErrorMessage(
			`Invalid jest-lua-companion.toml format! Please look at the README examples.`
		);

	// Check for .env file with required OpenCloud credentials
	const envPath = vscode.Uri.joinPath(workspaceFolder.uri, ".env").fsPath;
	if (!fs.existsSync(envPath)) {
		return optionallyShowError(
			"Missing .env file with OpenCloud credentials. Please create a .env file with ROBLOX_API_KEY, ROBLOX_UNIVERSE_ID, and ROBLOX_PLACE_ID."
		);
	}

	store.dispatch({
		type: "STARTED_RUNNING_TESTS",
	});

	const { roots, extraOptions } = config;

	openCloudTestResultProvider(
		getTestTimeoutPreference() * 1000,
		{
			testRoots: roots,
			testExtraOptions: extraOptions,
		},
		(log) => {
			store.dispatch({
				type: "GOT_CONSOLE_MESSAGE",
				payload: log,
			});
		}
	)
		.then((output) => {
			store.dispatch({
				type: "GOT_TEST_RESULTS",
				results: output,
			});
		}).catch((rejectReason) => {
			store.dispatch({
				type: "TESTING_FAILED",
				reason: rejectReason,
			});
		});
};
