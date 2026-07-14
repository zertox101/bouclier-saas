import requests
import re
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from collections import deque

class ParamFinder:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'Mozilla/5.0'})
        self.visited = set()
        self.urls_to_test = set()
    
    def find(self, url):
        if not url.startswith('http'):
            url = 'http://' + url
        
        self.crawl(url)
        
        if not self.urls_to_test:
            common = ['id', 'page', 'q', 'search', 'cat', 'product', 'file', 'doc']
            for p in common:
                if '?' in url:
                    self.urls_to_test.add(f"{url}&{p}=FUZZ")
                else:
                    self.urls_to_test.add(f"{url}?{p}=FUZZ")
        
        return list(self.urls_to_test)[:50]
    
    def crawl(self, start_url, max_pages=30):
        queue = deque([start_url])
        self.visited.add(start_url)
        pages = 0
        
        while queue and pages < max_pages:
            current = queue.popleft()
            pages += 1
            
            try:
                r = self.session.get(current, timeout=5)
                soup = BeautifulSoup(r.text, 'html.parser')
                
                if '?' in current:
                    base, qs = current.split('?', 1)
                    params = re.findall(r'([^=&]+)=', qs)
                    for p in params:
                        self.urls_to_test.add(f"{base}?{p}=FUZZ")
                
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full = urljoin(current, href)
                    
                    if self.same_domain(start_url, full):
                        if full not in self.visited:
                            queue.append(full)
                            self.visited.add(full)
                        
                        if '?' in full:
                            base, qs = full.split('?', 1)
                            params = re.findall(r'([^=&]+)=', qs)
                            for p in params:
                                self.urls_to_test.add(f"{base}?{p}=FUZZ")
            except:
                pass
    
    def same_domain(self, base, target):
        try:
            return urlparse(base).netloc == urlparse(target).netloc
        except:
            return False
