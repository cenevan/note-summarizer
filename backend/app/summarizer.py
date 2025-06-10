import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text: str, include_action_items: bool = True) -> tuple[str, str]:
    if include_action_items:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Summarize this note clearly and concisely. "
                        "Then, extract a list of action items. "
                        "Format the response as:\n\n"
                        "Summary:\n<summary here>\n\n"
                        "Action Items:\n- item 1\n- item 2\n- item 3"
                    )
                },
                {"role": "user", "content": text}
            ],
            temperature=0.7,
        )
    else:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Summarize this note clearly and concisely. "
                        "Do not include action items."
                    )
                },
                {"role": "user", "content": text}
            ],
            temperature=0.7,
        )
    
    content = response.choices[0].message.content

    # Test content
    # content = ("Summary: This is a summary of the note. It includes key points and important information.\n\n"
    #           "Action Items:\n- Review the document\n- Prepare for the next meeting\n- Follow up with the team")

    summary = ""
    action_items = ""

    if "Action Items:" in content:
        parts = content.split("Action Items:")
        summary = parts[0].replace("Summary:", "").strip()
        action_items = parts[1].replace("- ", "").strip()
    else:
        summary = content.strip()

    return summary, action_items
