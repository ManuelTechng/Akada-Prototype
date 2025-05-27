const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Ensure environment variables are available
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase environment variables are not set.' }),
      headers: { 'Cache-Control': 'no-store' }
    };
  }

  let supabase;
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create Supabase client.', details: error.message }),
      headers: { 'Cache-Control': 'no-store' }
    };
  }

  let query = "";
  let page = 1;
  let pageSize = 5;

  try {
    // Netlify functions pass POST body as a string
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is missing.' }),
            headers: { 'Cache-Control': 'no-store' }
        };
    }
    const body = JSON.parse(event.body);
    query = body.query;

    if (typeof query !== 'string' || query.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Query parameter is missing or invalid.' }),
        headers: { 'Cache-Control': 'no-store' }
      };
    }

    // Parse and validate page and pageSize
    if (body.page) {
      const parsedPage = parseInt(body.page, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      } else {
        // Optionally, return a 400 error for invalid page parameter
        // For now, we default to 1 as per less strict requirement.
        console.warn(`Invalid page parameter '${body.page}', defaulting to 1.`);
      }
    }

    if (body.pageSize) {
      const parsedPageSize = parseInt(body.pageSize, 10);
      if (!isNaN(parsedPageSize) && parsedPageSize > 0) {
        pageSize = parsedPageSize;
      } else {
        // Optionally, return a 400 error for invalid pageSize parameter
        // For now, we default to 5 as per less strict requirement.
        console.warn(`Invalid pageSize parameter '${body.pageSize}', defaulting to 5.`);
      }
    }

  } catch (error) {
    console.error('Error parsing request body or validating parameters:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body or parameter validation failed.', details: error.message }),
      headers: { 'Cache-Control': 'no-store' }
    };
  }

  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = page * pageSize - 1;

  try {
    const { data: programs, error: programsError, count: programsCount } = await supabase
      .from('programs')
      .select('*', { count: 'exact' }) // Request count
      .ilike('name', `%${query}%`)
      .range(rangeFrom, rangeTo); // Apply pagination

    if (programsError) {
      console.error('Error fetching programs from Supabase:', programsError);
      throw new Error(`Programs query failed: ${programsError.message}`);
    }

    const { data: knowledge, error: knowledgeError, count: knowledgeCount } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact' }) // Request count
      .ilike('content', `%${query}%`)
      .range(rangeFrom, rangeTo); // Apply pagination

    if (knowledgeError) {
      console.error('Error fetching knowledge_base from Supabase:', knowledgeError);
      throw new Error(`Knowledge_base query failed: ${knowledgeError.message}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ programs, programsCount, knowledge, knowledgeCount }),
      headers: { 'Cache-Control': 'no-store' }
    };
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from Supabase.', details: error.message }),
      headers: { 'Cache-Control': 'no-store' }
    };
  }
};
