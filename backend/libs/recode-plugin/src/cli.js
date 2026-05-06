#!/usr/bin/env node

/**
 * Re-Code CLI Entry Point
 * Used for standalone execution during local ReCode testing.
 */

const fs = require('fs');
const path = require('path');
const { ReCodePluginParser } = require('./parser.js');

const args = process.argv.slice(2);

function showHelp() {
    console.log(`
Re-Code Plugin CLI v1.1.0
Usage: 
  node src/cli.js --code <path_to_recode> --post <path_to_post_json> [--context <path_to_context_json>]

Options:
  --code      Path to .recode script file (required)
  --post      Path to .json file containing post data (required)
  --context   Path to .json file containing user context data (optional)
  --help      Show this help message
    `);
}

async function run() {
    if (args.includes('--help') || args.length === 0) {
        showHelp();
        return;
    }

    let codePath, postPath, contextPath;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--code') codePath = args[++i];
        if (args[i] === '--post') postPath = args[++i];
        if (args[i] === '--context') contextPath = args[++i];
    }

    if (!codePath || !postPath) {
        console.error('Error: --code and --post are required.');
        process.exit(1);
    }

    try {
        const code = fs.readFileSync(path.resolve(codePath), 'utf8');
        const postData = JSON.parse(fs.readFileSync(path.resolve(postPath), 'utf8'));
        const contextData = contextPath ? JSON.parse(fs.readFileSync(path.resolve(contextPath), 'utf8')) : {};

        const parser = new ReCodePluginParser();
        const result = parser.execute(code, postData, contextData);

        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Execution Error:', error.message);
        process.exit(1);
    }
}

run();
