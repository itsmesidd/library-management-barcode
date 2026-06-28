const BASE_URL = "http://127.0.0.1:8000";

export async function getBooks() {
  const response = await fetch(`${BASE_URL}/books`);

  if (!response.ok) {
    throw new Error("Failed to fetch books.");
  }

  return response.json();
}

export async function addBook(book) {
  const response = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });

  return response.json();
}

export async function deleteBook(bookId) {
  const response = await fetch(`${BASE_URL}/books/${bookId}`, {
    method: "DELETE",
  });

  return response.json();
}

export async function scanBarcode(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/scan-barcode`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}
