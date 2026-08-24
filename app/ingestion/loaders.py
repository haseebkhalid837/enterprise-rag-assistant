import pdfplumber
import os
from docx import Document


def pdf_document(file) -> list[dict]:

    pages=[]

    with pdfplumber.open(file.file) as pdf:

        for page_number, page in enumerate(pdf.pages, start=1):

            page_text=page.extract_text()

            if page_text:
                pages.append({"content": page_text,"page": page_number})

    return pages


async def txt_document(file)-> list[dict]:

    text=await file.read()

    return [
        {
            "content": text.decode("utf-8"),
            "page": None
        }
    ]


def md_document(file)->list[dict]:

    text=file.file.read().decode("utf-8")

    return [
        {
            "content": text,
            "page": None
        }
    ]


def docx_document(file)->list[dict]:

    document=Document(file.file)

    paragraphs=[]

    for paragraph in document.paragraphs:

        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    text="\n".join(paragraphs)

    return [
        {
            "content": text,
            "page": None
        }
    ]


async def document_loader(file):

    file_extension=os.path.splitext(file.filename)[1].lower()

    if file_extension==".pdf":

        return pdf_document(file)

    elif file_extension==".txt":

        return await txt_document(file)

    elif file_extension==".md":

        return md_document(file)

    elif file_extension==".docx":

        return docx_document(file)

    else:
        raise ValueError("File type is not allowed!")