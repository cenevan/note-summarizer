import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def summarize_text(text: str):
    prompt = f"Summarize the following text and extract action items:\n\n{text}"
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    output = response.choices[0].message.content
    parts = output.split("Action Items:")
    summary = parts[0].strip()
    action_items = parts[1].strip() if len(parts) > 1 else ""
    return summary, action_items
