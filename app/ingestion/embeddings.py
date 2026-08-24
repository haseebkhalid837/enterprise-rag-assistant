from sentence_transformers import SentenceTransformer


model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embeddings(chunks: list[dict]):

    texts = [
        chunk["content"]
        for chunk in chunks
    ]

    embeddings=model.encode(texts,convert_to_numpy=True)

    return embeddings


def create_query_embedding( query: str):

    embedding=model.encode(query,convert_to_numpy=True)

    return embedding