# LawyerGPT

LawyerGPT is a legal document processing and query system that leverages AI to assist users in understanding and interacting with legal content. Specifically geared towards Nigerian law, it is trained on Nigerian financial law judgments and legal documents. The platform enables users to upload legal documents and ask questions about them, receiving AI-powered responses (powered by the Vercel SDK using Google Gemini). LawyerGPT uses cutting-edge technologies for document embedding, storage, and retrieval, making legal research more accessible and efficient.
> Illustrations by Popsy.co
## Features

- **Upload Legal Documents**: Users can upload legal files such as contracts, agreements, and case briefs.
- **Document Embedding**: Converts legal documents into embeddings for efficient search and retrieval.
- **Query System**: Users can ask a wide variety of legal questions, particularly around Nigerian law and financial law, and get intelligent, context-aware responses powered by Google Gemini Flash via [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction) [Tool calling](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling).
- **Vector Search**: Uses vector databases for fast and accurate retrieval of document chunks related to user queries.
- **API-Driven**: Offers APIs for document uploads, embeddings, and queries, making it extendable for other applications.
- **Secure HTTPS**: Uses Caddy as a reverse proxy to serve the API over HTTPS, enhancing security.

## Project structure

```bash
.
├── api
├── extractor
├── frontend
├── makefile
└── readme
```

## Stack Overview

- **Frontend**: The frontend is a Next.js (React) application styled with Tailwind CSS, responsible for managing the AI Retrieval-Augmented Generation (RAG) conversations via the Vercel AI SDK. It handles user file uploads, leverages advanced React 19 features like Server Components and Suspense, and maintains code quality with `biome.json`. The frontend also integrates **Drizzle** for database interactions and **Unkey** for managing API rate limits. **V0** was used largely for the UI, and all conversations are powered by the **Vercel AI SDK**.

- **API**: A Go-based HTTP API responsible for processing file uploads and scraped content, converting them into embeddings and resources. The API handles the heavy lifting of parsing PDFs, DOCX, and OCR documents (and necessary interfacing required), ensuring fast and scalable processing of legal documents. The API is Dockerized, and the project uses **makefiles** to simplify development. **Note**: The API requires an API key from Google Gemini. You can obtain it from [Google Gemini API](https://ai.google.dev/gemini-api/docs/api-key).

- **Extractor**: A Go-based script that scrapes Nigerian legal websites for court judgments and financial law documents, sending the parsed results to the API for embedding. The extractor is managed via a makefile for easy builds and execution.

- **Reverse Proxy**: Caddy is used as a reverse proxy to serve the API over HTTPS on localhost, enhancing security for local development.

- **CI/CD**: GitHub Actions are utilized across the stack for automated testing, linting, and deployment. This ensures a consistent and robust development workflow, with all critical paths being covered during each code push.

## Running the Stack

### 1. **Frontend (Next.js App)**

To run the frontend, make sure you have `pnpm` installed:

```bash
npm install -g pnpm
```

**Steps:**

1. Copy the environment variables file:

   ```bash
   cp .env.example .env
   ```

> [!IMPORTANT]
> For the `UNKEY_ROOT_KEY`, please find
> it using [this guide](https://www.unkey.com/docs/ratelimiting/introduction).
> You will also need to retrieve the `GEMINI_API_KEY` by visiting [Google Gemini API](https://ai.google.dev/gemini-api/docs/api-key).

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm run dev
   ```

4. Access the app at `https://localhost:3000`.

> [!NOTE]
> We are running the app in development [through HTTPS](https://vercel.com/guides/access-nextjs-localhost-https-certificate-self-signed)

### 2. **API (Go HTTP API)**

The API can be run using Docker, with the project utilizing a makefile for ease of development. Caddy is used as a reverse proxy to serve the API over HTTPS.

#### Prerequisite: **Set up the `.env` file**


1. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Obtain the **API_KEY** required for the Google Gemini API by visiting [Google Gemini API](https://ai.google.dev/gemini-api/docs/api-key) and add it to the `.env` file under `API_KEY`.

#### Run via Docker with Makefile

**Steps:**

1. Use the makefile to spin up the API:

   ```bash
   make run
   ```

   This will spin up the necessary Docker containers using Docker Compose, including Caddy as a reverse proxy.

2. The API will be available at `https://localhost`.

> [!WARNING]
> When accessing `https://localhost` for the first time, your browser may show a security warning due to the self-signed certificate used for local development. You will need to explicitly grant permission to proceed to the site. This is normal for local HTTPS setups and does not indicate a security issue with your application.

### 3. **Extractor (Go Script)**

The extractor scrapes Nigerian legal websites for financial law judgments and sends the results to the API. The process is managed via the makefile.

#### Prerequisite: **Set up the `.env` file**

1. Copy the environment file:

   ```bash
   cp .env.example .env.development
   ```

**Steps:**

1. Build and run the extractor using the makefile:

   ```bash
   make build-extractor
   ```

   This will build and run the extractor executable, which will fetch the legal data and send it to the API automatically.

## Security Note

While using HTTPS with a self-signed certificate enhances security for local development, it's important to note that this setup is not suitable for production environments. In a production setting, you should use a properly issued SSL/TLS certificate from a recognized Certificate Authority.
