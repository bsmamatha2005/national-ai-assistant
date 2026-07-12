STATE_CM_PAGES = {
    "karnataka": "https://en.wikipedia.org/wiki/Chief_Minister_of_Karnataka",
    "tamil nadu": "https://en.wikipedia.org/wiki/Chief_Minister_of_Tamil_Nadu",
    "tamilnadu": "https://en.wikipedia.org/wiki/Chief_Minister_of_Tamil_Nadu",
    "kerala": "https://en.wikipedia.org/wiki/Chief_Minister_of_Kerala",
    "andhra pradesh": "https://en.wikipedia.org/wiki/Chief_Minister_of_Andhra_Pradesh",
    "telangana": "https://en.wikipedia.org/wiki/Chief_Minister_of_Telangana",
    "maharashtra": "https://en.wikipedia.org/wiki/Chief_Minister_of_Maharashtra",
    "uttar pradesh": "https://en.wikipedia.org/wiki/Chief_Minister_of_Uttar_Pradesh",
    "west bengal": "https://en.wikipedia.org/wiki/Chief_Minister_of_West_Bengal",
    "gujarat": "https://en.wikipedia.org/wiki/Chief_Minister_of_Gujarat",
    "rajasthan": "https://en.wikipedia.org/wiki/Chief_Minister_of_Rajasthan",
    "punjab": "https://en.wikipedia.org/wiki/Chief_Minister_of_Punjab",
    "bihar": "https://en.wikipedia.org/wiki/Chief_Minister_of_Bihar",
    "delhi": "https://en.wikipedia.org/wiki/Chief_Minister_of_Delhi",
}

SOURCE_MAP = {
    # Politics / Government
    "prime minister": "https://en.wikipedia.org/wiki/Prime_Minister_of_India",
    "president of india": "https://en.wikipedia.org/wiki/President_of_India",
    "parliament": "https://sansad.in/",
    "supreme court": "https://www.sci.gov.in/",
    "election": "https://www.eci.gov.in/",

    # Health
    "hospital": "https://www.nhp.gov.in/",
    "health": "https://www.nhp.gov.in/",
    "disease": "https://www.nhp.gov.in/",
    "vaccine": "https://www.mohfw.gov.in/",
    "ayushman bharat": "https://ab-hwc.nhp.gov.in/",

    # Education
    "education": "https://www.education.gov.in/",
    "scholarship": "https://scholarships.gov.in/",
    "university": "https://www.ugc.gov.in/",
    "exam": "https://www.education.gov.in/",

    # Space / Science
    "isro": "https://www.isro.gov.in/",
    "space": "https://www.isro.gov.in/",
    "satellite": "https://www.isro.gov.in/",
    "chandrayaan": "https://www.isro.gov.in/",

    # Technology / Digital
    "digital india": "https://www.digitalindia.gov.in/",
    "aadhaar": "https://uidai.gov.in/",
    "startup": "https://www.startupindia.gov.in/",

    # Agriculture
    "agriculture": "https://agriculture.gov.in/",
    "farmer": "https://agriculture.gov.in/",
    "crop": "https://agriculture.gov.in/",

    # Transport
    "railway": "https://indianrailways.gov.in/",
    "airport": "https://www.aai.aero/",

    # Economy
    "budget": "https://www.indiabudget.gov.in/",
    "rbi": "https://www.rbi.org.in/",
    "tax": "https://www.incometax.gov.in/",

    # Employment
    "job": "https://www.ncs.gov.in/",
    "employment": "https://www.ncs.gov.in/",
}

def find_matching_url(query):
    query_lower = query.lower()

    if "chief minister" in query_lower:
        for state, url in STATE_CM_PAGES.items():
            if state in query_lower:
                return url
        return None

    for keyword, url in SOURCE_MAP.items():
        if keyword in query_lower:
            return url

    return None