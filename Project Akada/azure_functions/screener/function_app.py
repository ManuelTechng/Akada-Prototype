import azure.functions as func
import logging
import json
import asyncio
import aiohttp
from urllib.parse import urlparse
from duckduckgo_search import DDGS

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

def is_valid_academic_url(url):
    """
    Validates if a URL belongs to a legitimate academic institution.
    Filters out portals, rankings, news, and social media.
    """
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()
        
        # 1. Blocklist: Reject obvious non-program sites
        blocked_domains = [
            'wikipedia', 'linkedin', 'facebook', 'youtube', 'reddit', 'quora', 
            'yocket', 'shiksha', 'mastersportal', 'topuniversities', 'usnews', 
            'timeshighereducation', 'findamasters', 'hotcourses', 'idp.com',
            'studyportals', 'coursecompare', 'univcan', 'github', 'stackoverflow'
        ]
        if any(bd in domain for bd in blocked_domains):
            return False

        # 2. Blocklist Paths: Reject blogs, news, internal logins
        blocked_paths = [
            '/news', '/blog', '/article', '/rankings', '/event', 
            '/login', '/search', '/tag', '/category', '/archive'
        ]
        if any(bp in path for bp in blocked_paths):
            return False
            
        # 3. Blocklist Extensions
        if path.endswith(('.pdf', '.doc', '.docx', '.ppt', '.txt')):
            return False

        # 4. Allowlist: Strict Academic TLDs
        if domain.endswith(('.edu', '.ac.uk')):
            return True
        
        # 5. Allowlist: Known Canadian/Global University Acronyms (common non .edu domains)
        known_acronyms = [
            'utoronto', 'ubc', 'mcgill', 'uwaterloo', 'ualberta', 'mcmaster', 
            'uwo', 'westernu', 'queensu', 'ucalgary', 'usask', 'umanitoba', 
            'uvic', 'sfu', 'yorku', 'concordia', 'ryerson', 'torontomu', 'dal', 
            'uottawa', 'mun', 'unb', 'uregina', 'brocku', 'wlu', 'uwindsor', 
            'trentu', 'uleth', 'unbc', 'viu', 'kpu', 'capilanou', 'ufv', 
            'nait', 'sait', 'bcit', 'senecacollege', 'humber', 'georgebrown', 
            'sheridancollege', 'centennialcollege', 'conestogac', 'fanshawec',
            'brandonu'
        ]
        # Check against pure domain parts (SPLIT by dot) to avoid false positives like "munchkin.com"
        domain_parts = domain.split('.')
        if any(acronym in domain_parts for acronym in known_acronyms):
            return True

        # 6. Heuristic: Academic Keywords in Domain
        academic_keywords = ['university', 'college', 'institute', 'polytechnic', 'school', 'academy']
        if any(kw in domain for kw in academic_keywords):
            return True

        return False 
    except:
        return False

async def is_url_live(session, url):
    """
    Checks if a URL returns a 200 OK status via a customized HEAD request.
    Includes user-agent to avoid blind blocking.
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        # Try HEAD first for speed
        async with session.head(url, headers=headers, timeout=3, allow_redirects=True) as response:
            if response.status == 200:
                return True
            # Some servers block HEAD or return 405/403, retry with GET (stream=True equivalent)
            if response.status in [405, 403, 418]: # Teapot is popular with blockers
                 pass # Fall through to GET
            else:
                logging.warning(f"Validation FAILED (HEAD={response.status}): {url}")
                return False

        # Fallback to lightweight GET
        async with session.get(url, headers=headers, timeout=5, allow_redirects=True) as response:
            if response.status == 200:
                return True
            logging.warning(f"Validation FAILED (GET={response.status}): {url}")
            return False
    except Exception as e:
        logging.warning(f"Validation ERROR ({str(e)}): {url}")
        return False

@app.route(route="search_programs", auth_level=func.AuthLevel.ANONYMOUS)
async def search_programs(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a search request.')
    
    query = req.params.get('query')
    if not query:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            query = req_body.get('query')

    if query:
        logging.info(f"Searching for: {query}")
        try:
            candidates = []
            seen_urls = set()
            
            # 1. Fetch Candidates (Synchronous DDG call wrapped in async)
            # DUCKDUCKGO SEARCH IS SYNC. We run it directly (blocking is okay for short duration)
            # or wrap in executor if needed. For Function App, direct is usually fine logic-wise.
            with DDGS() as ddgs:
                ddgs_gen = ddgs.text(query, max_results=50) # Fetch lots
                if ddgs_gen:
                    for r in ddgs_gen:
                        raw_url = r.get('href', '')
                        
                        # 2. Heuristic Filter
                        if is_valid_academic_url(raw_url):
                             if raw_url not in seen_urls:
                                seen_urls.add(raw_url)
                                candidates.append({
                                    "name": r.get('title'),
                                    "url": raw_url,
                                    "snippet": r.get('body')
                                })
            
            logging.info(f"Candidates before validation: {len(candidates)}")

            # 3. Async Liveness Validation
            valid_results = []
            if candidates:
                async with aiohttp.ClientSession() as session:
                    # Create tasks for all candidates (limit to top 15 to save time/resources)
                    tasks = []
                    top_candidates = candidates[:15] 
                    
                    for cand in top_candidates:
                        tasks.append(is_url_live(session, cand['url']))
                    
                    # Run all checks in parallel
                    is_live_results = await asyncio.gather(*tasks)
                    
                    # Filter based on results
                    for i, is_live in enumerate(is_live_results):
                        cand = top_candidates[i]
                        logging.info(f"URL: {cand['url']} -> Live: {is_live}")
                        if is_live:
                            valid_results.append(cand)

            logging.info(f"Returning {len(valid_results)} validated results.")
            
            return func.HttpResponse(
                json.dumps({"results": valid_results}),
                mimetype="application/json",
                status_code=200
            )

        except Exception as e:
            logging.error(f"Search failed: {str(e)}")
            return func.HttpResponse(
                json.dumps({"error": str(e)}),
                mimetype="application/json",
                status_code=500
            )

    else:
        return func.HttpResponse(
             "Please pass a query on the query string or in the request body",
             status_code=400
        )

@app.route(route="scrape_page", auth_level=func.AuthLevel.ANONYMOUS)
async def scrape_page(req: func.HttpRequest) -> func.HttpResponse:
    import trafilatura
    import concurrent.futures
    
    logging.info('Python HTTP trigger function processed a scrape request.')
    
    url = req.params.get('url')
    if not url:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            url = req_body.get('url')

    if url:
        logging.info(f"Scraping URL: {url}")
        try:
            # Wrap blocking trafilatura in executor
            loop = asyncio.get_running_loop()
            with concurrent.futures.ThreadPoolExecutor() as pool:
                # Set a strict timeout (e.g. 25 seconds) to prevent Orchestrator timeout
                downloaded = await asyncio.wait_for(
                    loop.run_in_executor(pool, trafilatura.fetch_url, url),
                    timeout=25.0
                )
            
            if downloaded:
                # Extract is fast/CPU-bound, can also be offloaded if needed but usually okay
                text = trafilatura.extract(downloaded)
                if text:
                     return func.HttpResponse(
                        json.dumps({"url": url, "content": text}),
                        mimetype="application/json",
                        status_code=200
                    )
                else:
                    # Soft Error: Return 200 so LLM sees the error message
                    return func.HttpResponse(
                        json.dumps({"error": "Could not extract text content from the page.", "url": url}),
                        mimetype="application/json",
                        status_code=200 
                    )
            else:
                 # Soft Error: Return 200
                 return func.HttpResponse(
                    json.dumps({"error": "Could not fetch the URL (empty download).", "url": url}),
                    mimetype="application/json",
                    status_code=200
                )

        except asyncio.TimeoutError:
            logging.error(f"Scrape timed out: {url}")
            # Soft Error: Return 200
            return func.HttpResponse(
                json.dumps({"error": "Scrape operation timed out after 25s.", "url": url}),
                mimetype="application/json",
                status_code=200
            )
        except Exception as e:
            logging.error(f"Scrape failed: {str(e)}")
            # Soft Error: Return 200
            return func.HttpResponse(
                json.dumps({"error": str(e), "url": url}),
                mimetype="application/json",
                status_code=200
            )
    else:
        return func.HttpResponse(
             "Please pass a url on the query string or in the request body",
             status_code=400
        )
