const API_BASE_URL =
  "http://127.0.0.1:8000";


// ==========================================
// DOCUMENTS
// ==========================================

export async function uploadDocument(file) {

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );


  const response =
    await fetch(
      `${API_BASE_URL}/uploads`,
      {
        method: "POST",
        body: formData
      }
    );


  if (!response.ok) {

    const errorData =
      await response.json()
        .catch(() => null);

    throw new Error(
      errorData?.detail ||
      "Upload failed"
    );

  }


  return response.json();
}


export async function getDocuments() {

  const response =
    await fetch(
      `${API_BASE_URL}/documents`
    );


  if (!response.ok) {

    throw new Error(
      "Failed to fetch documents"
    );

  }


  return response.json();
}


export async function deleteDocument(
  fileId
) {

  const response =
    await fetch(
      `${API_BASE_URL}/documents/${fileId}`,
      {
        method: "DELETE"
      }
    );


  if (!response.ok) {

    const errorData =
      await response.json()
        .catch(() => null);

    throw new Error(
      errorData?.detail ||
      "Failed to delete document"
    );

  }


  return response.json();
}


// ==========================================
// CHAT
// ==========================================

export async function askQuestion({
  sessionId,
  fileId,
  userQuery,
  useHybrid = true
}) {

  const response =
    await fetch(
      `${API_BASE_URL}/query`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          session_id:
            sessionId,

          file_id:
            fileId,

          user_query:
            userQuery,

          use_hybrid:
            useHybrid

        })
      }
    );


  if (!response.ok) {

    const errorData =
      await response.json()
        .catch(() => null);

    throw new Error(
      errorData?.detail ||
      "Failed to get answer"
    );

  }


  return response.json();
}


// ==========================================
// CHAT HISTORY
// ==========================================

export async function getChatHistory(
  sessionId
) {

  const response =
    await fetch(
      `${API_BASE_URL}/history/${sessionId}`
    );


  if (!response.ok) {

    throw new Error(
      "Failed to fetch chat history"
    );

  }


  return response.json();
}


export async function clearChatHistory(
  sessionId
) {

  const response =
    await fetch(
      `${API_BASE_URL}/history/${sessionId}`,
      {
        method: "DELETE"
      }
    );


  if (!response.ok) {

    throw new Error(
      "Failed to clear chat history"
    );

  }


  return response.json();
}


export async function getChatSessions() {

  const response =
    await fetch(
      `${API_BASE_URL}/history`
    );


  if (!response.ok) {

    throw new Error(
      "Failed to fetch chat sessions"
    );

  }


  return response.json();
}