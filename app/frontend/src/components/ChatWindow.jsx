import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  askQuestion
} from "../services/api";


function ChatWindow({
  selectedDocument,
  sessionId,
  messages,
  setMessages,
  onChatTitle
}) {

  const [
    question,
    setQuestion
  ] = useState("");


  const [
    loading,
    setLoading
  ] = useState(false);


  const messagesEndRef =
    useRef(null);


  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [
    messages,
    loading
  ]);


  // ==========================================
  // SEND QUESTION
  // ==========================================

  async function handleSend() {

    const cleanQuestion =
      question.trim();


    if (!cleanQuestion) {
      return;
    }


    if (!selectedDocument) {

      alert(
        "Please select a document first."
      );

      return;

    }


    setQuestion("");


    /*
      Create Recent Chat title
      only on first question.
    */

    if (
      messages.length === 0 &&
      onChatTitle
    ) {

      onChatTitle(
        cleanQuestion
      );

    }


    /*
      Immediately show user message.
    */

    setMessages(
      previousMessages => [

        ...previousMessages,

        {
          role: "user",
          content: cleanQuestion
        }

      ]
    );


    try {

      setLoading(true);


      const response =
        await askQuestion({

          sessionId:
            sessionId,

          fileId:
            selectedDocument.file_id,

          userQuery:
            cleanQuestion,

          useHybrid:
            true

        });


      setMessages(
        previousMessages => [

          ...previousMessages,

          {
            role: "assistant",

            content:
              response.answer,

            sources:
              response.sources || []

          }

        ]

      );


    } catch (error) {

      console.error(
        "Failed to get answer:",
        error
      );


      setMessages(
        previousMessages => [

          ...previousMessages,

          {
            role: "assistant",

            content:
              error.message ||
              "Sorry, something went wrong while getting the answer."

          }

        ]
      );


    } finally {

      setLoading(false);

    }

  }


  function handleKeyDown(
    event
  ) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();

    }

  }


  return (

    <section className="chat-window">


      {/* =====================================
          HEADER
      ====================================== */}

      <header className="chat-header">

        <div>

          <span className="chat-header-label">
            DOCUMENT ASSISTANT
          </span>

          <h1>
            Talk to Your Documentation
          </h1>

          <p>

            {selectedDocument

              ? (
                <>
                  Chatting with{" "}
                  <strong>
                    {selectedDocument.filename}
                  </strong>
                </>
              )

              : (
                "Select a document and start asking questions."
              )

            }

          </p>

        </div>

      </header>


      {/* =====================================
          MESSAGES
      ====================================== */}

      <div className="messages">


        {!selectedDocument && (

          <div className="welcome-message">

            <div className="welcome-icon">
              ✦
            </div>

            <h2>
              Welcome to your Knowledge Base
            </h2>

            <p>
              Select a document from the sidebar
              to start asking questions.
            </p>

          </div>

        )}


        {selectedDocument &&
        messages.length === 0 && (

          <div className="welcome-message">

            <div className="welcome-icon">
              📄
            </div>

            <h2>
              Ask your document
            </h2>

            <p>

              Ask anything about{" "}

              <strong>
                {selectedDocument.filename}
              </strong>

            </p>

          </div>

        )}


        {messages.map(
          (message, index) => (

            <div
              key={index}
              className={
                `message ${message.role}`
              }
            >

              <div className="message-role">

                <span className="message-avatar">

                  {message.role === "user"
                    ? "Y"
                    : "✦"}

                </span>

                <strong>

                  {message.role === "user"
                    ? "You"
                    : "Assistant"}

                </strong>

              </div>


              <p>
                {message.content}
              </p>


              {message.sources &&
              message.sources.length > 0 && (

                <div className="sources">

                  <strong>
                    Sources
                  </strong>


                  {[

                    ...new Map(

                      message.sources.map(
                        source => [

                          `${source.doc_name}-${source.page}`,

                          source

                        ]
                      )

                    ).values()

                  ].map(
                    (
                      source,
                      sourceIndex
                    ) => (

                      <div
                        key={
                          sourceIndex
                        }
                        className="source"
                      >

                        📄{" "}

                        {source.doc_name}

                        {" — Page "}

                        {source.page}

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          )
        )}


        {loading && (

          <div className="message assistant">

            <div className="message-role">

              <span className="message-avatar">
                ✦
              </span>

              <strong>
                Assistant
              </strong>

            </div>

            <div className="thinking">

              <span />
              <span />
              <span />

            </div>

          </div>

        )}


        <div
          ref={messagesEndRef}
        />

      </div>


      {/* =====================================
          INPUT
      ====================================== */}

      <div className="chat-input">

        <input
          type="text"
          value={question}
          onChange={
            event =>
              setQuestion(
                event.target.value
              )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder={
            selectedDocument
              ? "Ask something about your document..."
              : "Select a document first..."
          }
          disabled={
            !selectedDocument ||
            loading
          }
        />


        <button
          onClick={
            handleSend
          }
          disabled={
            !selectedDocument ||
            loading ||
            !question.trim()
          }
        >

          {loading
            ? "..."
            : "Send →"}

        </button>

      </div>


    </section>

  );

}


export default ChatWindow;