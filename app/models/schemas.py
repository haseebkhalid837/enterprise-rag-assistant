from pydantic import BaseModel


class UploadFileResponce(BaseModel):

    file_id: str

    filename: str

    content_type: str

    content: str

    file_upload: bool = False


class QueryResquest(BaseModel):

    file_id: str

    session_id: str

    user_query: str

    use_hybrid: bool = True