from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma

DB_PATH = "./chroma_db"

embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
vectordb = Chroma(persist_directory=DB_PATH, embedding_function=embeddings)

def retrieve_context(query, k=2):
    results = vectordb.similarity_search(query, k=k)
    context = "\n".join([doc.page_content for doc in results])
    return context