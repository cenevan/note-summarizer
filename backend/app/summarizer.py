import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text: str):

    """
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Summarize this note and extract action items."},
            {"role": "user", "content": text}
        ],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    """

    # Placeholder for actual OpenAI API call
    content = "Summarized content of the note" 
    action_items = "Extracted action items" 

    return content, action_items
