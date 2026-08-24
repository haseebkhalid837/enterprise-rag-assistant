import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from ingestion.loaders import document_loader
from ingestion.chunking import text_chunker
from ingestion.embeddings import create_embeddings

from ingestion.vector_store import (
    store_embeddings,
    delete_file,
    get_all_files
)

from models.schemas import UploadFileResponce

from search.memory import (
    clear_sessions_by_file
)


router = APIRouter()


@router.post(
    "/uploads",
    response_model=UploadFileResponce
)
async def upload_document(
    file: UploadFile = File(...)
):

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required."
        )


    file_id = str(
        uuid.uuid4()
    )


    try:

        parsed_data = await document_loader(
            file
        )


        chunks = text_chunker(
            parsed_data
        )


        embeddings = create_embeddings(
            chunks
        )


        store_embeddings(
            chunks=chunks,
            embeddings=embeddings,
            file_id=file_id,
            filename=file.filename
        )


    except Exception as error:

        print(
            "Upload error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to process document."
        )


    return UploadFileResponce(

        file_id=file_id,

        filename=file.filename,

        content_type=(
            file.content_type
            or "application/octet-stream"
        ),

        file_upload=True,

        content="\n".join(
            page["content"]
            for page in parsed_data
        )

    )


@router.delete(
    "/documents/{file_id}"
)
def delete_document(
    file_id: str
):

    # -----------------------------------------
    # Check document exists
    # -----------------------------------------

    files = get_all_files()

    document_exists = any(
        file["file_id"] == file_id
        for file in files
    )


    if not document_exists:

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    # -----------------------------------------
    # Delete vectors
    # -----------------------------------------

    delete_file(
        file_id
    )


    # -----------------------------------------
    # Delete related chats
    # -----------------------------------------

    deleted_sessions = (
        clear_sessions_by_file(
            file_id
        )
    )


    return {

        "file_id":
            file_id,

        "deleted_sessions":
            deleted_sessions,

        "message":
            "Document and related chats deleted successfully."

    }


@router.get(
    "/documents"
)
def get_documents():

    files = get_all_files()

    return {

        "documents":
            files

    }