import chromadb


client = chromadb.PersistentClient(path="./database/chormadb")

collection = client.get_or_create_collection(name="document")


def store_embeddings(chunks: list[dict],embeddings,file_id: str,filename: str):

    ids=[
        f"{file_id}_chunk_{i}"
        for i in range(len(chunks))
    ]

    documents=[
        chunk["content"]
        for chunk in chunks
    ]

    metadatas=[
        {
            "file_id": file_id,
            "filename": filename,
            "page": (
                chunk.get("page")
                if chunk.get("page") is not None
                else "N/A"
            ),
            "chunk_index": chunk.get(
                "chunk_index",
                i
            )
        }
        for i, chunk in enumerate(chunks)
    ]

    # Store vectors + documents + metadata
    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings.tolist(),
        metadatas=metadatas
    )


def delete_file(file_id: str):
    """
    Delete all chunks belonging to a specific file.
    """

    collection.delete(
        where={"file_id": file_id})


def get_file_chunks(file_id: str):
    """
    Get all chunks belonging to a specific file.
    Useful for debugging/testing.
    """

    return collection.get(
        where={"file_id": file_id},
        include=["documents","metadatas"]
    )

def get_all_files():
    """
    Return all uploaded documents stored in ChromaDB.
    """

    results = collection.get(include=["metadatas"])

    metadatas = results.get("metadatas", [])

    files = {}

    for metadata in metadatas:

        file_id = metadata.get("file_id")
        filename = metadata.get("filename")

        if file_id and file_id not in files:

            files[file_id] = {"file_id": file_id,"filename": filename}

    return list(files.values())