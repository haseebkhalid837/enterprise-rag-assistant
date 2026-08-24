import {
  useState
} from "react";

import {
  uploadDocument
} from "../services/api";


function UploadDocument({
  onUploadSuccess
}) {

  const [
    file,
    setFile
  ] = useState(null);


  const [
    uploading,
    setUploading
  ] = useState(false);


  const [
    message,
    setMessage
  ] = useState("");


  const [
    error,
    setError
  ] = useState("");


  function handleFileChange(
    event
  ) {

    const selectedFile =
      event.target.files?.[0];


    setMessage("");
    setError("");


    if (!selectedFile) {

      setFile(null);

      return;

    }


    setFile(
      selectedFile
    );

  }


  async function handleUpload() {

    if (!file) {

      setError(
        "Please select a file."
      );

      return;

    }


    try {

      setUploading(true);

      setMessage("");

      setError("");


      await uploadDocument(
        file
      );


      setMessage(
        "Document uploaded successfully."
      );


      setFile(null);


      /*
        Clear native file input
        after successful upload.
      */

      const fileInput =
        document.querySelector(
          ".upload-file-input"
        );


      if (fileInput) {

        fileInput.value = "";

      }


      if (onUploadSuccess) {

        await onUploadSuccess();

      }


    } catch (error) {

      console.error(
        "Upload error:",
        error
      );


      setError(
        error.message ||
        "Failed to upload document."
      );

    } finally {

      setUploading(false);

    }

  }


  return (

    <div className="upload-section">

      <label className="upload-label">
        Add a document
      </label>


      <input
        className="upload-file-input"
        type="file"
        accept=".pdf,.txt,.md,.docx"
        onChange={
          handleFileChange
        }
        disabled={
          uploading
        }
      />


      {file && (

        <div className="selected-file">

          <span>
            📄
          </span>

          <span title={file.name}>
            {file.name}
          </span>

        </div>

      )}


      <button
        className="upload-button"
        onClick={
          handleUpload
        }
        disabled={
          uploading ||
          !file
        }
      >

        {uploading
          ? "Processing..."
          : "Upload Document"}

      </button>


      {message && (

        <p className="upload-success">
          {message}
        </p>

      )}


      {error && (

        <p className="upload-error">
          {error}
        </p>

      )}

    </div>

  );

}


export default UploadDocument;