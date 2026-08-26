import { useEffect, useState } from "react";

import UploadDocument from "./UploadDocument";

import {
  getDocuments,
  deleteDocument
} from "../services/api";


function Sidebar({
  isOpen,
  onClose,
  selectedDocument,
  onSelectDocument,
  onNewChat,
  recentChats,
  onSelectChat,
  onDeleteChat,
  onDocumentDeleted,
  activeSessionId
}) {

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);


  /* =========================================================
     LOAD DOCUMENTS
  ========================================================= */

  async function loadDocuments() {

    try {

      setLoading(true);

      const data = await getDocuments();

      setDocuments(
        data.documents || []
      );

    } catch (error) {

      console.error(
        "Failed to load documents:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  /* =========================================================
     LOAD DOCUMENTS ON MOUNT
  ========================================================= */

  useEffect(() => {

    loadDocuments();

  }, []);


  /* =========================================================
     DELETE DOCUMENT
  ========================================================= */

  async function handleDeleteDocument(
    event,
    fileId
  ) {

    /*
      VERY IMPORTANT:

      Stop the delete click from
      triggering document selection.
    */

    event.preventDefault();
    event.stopPropagation();


    try {

      /*
        Delete document from backend
      */

      await deleteDocument(fileId);


      /*
        Remove document immediately
        from frontend.
      */

      setDocuments(
        previousDocuments =>
          previousDocuments.filter(
            document =>
              document.file_id !== fileId
          )
      );


      /*
        Tell ChatPage that this
        document was deleted.
      */

      if (onDocumentDeleted) {

        await onDocumentDeleted(fileId);

      } else if (
        selectedDocument?.file_id === fileId
      ) {

        /*
          Fallback:
          clear current document.
        */

        onSelectDocument(null);

      }

    } catch (error) {

      console.error(
        "Failed to delete document:",
        error
      );

    }

  }


  /* =========================================================
     SELECT RECENT CHAT
  ========================================================= */

  function handleChatClick(chat) {

    onSelectChat(chat);

  }


  /* =========================================================
     DELETE RECENT CHAT
  ========================================================= */

  function handleDeleteChat(
    event,
    sessionId
  ) {

    /*
      VERY IMPORTANT:

      Prevent delete button click
      from triggering chat selection.
    */

    event.preventDefault();
    event.stopPropagation();


    onDeleteChat(sessionId);

  }


  return (

    <aside className={`sidebar ${isOpen ? "open" : ""}`}>


      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="sidebar-brand">

        <div className="brand-icon">
          ✦
        </div>

        <div className="brand-text">

          <h2>
            Knowledge Base
          </h2>

          <span>
            Document Assistant
          </span>

        </div>

        {/* Close button — mobile only (styled via CSS) */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onClose}
          aria-label="Close menu"
          style={{ marginLeft: "auto" }}
        >
          ✕
        </button>

      </div>


      {/* =====================================================
          NEW CHAT
      ===================================================== */}

      <button
        type="button"
        className="new-chat-button"
        onClick={onNewChat}
      >

        <span className="new-chat-icon">
          +
        </span>

        <span>
          New Chat
        </span>

      </button>


      {/* =====================================================
          UPLOAD DOCUMENT
      ===================================================== */}

      <UploadDocument
        onUploadSuccess={loadDocuments}
      />


      {/* =====================================================
          RECENT CHATS
      ===================================================== */}

      <section className="recent-chats">

        <div className="section-header">

          <h3>
            Recent Chats
          </h3>

          <span className="document-count">
            {recentChats?.length || 0}
          </span>

        </div>


        {!recentChats ||
        recentChats.length === 0 ? (

          <p className="sidebar-message">
            No recent chats
          </p>

        ) : (

          <div className="recent-chat-list">

            {recentChats.map(chat => (

              <div
                key={chat.session_id}
                className={
                  `recent-chat-wrapper ${
                    chat.session_id === activeSessionId
                      ? "active"
                      : ""
                  }`
                }
              >


                {/* =========================================
                    CHAT SELECT BUTTON
                ========================================= */}

                <button
                  type="button"
                  className="recent-chat-item"
                  onClick={() =>
                    handleChatClick(chat)
                  }
                  title={
                    chat.title ||
                    "Untitled chat"
                  }
                >

                  <span className="chat-icon">
                    💬
                  </span>

                  <span className="chat-title">

                    {
                      chat.title ||
                      "Untitled chat"
                    }

                  </span>

                </button>


                {/* =========================================
                    CHAT DELETE BUTTON
                ========================================= */}

                <button
                  type="button"
                  className="recent-chat-delete"
                  onClick={event =>
                    handleDeleteChat(
                      event,
                      chat.session_id
                    )
                  }
                  title="Delete chat"
                  aria-label={
                    `Delete ${
                      chat.title ||
                      "chat"
                    }`
                  }
                >

                  ×

                </button>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          UPLOADED DOCUMENTS
      ===================================================== */}

      <section className="documents">

        <div className="section-header">

          <h3>
            Uploaded Documents
          </h3>

          <span className="document-count">
            {documents.length}
          </span>

        </div>


        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (

          <p className="sidebar-message">
            Loading documents...
          </p>


        ) : documents.length === 0 ? (

          <p className="sidebar-message">
            No documents yet
          </p>


        ) : (

          <div className="document-list">

            {documents.map(document => (

              <div
                key={document.file_id}
                className={
                  `document-item ${
                    selectedDocument?.file_id ===
                    document.file_id
                      ? "selected"
                      : ""
                  }`
                }
              >


                {/* =========================================
                    DOCUMENT SELECT BUTTON
                ========================================= */}

                <button
                  type="button"
                  className="document-select"
                  onClick={() =>
                    onSelectDocument(document)
                  }
                  title={document.filename}
                >

                  <span className="document-icon">
                    📄
                  </span>

                  <span className="document-name">

                    {document.filename}

                  </span>

                </button>


                {/* =========================================
                    DOCUMENT DELETE BUTTON
                ========================================= */}

                <button
                  type="button"
                  className="document-delete"
                  onClick={event =>
                    handleDeleteDocument(
                      event,
                      document.file_id
                    )
                  }
                  title={
                    `Delete ${
                      document.filename
                    }`
                  }
                  aria-label={
                    `Delete ${
                      document.filename
                    }`
                  }
                >

                  ×

                </button>

              </div>

            ))}

          </div>

        )}

      </section>


    </aside>

  );

}


export default Sidebar;
