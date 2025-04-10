# @tavily/n8n-nodes-tavily

@tavily/n8n-nodes-tavily is a n8n community node package that integrates the Tavily API for powerful web search and web content extraction.

## Features

### Tavily Search
- Query the web with multiple filtering options (topic, time range, domain inclusion/exclusion, etc.)
- Optionally retrieve a generated answer, raw content, or images
- Support for different search depths (basic/advanced)
- Configurable number of content chunks per source

### Tavily Extract
- Extract text and optional images from one or more URLs
- Choose between basic or advanced extraction depth
- Support for multiple URLs in a single request

## Getting a Tavily API Key

1. Go to the [Tavily website](https://tavily.com) and create an account
2. Navigate to the [Tavily dashboard](https://app.tavily.com/home) to get your API key

## Configuring Credentials in n8n

1. In your n8n instance, go to the "Credentials" section
2. Click "Create Credential"
3. Search for or select "Tavily API"
4. Enter your Tavily API key in the appropriate field
5. Save the credential

## Usage

### Tavily Search

1. Add the "Tavily" node to your n8n workflow
2. Connect it to the preceding node in your workflow
3. In the node's settings:
   - Select your Tavily API credential
   - Enter your search query
   - Configure any other desired search parameters (topic, search depth, etc.)
4. Run the workflow to execute the search

### Tavily Extract

1. Add the "Tavily" node to your n8n workflow
2. Connect it to the preceding node
3. In the node's settings:
   - Select your Tavily API credential
   - Enter the URLs you want to extract content from
   - Configure any other extraction parameters (include images, extract depth)
4. Run the workflow to extract the content

## Parameters

### Tavily Search Parameters

| Parameter | Description |
|-----------|-------------|
| Query | The search query to execute |
| Topic | The category of the search (General, News, or Finance) |
| Search Depth | The depth of the search (Basic or Advanced) |
| Chunks Per Source | Number of content chunks to retrieve from each source (1-3) |
| Max Results | Maximum number of search results to return (1-20) |
| Time Range | Time range filter for results (day, week, month, year) |
| Days (News Only) | Number of days back from the current date to include (for News topic) |
| Include Answer | Include an LLM-generated answer in the response (Basic or Advanced) |
| Include Raw Content | Include cleaned and parsed HTML content of each search result |
| Include Images | Perform an image search and include the results in the response |
| Include Image Descriptions | When including images, also add a descriptive text for each image |
| Include Domains | A list of domains to specifically include in the search results |
| Exclude Domains | A list of domains to specifically exclude from the search results |

### Tavily Extract Parameters

| Parameter | Description |
|-----------|-------------|
| URLs | One or more URLs to extract content from |
| Include Images | Include a list of images extracted from each URL |
| Extract Depth | How deeply to parse each URL (Basic or Advanced) |

## Troubleshooting

### Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 Bad Request | Invalid request parameters or unsupported values | Check all parameters and their formats |
| 401 Unauthorized | Missing or invalid API key | Verify API key or generate a new one |
| 429 Too Many Requests | Rate limit exceeded | Reduce request frequency or implement backoff |
| 432 Plan Limit Exceeded | Exceeds plan limits | Upgrade your plan via [Tavily Dashboard](https://app.tavily.com/account/plan) |
| 433 Pay-As-You-Go Limit Exceeded | Exceeds pay-as-you-go limit | Increase limit via [Tavily Dashboard](https://app.tavily.com/account/plan) |
| 500 Internal Server Error | Server-side issue | Retry request after a few minutes |