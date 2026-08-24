from rag.retriever import (
    vector_search,
    format_chroma_results
)

from rag.keyword_search import keyword_search


def hybrid_search(
    query: str,
    file_id: str,
    top_k: int = 5,
    vector_k: int = 8,
    keyword_k: int = 8,
    rrf_k: int = 60
) -> list[dict]:

    vector_results = vector_search(
        query=query,
        file_id=file_id,
        top_k=vector_k
    )

    vector_chunks = format_chroma_results(
        vector_results
    )

    keyword_chunks = keyword_search(
        query=query,
        file_id=file_id,
        top_k=keyword_k
    )

    combined = {}

    # -------------------------
    # Vector ranking
    # -------------------------

    for rank, chunk in enumerate(
        vector_chunks,
        start=1
    ):

        chunk_id = chunk["chunk_id"]

        combined[chunk_id] = {
            **chunk,
            "vector_rank": rank,
            "keyword_rank": None,
            "hybrid_score": (
                1 / (rrf_k + rank)
            )
        }

    # -------------------------
    # Keyword ranking
    # -------------------------

    for rank, chunk in enumerate(
        keyword_chunks,
        start=1
    ):

        chunk_id = chunk["chunk_id"]

        if chunk_id not in combined:

            combined[chunk_id] = {
                **chunk,
                "vector_rank": None,
                "keyword_rank": rank,
                "hybrid_score": (
                    1 / (rrf_k + rank)
                )
            }

        else:

            combined[chunk_id][
                "keyword_rank"
            ] = rank

            combined[chunk_id][
                "hybrid_score"
            ] += 1 / (rrf_k + rank)

    # -------------------------
    # Sort
    # -------------------------

    ranked_chunks = sorted(
        combined.values(),
        key=lambda chunk: chunk[
            "hybrid_score"
        ],
        reverse=True
    )

    # -------------------------
    # Final Top-K
    # -------------------------

    final_chunks = []

    for source_id, chunk in enumerate(
        ranked_chunks[:top_k],
        start=1
    ):

        chunk["source_id"] = source_id

        final_chunks.append(chunk)

    return final_chunks