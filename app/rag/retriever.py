import chromadb

from ingestion.embeddings import create_query_embedding


client = chromadb.PersistentClient(
    path="./database/chormadb"
)

collection = client.get_collection(
    name="document"
)


def vector_search(
    query: str,
    file_id: str,
    top_k: int = 8
):

    query_embedding = create_query_embedding(query)

    results = collection.query(
        query_embeddings=[
            query_embedding.tolist()
        ],
        n_results=top_k,
        where={
            "file_id": file_id
        },
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    return results


def format_chroma_results(
    chroma_response: dict
) -> list[dict]:

    ids = chroma_response["ids"][0]
    documents = chroma_response["documents"][0]
    metadatas = chroma_response["metadatas"][0]
    distances = chroma_response["distances"][0]

    retrieved_chunks = []

    for source_id, (
        chunk_id,
        text,
        metadata,
        distance
    ) in enumerate(
        zip(
            ids,
            documents,
            metadatas,
            distances
        ),
        start=1
    ):

        retrieved_chunks.append({
            "source_id": source_id,
            "chunk_id": chunk_id,
            "doc_name": metadata.get(
                "filename",
                "unknown"
            ),
            "file_id": metadata.get(
                "file_id"
            ),
            "page": metadata.get(
                "page",
                "N/A"
            ),
            "chunk_index": metadata.get(
                "chunk_index"
            ),
            "text": text,
            "distance": distance
        })

    return retrieved_chunks