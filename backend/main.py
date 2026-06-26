from pyzbar.pyzbar import decode
from PIL import Image
import requests
import os
import easyocr
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from database import save_book, get_books as get_library_books, book_exists


def get_book_by_isbn(isbn):
    url = f"https://openlibrary.org/isbn/{isbn}.json"

    response = requests.get(url)

    if response.status_code != 200:
        return None

    return response.json()


def get_author_name(author_key):
    url = f"https://openlibrary.org{author_key}.json"

    response = requests.get(url)

    if response.status_code != 200:
        return "Unknown Author"

    data = response.json()

    return data.get("name", "Unknown Author")


app = FastAPI()

reader = easyocr.Reader(['en'])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/library")
def library():
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


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    results = reader.readtext(
        file_path,
        paragraph=True
    )

    extracted_text = " ".join(
        [result[1] for result in results]
    )

    return {
        "filename": file.filename,
        "text": extracted_text
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

    image = Image.open(file_path)

    barcodes = decode(image)

    if not barcodes:
        return {
            "success": False,
            "message": "No barcode found"
        }

    isbn = barcodes[0].data.decode("utf-8")

    book = get_book_by_isbn(isbn)

    if not book:
        return {
            "success": False,
            "message": "Book not found"
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

    print("AUTHOR FOUND:", author)

    if book_exists(isbn):
        return {
            "success": True,
            "already_exists": True,
            "isbn": isbn,
            "title": title,
            "author": author
        }

    save_book(
        isbn,
        title,
        author,
        file_path
    )

    return {
        "success": True,
        "already_exists": False,
        "isbn": isbn,
        "title": title,
        "author": author
    }