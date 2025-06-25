import os
from openai import OpenAI


def summarize_text(text: str, user_openai_api_key: str, include_action_items: bool = True) -> tuple[str, str, int, int]:
    if not user_openai_api_key or not user_openai_api_key.strip():
        raise ValueError("No OpenAI API key found. Please add your key in your profile settings.")
    client = OpenAI(api_key=user_openai_api_key)
    try:
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
        # Capture token usage
        usage = response.usage
        prompt_tokens = usage.prompt_tokens
        completion_tokens = usage.completion_tokens
    except Exception as e:
        raise ValueError("Invalid or missing OpenAI API key.") from e
    
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

    return summary, action_items, prompt_tokens, completion_tokens
