import requests
from bs4 import BeautifulSoup

def fetch_url_text(url, max_chars=3000):
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)
        return text[:max_chars]
    except Exception as e:
        return None