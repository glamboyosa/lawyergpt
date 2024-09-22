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
