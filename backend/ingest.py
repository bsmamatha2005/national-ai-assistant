import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma

DATA_PATH = "../data/knowledge"
DB_PATH = "./chroma_db"

def ingest_documents():
    documents = []
    for filename in os.listdir(DATA_PATH):
        if filename.endswith(".txt"):
            loader = TextLoader(os.path.join(DATA_PATH, filename), encoding="utf-8")
            documents.extend(loader.load())

    print(f"Loaded {len(documents)} documents")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks")

    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")

    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=DB_PATH
    )
    vectordb.persist()
    print("Ingestion complete. Vector DB saved.")

if __name__ == "__main__":
    ingest_documents()