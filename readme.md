# LawyerGPT

LawyerGPT is a legal document processing and query system that leverages AI to assist users in understanding and interacting with legal content. It enables users to upload legal documents and ask questions about them, receiving AI-powered responses (powered by the Vercel SDK using Gemini). The platform is built using a combination of cutting-edge technologies for document embedding, storage, and retrieval, making legal research more accessible and efficient.

## Features

- **Upload Legal Documents**: Users can upload legal files such as contracts, agreements, and case briefs.
- **Document Embedding**: Converts legal documents into embeddings for efficient search and retrieval.
- **Query System**: Users can ask a wide variety questions of legal questions and get intelligent, context-aware responses powered by Google Gemini Flash via [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction) [Tool calling](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling).
- **Vector Search**: Uses vector databases for fast and accurate retrieval of document chunks related to user queries.
- **API-Driven**: Offers APIs for document uploads, embeddings, and queries, making it extendable for other applications.

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

- **Frontend**: The frontend is a Next.js (React) application styled with Tailwind CSS, responsible for managing the AI Retrieval-Augmented Generation (RAG) conversations via the Vercel AI SDK. It handles user file uploads, leverages advanced React 19 features like Server Components and Suspense, and maintains code quality with `biome.json`. Continuous Integration and Deployment (CI/CD) pipelines are managed through GitHub Actions for linting, and automated deployments.

- **API**: A Go-based HTTP API responsible for processing file uploads and scraped content, converting them into embeddings and resources. The API handles the heavy lifting of parsing PDFs, DOCX and OCR documents (and necessary interfacing required), ensuring fast and scalable processing of legal documents. **Note**: The API requires an API key from Google Gemini. You can obtain it from [Google Gemini API](https://ai.google.dev/gemini-api/docs/api-key).

- **Extractor**: A Go-based script that scrapes legal websites for court judgments and sends the parsed results to the API for embedding.

- **CI/CD**: GitHub Actions are utilized across the stack for automated testing, linting, and deployment. This ensures a consistent and robust development workflow, with all critical paths being covered during each code push.

---

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

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm run dev
   ```

4. Access the app at `http://localhost:3000`.

---

### 2. **API (Go HTTP API)**

The API can be run either in a Docker container (recommended) or directly on your local machine with the necessary dependencies.

#### Prerequisite: **Set up the `.env` file**

1. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Obtain the **API_KEY** required for the Google Gemini API by visiting [Google Gemini API](https://ai.google.dev/gemini-api/docs/api-key) and add it to the `.env` file under `API_KEY`.

#### Option 1: **Run via Docker (Recommended)**

**Steps:**

1. Build the Docker image:

   ```bash
   docker build -t lawyergpt/api -f Dockerfile.dev .
   ```

2. Run the API container:

   ```bash
   docker run -it --rm -p 8080:8080 lawyergpt/api
   ```

3. The API will be available at `http://localhost:8080`.

#### Option 2: **Run Locally (Without Docker)**

If you don't want to use Docker, you will need to install [tesseract-ocr](https://github.com/tesseract-ocr/tessdoc) including library and headers.

Once dependencies are installed, set up the Go project and run the API:

1. Install Go dependencies:

   ```bash
   go mod download
   ```

2. Run the API locally:
   ```bash
   go run main.go
   ```

### 3. **Extractor (Go Script)**

The extractor scrapes legal websites for judgments and sends the results to the API.

**Steps:**

1. Install Go dependencies:

   ```bash
   go mod download
   ```

2. Run the extractor:
   ```bash
   go run extractor.go
   ```

The extractor will fetch the legal data and send it to the API automatically.
