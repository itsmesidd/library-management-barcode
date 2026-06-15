import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const fetchBooks = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/books"
      );

      const data = await response.json();

      setBooks(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      alert("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/scan-barcode",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.already_exists) {
        setMessage(
          `⚠ ${data.title} is already in your library`
        );
      } else {
        setMessage(
          `✅ Added: ${data.title}`
        );
      }

      await fetchBooks();

    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div className="container">
      <h1>📚 My Library Register</h1>

      <p>Upload a barcode image from the back of a book</p>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />

      <br />
      <br />

      <button onClick={uploadImage}>
        Scan Book
      </button>

      <p>{message}</p>

      {image && (
        <div>
          <h3>Selected Image</h3>

          <img
            src={image}
            alt="Book"
            className="preview-image"
          />
        </div>
      )}

      <hr />

      <h2>📚 Books in Library</h2>

      <ul className="book-list">
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong>
            <br />
            ISBN: {book.isbn}
            <br />
            Author: {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;