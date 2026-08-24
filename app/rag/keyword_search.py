from rank_bm25 import BM25Okapi
import chromadb


client = chromadb.PersistentClient(
    path="./database/chormadb"
)

collection = client.get_collection(
    name="document"
)


def keyword_search(
    query: str,
    file_id: str,
    top_k: int = 8
) -> list[dict]:

    results = collection.get(
        where={"file_id": file_id},
        include=[
            "documents",
            "metadatas"
        ]
    )

    documents = results.get(
        "documents",
        []
    )

    metadatas = results.get(
        "metadatas",
        []
    )

    ids = results.get(
        "ids",
        []
    )

    if not documents:
        return []

    tokenized_documents = [
        document.lower().split()
        for document in documents
    ]

    bm25 = BM25Okapi(
        tokenized_documents
    )

    query_tokens = query.lower().split()

    scores = bm25.get_scores(
        query_tokens
    )

    ranked_indexes = sorted(
        range(len(scores)),
        key=lambda index: scores[index],
        reverse=True
    )

    retrieved_chunks = []

    for index in ranked_indexes[:top_k]:

        retrieved_chunks.append(
            {
                "chunk_id": ids[index],

                "file_id": metadatas[index].get(
                    "file_id"
                ),

                "doc_name": metadatas[index].get(
                    "filename",
                    "unknown"
                ),

                "page": metadatas[index].get(
                    "page",
                    "N/A"
                ),

                "chunk_index": metadatas[index].get(
                    "chunk_index"
                ),

                "text": documents[index],

                "keyword_score": float(
                    scores[index]
                )
            }
        )

    return retrieved_chunks