import {
  useEffect,
  useState
} from "react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

import {
  getChatHistory,
  getChatSessions,
  clearChatHistory
} from "../services/api";


function createSessionId() {

  return crypto.randomUUID();

}


function ChatPage() {

  const [
    selectedDocument,
    setSelectedDocument
  ] = useState(null);


  const [
    sessionId,
    setSessionId
  ] = useState(
    createSessionId()
  );


  const [
    messages,
    setMessages
  ] = useState([]);


  const [
    recentChats,
    setRecentChats
  ] = useState([]);


  const [
    loadingHistory,
    setLoadingHistory
  ] = useState(false);


  const [
    appError,
    setAppError
  ] = useState("");


  // ==========================================
  // MOBILE SIDEBAR TOGGLE
  // ==========================================

  const [
    isSidebarOpen,
    setIsSidebarOpen
  ] = useState(false);


  // ==========================================
  // LOAD RECENT CHATS
  // ==========================================

  useEffect(() => {

    async function loadRecentChats() {

      try {

        setAppError("");

        const data =
          await getChatSessions();

        setRecentChats(
          data.sessions || []
        );

      } catch (error) {

        console.error(
          "Failed to load recent chats:",
          error
        );

        setAppError(
          "Unable to load recent chats."
        );

      }

    }


    loadRecentChats();

  }, []);


  // ==========================================
  // NEW CHAT
  // ==========================================

  function handleNewChat() {

    setSessionId(
      createSessionId()
    );

    setMessages([]);

    setSelectedDocument(null);

    setAppError("");

    setIsSidebarOpen(false);

  }


  // ==========================================
  // CREATE RECENT CHAT
  // ==========================================

  function handleChatTitle(
    title
  ) {

    const cleanTitle =
      title?.trim();


    if (!cleanTitle) {
      return;
    }


    setRecentChats(
      previousChats => {

        const exists =
          previousChats.some(
            chat =>
              chat.session_id ===
              sessionId
          );


        if (exists) {

          return previousChats;

        }


        return [

          ...previousChats,

          {

            session_id:
              sessionId,

            file_id:
              selectedDocument?.file_id
              || null,

            filename:
              selectedDocument?.filename
              || null,

            title:
              cleanTitle

          }

        ];

      }
    );

  }


  // ==========================================
  // SELECT RECENT CHAT
  // ==========================================

  async function handleSelectChat(
    chat
  ) {

    if (!chat?.session_id) {
      return;
    }


    try {

      setLoadingHistory(true);

      setAppError("");


      const data =
        await getChatHistory(
          chat.session_id
        );


      /*
        Use backend metadata if available.
      */

      const fileId =
        data.file_id ||
        chat.file_id;


      const filename =
        data.filename ||
        chat.filename;


      /*
        If document information
        is missing, don't restore
        an invalid chat.
      */

      if (!fileId) {

        setSelectedDocument(null);

      } else {

        setSelectedDocument({

          file_id:
            fileId,

          filename:
            filename ||
            "Unknown document"

        });

      }


      setSessionId(
        chat.session_id
      );


      setMessages(
        data.history || []
      );


      setIsSidebarOpen(false);


    } catch (error) {

      console.error(
        "Failed to load chat history:",
        error
      );


      setMessages([]);

      setAppError(
        "Unable to load this chat."
      );


    } finally {

      setLoadingHistory(false);

    }

  }


  // ==========================================
  // SELECT DOCUMENT
  // ==========================================

  async function handleSelectDocument(
    document
  ) {

    if (!document) {

      handleNewChat();

      return;

    }


    setAppError("");


    /*
      Find existing chat for
      this document.
    */

    const documentChat =
      recentChats.find(
        chat =>
          chat.file_id ===
          document.file_id
      );


    /*
      ----------------------------------------
      No existing chat
      ----------------------------------------
    */

    if (!documentChat) {

      setSelectedDocument(
        document
      );

      setSessionId(
        createSessionId()
      );

      setMessages([]);

      setIsSidebarOpen(false);

      return;

    }


    /*
      ----------------------------------------
      Existing chat
      ----------------------------------------
    */

    await handleSelectChat(
      documentChat
    );

  }


  // ==========================================
  // DELETE RECENT CHAT
  // ==========================================

  async function handleDeleteChat(
    deletedSessionId
  ) {

    if (!deletedSessionId) {
      return;
    }


    /*
      Remove from UI immediately.
      This makes the interface feel instant.
    */

    setRecentChats(
      previousChats =>
        previousChats.filter(
          chat =>
            chat.session_id !==
            deletedSessionId
        )
    );


    try {

      await clearChatHistory(
        deletedSessionId
      );


    } catch (error) {

      console.error(
        "Failed to delete chat:",
        error
      );

    }


    /*
      If currently open,
      reset current chat.
    */

    if (
      deletedSessionId ===
      sessionId
    ) {

      setSessionId(
        createSessionId()
      );

      setMessages([]);

      setSelectedDocument(null);

    }

  }


  // ==========================================
  // DOCUMENT DELETED
  // ==========================================

  async function handleDocumentDeleted(
    fileId
  ) {

    /*
      Backend now automatically deletes
      related chat sessions as well.

      So frontend only needs to remove
      those chats from local state.
    */

    setRecentChats(
      previousChats =>
        previousChats.filter(
          chat =>
            chat.file_id !==
            fileId
        )
    );


    /*
      If current document belongs
      to deleted file, reset chat.
    */

    if (
      selectedDocument?.file_id ===
      fileId
    ) {

      setSelectedDocument(null);

      setMessages([]);

      setSessionId(
        createSessionId()
      );

    }

  }


  return (

    <div className="app">


      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ===================================================== */}

      <div
        className={
          `sidebar-overlay ${
            isSidebarOpen ? "open" : ""
          }`
        }
        onClick={() =>
          setIsSidebarOpen(false)
        }
      />


      <Sidebar

        isOpen={
          isSidebarOpen
        }

        onClose={() =>
          setIsSidebarOpen(false)
        }

        selectedDocument={
          selectedDocument
        }

        onSelectDocument={
          handleSelectDocument
        }

        onNewChat={
          handleNewChat
        }

        recentChats={
          recentChats
        }

        onSelectChat={
          handleSelectChat
        }

        onDeleteChat={
          handleDeleteChat
        }

        onDocumentDeleted={
          handleDocumentDeleted
        }

        activeSessionId={
          sessionId
        }

      />


      <main className="main-content">


        {appError && (

          <div className="app-error">

            {appError}

          </div>

        )}


        {loadingHistory ? (

          <div className="chat-loading">

            <div className="loading-spinner" />

            <span>
              Loading chat history...
            </span>

          </div>

        ) : (

          <ChatWindow

            selectedDocument={
              selectedDocument
            }

            sessionId={
              sessionId
            }

            messages={
              messages
            }

            setMessages={
              setMessages
            }

            onChatTitle={
              handleChatTitle
            }

            onOpenSidebar={() =>
              setIsSidebarOpen(true)
            }

          />

        )}

      </main>


    </div>

  );

}


export default ChatPage;
