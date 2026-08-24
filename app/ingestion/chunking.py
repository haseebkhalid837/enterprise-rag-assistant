from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_text_splitters import RecursiveCharacterTextSplitter


def text_chunker(parsed_data: list[dict]) -> list[dict]:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n","\n",". ","? ","! ","; ",": "," ",""]
    )

    chunks = []

    chunk_index = 0

    for page in parsed_data:

        page_content = page["content"]
        page_number = page.get("page")

        page_chunks = splitter.split_text(
            page_content
        )

        for chunk in page_chunks:

            chunks.append(
                {
                    "content": chunk,
                    "page": page_number,
                    "chunk_index": chunk_index
                }
            )

            chunk_index += 1

    return chunks
