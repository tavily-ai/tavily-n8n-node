# @tavily/n8n-nodes-tavily

@tavily/n8n-nodes-tavily is a node for n8n that integrates the Tavily API, enabling powerful web search and content extraction within your no-code automation workflows.

## Features

### Tavily Search
Tavily Search allows you to query the web with powerful filtering capabilities, including options to refine results by topic, time range, and specific domains to include or exclude. You can choose to retrieve a generated answer, raw content, or even related images, depending on your workflow needs. It also supports different search depths—basic or advanced. 

### Tavily Extract
 Tavily Extract allows you to effortlessly retrieve raw content from a list of websites, making it ideal for data collection, content analysis, and research. You can also combine Tavily Extract with our Search method: first, obtain a list of relevant documents, then perform further processing on selected links to gather additional information and use it as context for your research tasks.

### Tavily Crawl
Tavily Crawl allows you to intelligently crawl a website from a starting URL to discover and extract content across multiple pages. Control depth, breadth, and apply filters to tailor your crawl for comprehensive analysis and content aggregation.

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
3. Click on 'Search'
4. In the node's settings:
   - Select your Tavily API
   - Enter your search query
   - Configure any other desired search parameters (topic, search depth, etc.)
5. Run the workflow to execute the search

### Tavily Extract

1. Add the "Tavily" node to your n8n workflow
2. Connect it to the preceding node
3. Click on 'Extract'
4. In the node's settings:
   - Select your Tavily API credential
   - Enter the URLs you want to extract content from
   - Configure any other extraction parameters (include images, extract depth)
5. Run the workflow to extract the content

### Tavily Crawl

1. Add the "Tavily" node to your n8n workflow
2. Connect it to the preceding node
3. Click on 'Crawl'
4. In the node's settings:
   - Select your Tavily API credential
   - Enter the root URL to begin the crawl
   - Configure crawl parameters (max depth, limit, etc.)
5. Run the workflow to crawl the website and extract content

## Parameters

### Tavily Search Parameters

| Parameter | Description |
|-----------|-------------|
| Query | The search query to execute |
| Topic | The category of the search (General, News, or Finance) |
| Search Depth | The depth of the search (Basic or Advanced) |
| Chunks Per Source (Advanced Search only) | Number of content chunks to retrieve from each source (1-3) |
| Max Results | Maximum number of search results to return (1-20) |
| Time Range | Time range filter for results (day, week, month, year) |
| Days (News Only) | Number of days back from the current date to include (for News topic) |
| Include Answer | Include an LLM-generated answer in the response (Basic or Advanced) |
| Include Raw Content | Include cleaned and parsed HTML content of each search result |
| Include Images | Perform an image search and include the results in the response |
| Include Image Descriptions | When including images, also add a descriptive text for each image |
| Include Domains | A list of domains to specifically include in the search results |
| Exclude Domains | A list of domains to specifically exclude from the search results |
| Include Favicon | Include the favicon URL for each result |
| Country | Boost search results from a specific country. |
| Auto Parameters | When enabled, Tavily automatically configures search parameters based on your query's content and intent |
| Start Date | Will return all results after the specified start date (publish date). Required to be written in the format YYYY-MM-DD |
| End Date | Will return all results before the specified end date (publish date). Required to be written in the format YYYY-MM-DD |

### Tavily Extract Parameters

| Parameter | Description |
|-----------|-------------|
| URLs | One or more URLs to extract content from |
| Include Images | Include a list of images extracted from each URL |
| Extract Depth | How deeply to parse each URL (Basic or Advanced) |
| Format | Format of the extracted web page content (Markdown or Text) |
| Include Favicon | Include the favicon URL for each result |

### Tavily Crawl Parameters

| Parameter | Description |
|-----------|-------------|
| URL | The root URL to begin the crawl |
| Instructions | Natural language instructions for the crawler |
| Max Depth | Maximum depth of the crawl (≥ 1) |
| Max Breadth | Maximum number of links to follow per level (≥ 1) |
| Limit | Maximum number of results to return (≥ 1) |
| Select Paths | Regex patterns to select only URLs with specific path patterns |
| Select Domains | Regex patterns to select crawling to specific domains or subdomains |
| Exclude Paths | Regex patterns to exclude URLs with specific path patterns |
| Exclude Domains | Regex patterns to exclude specific domains or subdomains from crawling |
| Allow External | Whether to allow following links that go to external domains |
| Include Images | Whether to include images in the crawl results |
| Extract Depth | Extraction depth (Basic or Advanced) |
| Format | Format of the extracted web page content (Markdown or Text) |
| Include Favicon | Include the favicon URL for each result |

## Troubleshooting

### Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 Bad Request | Invalid request parameters or unsupported values | Check all parameters and their formats |
| 401 Unauthorized | Missing or invalid API key | Verify API key or generate a new one |
| 429 Too Many Requests | Rate limit exceeded | Reduce request frequency or implement backoff |
| 432 Plan Limit Exceeded | Exceeds plan limits | Upgrade your plan via [Tavily Dashboard](https://app.tavily.com/billing) |
| 433 Pay-As-You-Go Limit Exceeded | Exceeds pay-as-you-go limit | Increase limit via [Tavily Dashboard](https://app.tavily.com/billing) |
| 500 Internal Server Error | Server-side issue | Retry request after a few minutes |

## Cost

Head to the [API Credits Overview](https://docs.tavily.com/documentation/api-credits) in our documentation to learn more about how many API Credits each request costs.

## License

This project is licensed under the terms of the MIT license.

## Contact

If you are encountering issues while using Tavily, please email us at support@tavily.com. We'll be happy to help you.

If you want to stay updated on the latest Tavily news and releases, head to our [Developer Community](https://community.tavily.com) to learn more!
