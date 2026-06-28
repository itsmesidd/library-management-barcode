import { FaTrash } from "react-icons/fa";

function BookCard({ book, onDelete }) {
  return (
    <div className="book-card">
      <div className="card-header">
        <h3>{book.title}</h3>

        <FaTrash className="delete-icon" onClick={() => onDelete(book)} />
      </div>

      <div className="book-details">
        <p>
          <strong>Author:</strong> {book.author}
        </p>

        <p>
          <strong>ISBN:</strong> {book.isbn || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default BookCard;
