# Pygle

A Google-inspired HTML page for Python questions and data analysis. Users type a question, paste or upload a screenshot, or attach data; the result is Python code with copy and download controls. Python execution logs appear automatically beneath the solution, with generated file downloads when available.

The hosted page is https://python-solver-desk.wellssuenkinglok.chatgpt.site. OpenAI credentials are configured as server-side Sites secrets; a funded API account is required for live answers.

## GPT connection

Set `OPENAI_API_KEY` as a secret in Sites using the OpenAI Developers plugin's supported key setup. Optionally set `OPENAI_MODEL`; the default is `gpt-6-astra`. No credentials are included in this source or the HTML page. A funded OpenAI API account and model access are required. Without a configured key, the page clearly displays its connection requirement and includes a labeled example.

The backend uses the Responses API with Code Interpreter and requires a Python tool call. It returns only Python source, with concise answer/explanation comments and actual tool logs in the output panel. Missing data, unreadable screenshots, and unknown runtime inputs are identified rather than replaced with invented output. Billing failures show a direct link to add API credits; authentication failures never echo the key.

## Data

Questions and files are sent to OpenAI only when the user submits a connected request. API responses are stored to support follow-up questions. Uploaded files are configured to expire after 24 hours; generated Python containers have their own expiration. The site does not keep a separate database or browser chat history. New Question starts a new conversation; it does not delete existing API records.

## Validation

`node scripts/test.mjs` checks backend behavior using fixtures; it does not call the live API. `bash scripts/build.sh` builds the Worker, and `node scripts/validate-artifact.mjs` validates the deployment output.

For local preview, supply a local ignored env file: `node --env-file=.env.local scripts/dev.mjs`. The preview listens only on localhost.
