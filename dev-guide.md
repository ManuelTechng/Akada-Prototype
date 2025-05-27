# Akada AI - RAG System Developer Guide

This document outlines the architecture and implementation details of the Retrieval Augmented Generation (RAG) system used in Akada AI.

## 1. RAG System Overview

The RAG system is designed to enhance the capabilities of Akada AI's Chat and Document Review features by providing contextually relevant and accurate information. It works by first retrieving relevant information from our knowledge stores and then using this information to augment the prompt sent to a large language model (LLM) for response generation.

**Core Components:**

*   **Supabase:** A backend-as-a-service platform used to host our PostgreSQL database. It stores:
    *   `programs`: Information about various academic programs (presumably populated by a web scraper).
    *   `knowledge_base`: Curated information, guidelines, and FAQs relevant to students.
*   **Netlify Functions:** Serverless functions that act as the backend logic for the RAG system:
    *   `retrieve.js`: Fetches relevant information from Supabase.
    *   `generateChat.js`: Constructs a prompt using the retrieved information and the user's query, then interacts with the Grok 3 API.
*   **Grok 3 API (X.AI):** The large language model used to generate human-like responses based on the augmented prompt.

**Purpose:**

The primary goal of this RAG system is to ground the LLM's responses in factual, up-to-date information from our curated knowledge sources. This allows the AI Chat to answer user questions more accurately and enables the Document Review feature to provide feedback based on specific guidelines and program details.

## 2. Supabase Setup

Supabase serves as the primary data store for the RAG system.

### `knowledge_base` Table

*   **Purpose:** This table stores curated pieces of information, such as visa requirements, essay writing tips, scholarship details, and program-specific information, which are used to provide context for the LLM.
*   **Schema:**
    *   `id` (TEXT PRIMARY KEY): A unique identifier for the knowledge entry.
    *   `category` (TEXT): The category of the information (e.g., 'visa', 'essay', 'scholarship').
    *   `content` (TEXT): The actual text content of the knowledge entry.
*   **Creation & Population:** The table schema and initial dataset are defined in `knowledge_base.sql`. This script should be run in the Supabase SQL editor to set up the table.

### Database Indexing

*   **Purpose:** To optimize the performance of search queries against the `programs` and `knowledge_base` tables, especially for `ILIKE` (case-insensitive wildcard) searches used in the `retrieve.js` function.
*   **Indexes Created:**
    *   An index on the `name` column of the `programs` table.
    *   An index on the `content` column of the `knowledge_base` table.
*   **Implementation:** The SQL commands for creating these indexes are available in `indexing.sql`. These GIN indexes are designed for full-text search capabilities.

## 3. Netlify Functions

Serverless functions handle the logic of retrieving data and generating responses.

### `retrieve.js`

*   **Purpose:** This function is responsible for fetching relevant data snippets from the Supabase `programs` and `knowledge_base` tables based on a user's search query.
*   **Endpoint:** `/.netlify/functions/retrieve`
*   **Request Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
      "query": "user's search term",
      "page": 1, // Optional, defaults to 1
      "pageSize": 5 // Optional, defaults to 5
    }
    ```
*   **Response Body (JSON):**
    ```json
    {
      "programs": [/* array of program objects from Supabase */],
      "programsCount": 10, // Total count of matching programs
      "knowledge": [/* array of knowledge objects from Supabase */],
      "knowledgeCount": 25 // Total count of matching knowledge entries
    }
    ```
*   **Required Environment Variables:**
    *   `SUPABASE_URL`: The URL of your Supabase project.
    *   `SUPABASE_KEY`: The anon (public) key for your Supabase project.
*   **Notes:**
    *   Implements pagination using `page` and `pageSize` parameters.
    *   Returns both the paginated results and the total count for each data type, allowing the frontend to manage pagination UI.

### `generateChat.js`

*   **Purpose:** This function takes the user's original query and the data retrieved by `retrieve.js`, constructs a detailed prompt (including the retrieved context), and then calls the Grok 3 API to generate a contextually aware response.
*   **Endpoint:** `/.netlify/functions/generateChat`
*   **Request Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
      "query": "user's original question",
      "retrievedData": { /* The full JSON output from a successful call to retrieve.js */ }
    }
    ```
*   **Response Body (JSON):**
    The direct JSON response from the Grok 3 API. The structure will depend on Grok's API, but typically contains the generated text.
*   **Required Environment Variables:**
    *   `XAI_API_KEY`: Your API key for accessing the Grok 3 API.
*   **Notes:**
    *   This function is the core of the "generation" part of RAG. It formats the context and query for the LLM.
    *   It does not directly interact with Supabase; it expects the frontend to first call `retrieve.js` and then pass the results to this function.

## 4. Frontend Integration Notes (Brief)

The React frontend interacts with these Netlify functions to implement the RAG-powered features:

*   **AI Chat Workflow:**
    1.  User submits a query.
    2.  Frontend calls `/.netlify/functions/retrieve` with the query.
    3.  Frontend receives program and knowledge data.
    4.  Frontend calls `/.netlify/functions/generateChat` with the original query and the retrieved data.
    5.  Frontend displays the generated response from Grok 3.
*   **`localStorage` Caching:**
    *   To optimize for users on 3G networks and provide some offline capabilities, responses from `retrieve.js` should be cached in `localStorage`.
    *   **Cache Key:** A dynamic key, e.g., `ragCache_${query}_${page}_${pageSize}`.
    *   **Expiry:** Implement a 1-hour expiry for cached data. Before making a new API call to `retrieve.js`, check for a valid, non-expired cache entry.
*   **Document Review Workflow:**
    1.  User uploads a document.
    2.  Frontend extracts text content from the document.
    3.  Frontend calls `/.netlify/functions/retrieve` with keywords or summary from the document text to fetch relevant guidelines (e.g., essay writing tips, formatting rules).
    4.  Frontend calls `/.netlify/functions/generateChat` with the extracted document text (or relevant parts) as the "query" and the retrieved guidelines as context, asking Grok 3 to provide feedback.
    5.  Frontend displays the feedback.

## 5. Troubleshooting Tips

*   **Missing Environment Variables:**
    *   Ensure `SUPABASE_URL`, `SUPABASE_KEY` (for `retrieve.js`), and `XAI_API_KEY` (for `generateChat.js`) are correctly configured in your Netlify project settings (Build & deploy > Environment > Environment variables).
*   **API Errors from Grok:**
    *   Check the official X.AI / Grok status page for any ongoing incidents.
    *   Verify that your `XAI_API_KEY` is valid, active, and has sufficient quota.
    *   Inspect the logs for `generateChat.js` in Netlify for error messages from the Grok API.
*   **Data Retrieval Issues:**
    *   **No data returned:** Verify that the Supabase table names (`programs`, `knowledge_base`) and column names (`name`, `content`) used in `retrieve.js` match your Supabase schema exactly.
    *   **`programs` table empty:** Ensure the web scraper responsible for populating the `programs` table is functioning correctly.
    *   **Check `retrieve.js` logs:** Netlify function logs can provide details on Supabase query errors or other issues.
*   **Incorrect Context / Poor LLM Responses:**
    *   Ensure `generateChat.js` is correctly parsing the `retrievedData` and formatting the `context` string passed to the Grok 3 API.
    *   Log the exact prompt being sent to Grok from `generateChat.js` to debug context issues.
    *   The quality of retrieved data significantly impacts the LLM's output. If context is irrelevant, review the data in `knowledge_base` and the logic in `retrieve.js`.
*   **Performance Issues:**
    *   **Slow queries:** Confirm that the database indexes mentioned in `indexing.sql` have been successfully applied in Supabase. Use `EXPLAIN ANALYZE` in Supabase SQL editor for problematic queries.
    *   **Large datasets:** For very large datasets, client-side `localStorage` caching might not be sufficient. Consider implementing backend caching strategies (e.g., Redis or Memcached) or further optimizing database queries and indexing if performance becomes a bottleneck.
    *   **Netlify function timeouts:** If functions are timing out, optimize the code within them or consider increasing the timeout limits if on a suitable Netlify plan.
*   **Pagination Issues:**
    *   Verify that the `page` and `pageSize` parameters are being correctly sent by the client and processed by `retrieve.js`.
    *   Check the calculation of `rangeFrom` and `rangeTo` in `retrieve.js`.
    *   Ensure the frontend correctly uses `programsCount` and `knowledgeCount` to render pagination controls.

This guide should help developers understand and maintain the RAG system within Akada AI.
Remember to keep this document updated as the system evolves.
