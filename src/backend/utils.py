import json
import os
import random
import string
from typing import Optional

import requests
from openai import OpenAI

SAVE_TO_PATH = "/tmp/episodes/"

client = OpenAI()


def generate_rand_string(k: int = 7) -> str:
    return "".join(random.choices(string.ascii_letters, k=k))


def get_access_token(path: str) -> str:
    with open(path, "r") as file:
        config = json.load(file)

    return config.get("access_token")


def download_mp3(url: str, filename: str) -> Optional[str]:
    if os.path.exists(filename):
        return os.path.abspath(filename)

    response = requests.get(url)
    if response.status_code == 200:
        full_path = os.path.join(SAVE_TO_PATH, filename) + ".mp3"
        with open(full_path, "wb") as file:
            file.write(response.content)
        return full_path
    else:
        return None


def transcribe(file_path: str) -> str:
    with open(file_path, "rb") as f:
        transcription = client.audio.transcriptions.create(model="whisper-1", file=f)
    return transcription.text


def download_and_transcribe(url: str) -> str:
    path = download_mp3(url, generate_rand_string())
    return transcribe(path)


def summarize_podcast_transcription(transcription) -> Optional[str]:
    prompt = f"""
    You are an assistant that is receiving podcast example transcription and summarize what the larger topic of the episodes are, 
    what the host is talking about, and what is the general topic of the episode. 
    Translate your answer to hebrew, as the transcription is also in Hebrew.
    
    The transcription:
    {transcription}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=[
                {"role": "system", "content": prompt},
            ],
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Error: {e}")
        return None
