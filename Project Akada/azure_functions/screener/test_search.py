from duckduckgo_search import DDGS
from urllib.parse import urlparse
import json

def is_valid_academic_url(url):
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()
        blocked_domains = ['wikipedia', 'linkedin', 'facebook', 'youtube', 'reddit', 'quora', 
                           'yocket', 'shiksha', 'mastersportal', 'topuniversities', 'usnews', 
                           'timeshighereducation', 'findamasters', 'hotcourses', 'idp.com',
                           'studyportals', 'coursecompare', 'univcan', 'github', 'stackoverflow']
        if any(bd in domain for bd in blocked_domains): return False
        blocked_paths = ['/news', '/blog', '/article', '/rankings', '/event', 
            '/login', '/search', '/tag', '/category', '/archive']
        if any(bp in path for bp in blocked_paths): return False
        if path.endswith(('.pdf', '.doc', '.docx')): return False
        if domain.endswith(('.edu', '.ac.uk')): return True
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
        domain_parts = domain.split('.')
        if any(acronym in domain_parts for acronym in known_acronyms): return True
        academic_keywords = ['university', 'college', 'institute', 'polytechnic', 'school', 'academy']
        if any(kw in domain for kw in academic_keywords): return True
        return False 
    except: return False

query = "Memorial University Computer Science Masters"
print(f"Searching for: {query}")
with DDGS() as ddgs:
    ddgs_gen = ddgs.text(query, max_results=20)
    for r in ddgs_gen:
        url = r.get('href', '')
        valid = is_valid_academic_url(url)
        print(f"[{'PASS' if valid else 'FAIL'}] {url}")
