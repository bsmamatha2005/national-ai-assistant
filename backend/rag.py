from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma

DB_PATH = "./chroma_db"

embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
vectordb = Chroma(persist_directory=DB_PATH, embedding_function=embeddings)

def retrieve_context(query, k=2, score_threshold=0.7):
    results = vectordb.similarity_search_with_score(query, k=k)
    good_results = [doc for doc, score in results if score <= score_threshold]

    if not good_results:
        return None

    context = "\n".join([doc.page_content for doc in good_results])
    return context