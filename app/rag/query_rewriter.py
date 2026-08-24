from rag.llm_client import create_answer


QUERY_REWRITE_PROMPT = """
You are a query rewriting assistant for a document-based RAG system.

Your job is to rewrite the user's current question into a standalone
search query that can be understood without the conversation history.

RULES:
1. Use the conversation history to resolve references such as:
   - it
   - this
   - that
   - they
   - them
   - the project
   - the company
   - the technology
2. Preserve the user's original intent.
3. Do NOT answer the question.
4. Do NOT add information that is not present in the conversation.
5. If the question is already standalone, return it unchanged.
6. Return ONLY the rewritten search query.
7. Do not add explanations, quotes, or labels.

CHAT HISTORY:
{chat_history}

CURRENT QUESTION:
{question}

REWRITTEN SEARCH QUERY:
"""


def rewrite_query(question: str,chat_history: list[dict] | None = None) -> str:

    history_str=""

    if chat_history:

        history_str="\n".join(
            f"{turn['role'].capitalize()}: {turn['content']}"
            for turn in chat_history
        )

    else:
        history_str="No previous conversation."

    prompt=QUERY_REWRITE_PROMPT.format(chat_history=history_str,question=question)

    rewritten_query=create_answer(prompt)

    return rewritten_query.strip()