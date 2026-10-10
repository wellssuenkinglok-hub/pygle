# Pygle

A Google-inspired HTML page for Python questions and data analysis. Users type a question, paste or upload a screenshot, or attach data; the result is Python code with copy and download controls. Verified Python tool logs and generated files appear separately when available.

## Page

Open `index.html` for the standalone page and labeled example. The private hosted app is at https://python-solver-desk.wellssuenkinglok.chatgpt.site. Live GPT solving is not active yet; the API credential decision is pending.

The complete backend and embedded frontend are in `worker/index.js`. The hosting manifest retains this existing Site identity.

## GPT connection

Set `OPENAI_API_KEY` as a secret in Sites using the OpenAI Developers plugin's supported key setup. Optionally set `OPENAI_MODEL`; the default is `gpt-6-astra`. No credentials are included in this source or the HTML page. A funded OpenAI API account and model access are required. Without a configured key, the page clearly displays its connection requirement and includes a labeled example.

## Data

Questions and files are sent to OpenAI only when the user submits a connected request. API responses are stored to support follow-up questions. Uploaded files are configured to expire after 24 hours; generated Python containers have their own expiration. The site does not keep a separate database or browser chat history. New Question starts a new conversation; it does not delete existing API records.

## Validation

`node scripts/test.mjs` checks backend behavior using fixtures; it does not call the live API. `bash scripts/build.sh` builds the Worker, and `node scripts/validate-artifact.mjs` validates the deployment output.
