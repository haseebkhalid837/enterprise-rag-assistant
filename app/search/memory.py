# Stores conversation history for each session
conversation_memory = {}

# Stores metadata for each chat session
chat_sessions = {}


def create_chat_session(
    session_id: str,
    file_id: str,
    filename: str,
    title: str
):
    """
    Create a new chat session.
    """

    chat_sessions[session_id] = {
        "session_id": session_id,
        "file_id": file_id,
        "filename": filename,
        "title": title
    }


def get_chat_sessions() -> list:
    """
    Return all chat sessions.
    """

    return list(
        chat_sessions.values()
    )


def get_chat_session(
    session_id: str
):
    """
    Return one chat session.
    """

    return chat_sessions.get(
        session_id
    )


def get_sessions_by_file(
    file_id: str
) -> list:
    """
    Return all chat sessions
    belonging to a document.
    """

    return [
        session
        for session in chat_sessions.values()
        if session["file_id"] == file_id
    ]


def get_history(
    session_id: str
) -> list:
    """
    Get conversation history
    for a session.
    """

    return conversation_memory.get(
        session_id,
        []
    )


def add_message(
    session_id: str,
    role: str,
    content: str
):
    """
    Add a message to a conversation.
    """

    if session_id not in conversation_memory:

        conversation_memory[session_id] = []


    conversation_memory[session_id].append(
        {
            "role": role,
            "content": content
        }
    )


def clear_memory(
    session_id: str
):
    """
    Delete conversation history
    and session metadata.
    """

    conversation_memory.pop(
        session_id,
        None
    )

    chat_sessions.pop(
        session_id,
        None
    )


def clear_sessions_by_file(
    file_id: str
):
    """
    Delete all chat sessions
    belonging to a document.
    """

    sessions_to_delete = [
        session_id
        for session_id, session
        in chat_sessions.items()
        if session["file_id"] == file_id
    ]


    for session_id in sessions_to_delete:

        conversation_memory.pop(
            session_id,
            None
        )

        chat_sessions.pop(
            session_id,
            None
        )


    return sessions_to_delete