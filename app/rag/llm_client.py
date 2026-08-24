import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client=Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def create_answer(prompt:str)->str:

    responce=client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )


    return responce.choices[0].message.content
