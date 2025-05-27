const axios = require('axios');

exports.handler = async (event) => {
  // 1. Check for XAI_API_KEY
  if (!process.env.XAI_API_KEY) {
    console.error('XAI_API_KEY environment variable is not set.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'XAI_API_KEY is not set.' }),
      headers: { 'Cache-Control': 'no-store' }
    };
  }

  let query;
  let retrievedData;

  // 2. Parse event.body and validate inputs
  try {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is missing.' }),
            headers: { 'Cache-Control': 'no-store' }
        };
    }
    const body = JSON.parse(event.body);
    query = body.query;
    retrievedData = body.retrievedData;

    if (!query || typeof query !== 'string' || query.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query is missing or invalid in request body.' }),
        headers: { 'Cache-Control': 'no-store' }
      };
    }
    if (!retrievedData || typeof retrievedData !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'RetrievedData is missing or invalid in request body.' }),
        headers: { 'Cache-Control': 'no-store' }
      };
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body.', details: error.message }),
      headers: { 'Cache-Control': 'no-store' }
    };
  }

  // 3. Construct context string
  let context = "";
  if (retrievedData.knowledge && Array.isArray(retrievedData.knowledge) && retrievedData.knowledge.length > 0) {
    context += "Knowledge Base Information:\n";
    retrievedData.knowledge.forEach(item => {
      if (item && item.content) {
        context += `- ${item.content}\n`;
      }
    });
  }

  if (retrievedData.programs && Array.isArray(retrievedData.programs) && retrievedData.programs.length > 0) {
    context += "\nProgram Information:\n";
    retrievedData.programs.forEach(item => {
      if (item && item.name) {
        context += `- ${item.name}: ${item.description || 'No description available.'}\n`;
      }
    });
  }

  if (context === "") {
    context = "No specific context found.";
  }

  // 4. Construct prompt for Grok 3 API
  const prompt = `Question: ${query}

Context:
${context}

Answer:`;

  // 5. Make POST request to Grok 3 API
  const grokApiUrl = 'https://api.x.ai/grok'; // Adjusted endpoint
  const grokModel = 'grok-1'; // Replace with the actual model name if different, or remove if not needed

  try {
    const response = await axios.post(grokApiUrl, {
      prompt: prompt,
      model: grokModel, // Assuming model parameter is still useful/needed
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Assuming Grok's response.data directly contains the answer or the relevant object
    // If Grok returns something like { "answer": "..." }, then use response.data.answer
    return {
      statusCode: 200,
      body: JSON.stringify(response.data), // Adjusted to return the whole response.data as per example
      headers: { 'Cache-Control': 'no-store' }
    };

  } catch (error) {
    console.error('Error calling Grok API:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    let errorDetails = error.message;
    let statusCode = 500;

    if (error.response) {
        statusCode = error.response.status;
        // Ensure errorDetails is stringified if it's an object
        errorDetails = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
    } else if (error.request) {
        errorDetails = "No response received from Grok API.";
    }

    return {
      statusCode: statusCode,
      body: JSON.stringify({ error: 'Failed to get response from Grok API.', details: errorDetails }),
      headers: { 'Cache-Control': 'no-store' }
    };
  }
};
