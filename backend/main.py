import zxingcpp
from PIL import Image
import requests
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from database import (
    create_database,
    save_book,
    add_book,
    delete_book,
    get_books as get_library_books,
    book_exists,
    get_book_by_isbn,
)
from pydantic import BaseModel
from dotenv import load_dotenv



def get_openlibrary_book(isbn):
    url = f"https://openlibrary.org/isbn/{isbn}.json"

    try:
        response = requests.get(url, timeout=5)

        if response.status_code != 200:
            return None

        return response.json()

    except requests.RequestException:
        return None


def get_author_name(author_key):
    url = f"https://openlibrary.org{author_key}.json"

    try:
        response = requests.get(url, timeout=5)

        if response.status_code != 200:
            return "Unknown Author"

        data = response.json()

        return data.get("name", "Unknown Author")

    except requests.RequestException:
        return "Unknown Author"
    
def get_google_book(isbn):
    url = (
        "https://www.googleapis.com/books/v1/volumes"
        f"?q=isbn:{isbn}&key={GOOGLE_BOOKS_API_KEY}"
    )

    try:
        response = requests.get(url, timeout=5)

        if response.status_code != 200:
            print("Google API Error:", response.text)
            return None

        data = response.json()

        if data.get("totalItems", 0) == 0:
            return None

        info = data["items"][0]["volumeInfo"]

        return {
            "title": info.get("title", "Unknown Title"),
            "author": ", ".join(
                info.get("authors", ["Unknown Author"])
            )
        }

    except Exception as e:
        print("Google Books Error:", e)
        return None

class Book(BaseModel):
    title: str
    author: str
    isbn: str | None = None

def to_title_case(text):
    return " ".join(word.capitalize() for word in text.split())

load_dotenv()

GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

app = FastAPI()

create_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://library-management-barcode.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/books")
def books():
    books = get_library_books()

    return [
        {
            "id": book[0],
            "isbn": book[1],
            "title": book[2],
            "author": book[3]
        }
        for book in books
    ]

@app.post("/books")
def create_book(book: Book):

    if book.isbn and book_exists(book.isbn):
        return {
            "success": False,
            "message": "Book already exists."
        }

    title = to_title_case(book.title.strip())

    author = to_title_case(book.author.strip())

    add_book(
        book.isbn,
        title,
        author
    )

    return {
        "success": True,
        "message": "Book added successfully."
    }

@app.delete("/books/{book_id}")
def remove_book(book_id: int):

    delete_book(book_id)

    return {
        "success": True,
        "message": "Book deleted successfully."
    }

@app.post("/scan-barcode")
async def scan_barcode(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join(
        "uploads",
        file.filename
    )

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    try:
        with Image.open(file_path) as image:
            results = zxingcpp.read_barcodes(image)

        if not results:
            return {
                "success": False,
                "message": "No barcode found. Please take a clearer photo."
            }

        isbn = results[0].text.strip()

        if book_exists(isbn):

            stored_book = get_book_by_isbn(isbn)

            return {
                "success": True,
                "already_exists": True,
                "isbn": isbn,
                "title": stored_book[0],
                "author": stored_book[1],
            }

        # -----------------------------
        # Google Books (Primary)
        # -----------------------------
        book = get_google_book(isbn)

        if book:
            title = book["title"]
            author = book["author"]

        else:
            # -----------------------------
            # OpenLibrary (Fallback)
            # -----------------------------
            book = get_openlibrary_book(isbn)

            if not book:
                return {
                    "success": False,
                    "message": "Book details couldn't be retrieved. Please add the book manually."
                }

            title = book.get(
                "title",
                "Unknown Title"
            )

            author = "Unknown Author"

            if (
                "authors" in book
                and len(book["authors"]) > 0
            ):
                author_key = book["authors"][0]["key"]

                author = get_author_name(author_key)

        save_book(
            isbn,
            title,
            author,
            file_path,
        )

        return {
            "success": True,
            "already_exists": False,
            "isbn": isbn,
            "title": title,
            "author": author,
        }

    except Exception as e:
        print("Scanner Error:", e)

        return {
            "success": False,
            "message": "Something went wrong while scanning the book. Please try again."
        }