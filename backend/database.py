import sqlite3
import os
DB_PATH = os.getenv("DATABASE_URL", "library.db")

def create_database():
    conn = sqlite3.connect(DB_PATH, timeout=10)

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            isbn TEXT UNIQUE,
            title TEXT NOT NULL,
            author TEXT,
            image_path TEXT,
            date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

    print("Database created successfully!")


def save_book(isbn, title, author, image_path):
    conn = sqlite3.connect(DB_PATH, timeout=10)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR IGNORE INTO books
        (isbn, title, author, image_path)
        VALUES (?, ?, ?, ?)
    """, (isbn, title, author, image_path))

    conn.commit()
    conn.close()

def add_book(isbn, title, author):
    conn = sqlite3.connect(DB_PATH, timeout=10)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO books
        (isbn, title, author)
        VALUES (?, ?, ?)
    """, (isbn, title, author))

    conn.commit()

    conn.close()


def get_books():
    conn = sqlite3.connect(DB_PATH, timeout=10)

    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, isbn, title, author
        FROM books
        ORDER BY date_added DESC
    """)

    books = cursor.fetchall()

    conn.close()

    return books

def delete_book(book_id):
    conn = sqlite3.connect(DB_PATH, timeout=10)

    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM books WHERE id = ?",
        (book_id,)
    )

    conn.commit()

    conn.close()

def book_exists(isbn):
    conn = sqlite3.connect(DB_PATH, timeout=10)

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM books WHERE isbn = ?",
        (isbn,)
    )

    book = cursor.fetchone()

    conn.close()

    return book is not None

if __name__ == "__main__":
    create_database()

def get_book_by_isbn(isbn):
    conn = sqlite3.connect(DB_PATH, timeout=10)

    cursor = conn.cursor()

    cursor.execute("""
        SELECT title, author
        FROM books
        WHERE isbn = ?
    """, (isbn,))

    book = cursor.fetchone()

    conn.close()

    return book