# AI Notes

First, I used Claude Opus 4.6 to create the project specification file for this project. I prompted it to update certain things that I found necessary. After that, I created a tasks.md file for each iteration of the progress. Then I opened VS Code and manually set up the app and connected it to the database. I added the project spec and tasks files. I used Claude Opus 4.6 to create this app by prompting it to generate the application. The app uses Gemini to generate summaries and insights because it's the only free option available (ChatGPT and Anthropic require API key top-ups). The few bugs that occurred were due to LLMs using outdated syntax. I did a documentation check and fixed such bugs manually. Occasionally, I used ChatGPT 4.5 Codex for anything I couldn't understand.

Everything was working fine locally. Then it was time for deployment.

I manually integrated the cloud database for production and deployed the app, but it was failing. I checked the logs on the cloud and asked ChatGPT 4.5 Codex to explain the bugs so I could understand them myself. It suggested a few approaches, which I tried, but the issue persisted. I then checked the cloud documentation again and used Claude 4.6 Opus Agent, which provided the context of the documentation and log errors to pinpoint the issue and fix it.

Now i'm documenting using the Gemini 3.

Used Gemini 3 to get my resume from latex to markdown.