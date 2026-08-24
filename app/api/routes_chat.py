from fastapi import APIRouter, HTTPException

from models.schemas import QueryResquest

from rag.retriever import (
    vector_search,
    format_chroma_results
)

from rag.hybrid_search import hybrid_search

from rag.prompt_builder import build_prompt
from rag.llm_client import create_answer
from rag.query_rewriter import rewrite_query

from ingestion.vector_store import get_all_files

from search.memory import (
    get_history,
    add_message,
    clear_memory,
    create_chat_session,
    get_chat_sessions,
    get_chat_session
)


query_router = APIRouter()


@query_router.post("/query")
def ask_question(
    query: QueryResquest
):

    # -----------------------------------------
    # Validate session
    # -----------------------------------------

    history = get_history(
        query.session_id
    )


    # -----------------------------------------
    # Find document
    # -----------------------------------------

    files = get_all_files()

    document = next(
        (
            file
            for file in files
            if file["file_id"] == query.file_id
        ),
        None
    )


    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )


    # -----------------------------------------
    # Create chat session
    # only for first question
    # -----------------------------------------

    existing_session = get_chat_session(
        query.session_id
    )


    if existing_session is None:

        create_chat_session(

            session_id=query.session_id,

            file_id=query.file_id,

            filename=document["filename"],

            title=query.user_query.strip()

        )


    else:

        # Prevent using one session
        # with another document.

        if (
            existing_session["file_id"]
            != query.file_id
        ):

            raise HTTPException(
                status_code=409,
                detail=(
                    "This chat session belongs "
                    "to another document."
                )
            )


    # -----------------------------------------
    # Rewrite query
    # -----------------------------------------

    rewritten_query = rewrite_query(
        query.user_query,
        history
    )


    # -----------------------------------------
    # Retrieve
    # -----------------------------------------

    if query.use_hybrid:

        retrieved_chunks = hybrid_search(
            query=rewritten_query,
            file_id=query.file_id
        )

    else:

        results = vector_search(
            rewritten_query,
            query.file_id
        )

        retrieved_chunks = format_chroma_results(
            results
        )


    # -----------------------------------------
    # Build prompt
    # -----------------------------------------

    prompt_template = build_prompt(
        query.user_query,
        retrieved_chunks,
        history
    )


    # -----------------------------------------
    # Generate answer
    # -----------------------------------------

    answer = create_answer(
        prompt_template
    )


    # -----------------------------------------
    # Save conversation
    # -----------------------------------------

    add_message(
        session_id=query.session_id,
        role="user",
        content=query.user_query
    )

    add_message(
        session_id=query.session_id,
        role="assistant",
        content=answer
    )


    # -----------------------------------------
    # Response
    # -----------------------------------------

    return {

        "session_id":
            query.session_id,

        "file_id":
            query.file_id,

        "user_query":
            query.user_query,

        "rewritten_query":
            rewritten_query,

        "answer":
            answer,

        "sources":
            retrieved_chunks

    }


@query_router.get("/history")
def get_all_chat_sessions():

    sessions = get_chat_sessions()

    return {
        "sessions": sessions
    }


@query_router.get("/history/{session_id}")
def chat_history(
    session_id: str
):

    history = get_history(
        session_id
    )


    session = get_chat_session(
        session_id
    )


    return {

        "session_id":
            session_id,

        "file_id":
            session["file_id"]
            if session
            else None,

        "filename":
            session["filename"]
            if session
            else None,

        "title":
            session["title"]
            if session
            else None,

        "history":
            history

    }


@query_router.delete("/history/{session_id}")
def clear_chat_history(
    session_id: str
):

    session = get_chat_session(
        session_id
    )


    if session is None:

        return {

            "session_id":
                session_id,

            "message":
                "Chat session already removed."

        }


    clear_memory(
        session_id
    )


    return {

        "session_id":
            session_id,

        "message":
            "Conversation history cleared successfully."

    }