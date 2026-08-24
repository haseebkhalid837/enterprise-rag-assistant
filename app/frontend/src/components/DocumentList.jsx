import { useEffect, useState } from "react";
import { getDocuments, deleteDocument } from "../api";


function DocumentList({ selectedFileId, onSelectDocument }) {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);


    async function loadDocuments() {

        try {

            const data = await getDocuments();

            setDocuments(data.documents);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    }


    useEffect(() => {

        loadDocuments();

    }, []);


    async function handleDelete(fileId) {

        try {

            await deleteDocument(fileId);

            setDocuments(
                documents.filter(
                    document => document.file_id !== fileId
                )
            );

        } catch (error) {

            console.error(error);

        }
    }


    if (loading) {

        return <p>Loading documents...</p>;
    }


    return (

        <div>

            <h2>Documents</h2>

            {documents.length === 0 ? (

                <p>No documents uploaded.</p>

            ) : (

                documents.map((document) => (

                    <div
                        key={document.file_id}
                        onClick={() =>
                            onSelectDocument(document)
                        }
                        style={{
                            padding: "10px",
                            marginBottom: "8px",
                            cursor: "pointer",
                            border:
                                selectedFileId === document.file_id
                                    ? "2px solid black"
                                    : "1px solid #ccc"
                        }}
                    >

                        <div>
                            📄 {document.filename}
                        </div>

                        <button
                            onClick={(event) => {

                                event.stopPropagation();

                                handleDelete(
                                    document.file_id
                                );

                            }}
                        >
                            Delete
                        </button>

                    </div>

                ))

            )}

        </div>
    );
}


export default DocumentList;