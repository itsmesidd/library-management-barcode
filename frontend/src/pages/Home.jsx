import BookCard from "../components/BookCard";
import ManualBookForm from "../components/ManualBookForm";
import ScanBarcodeModal from "../components/ScanBarcodeModal";
import { useEffect, useState } from "react";
import {
  getBooks,
  addBook,
  deleteBook,
  scanBarcode,
} from "../services/bookService";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { toast } from "react-toastify";

function Home() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
  });

  const [errors, setErrors] = useState({});

  const [showScanModal, setShowScanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);

  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      (book.isbn || "").includes(search),
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Book title is required.";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author name is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const response = await addBook({
      ...formData,
      isbn: formData.isbn.trim() || null,
    });

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    await fetchBooks();

    closeModal();
    toast.success(`${formData.title} added to your library.`);
  };

  const closeModal = () => {
    setShowModal(false);

    setFormData({
      title: "",
      author: "",
      isbn: "",
    });

    setErrors({});
  };

  const closeScanModal = () => {
    setShowScanModal(false);
  };

  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedBook(null);
  };

  const confirmDelete = async () => {
    await deleteBook(selectedBook.id);

    await fetchBooks();

    toast.success(`${selectedBook.title} removed from your library.`);
    closeDeleteModal();
  };

  const handleScan = async (e) => {
    setIsScanning(true);
    const file = e.target.files[0];

    if (!file) return;

    const response = await scanBarcode(file);

    if (!response.success) {
      setIsScanning(false);
      toast.error(response.message);
      return;
    }

    await fetchBooks();

    setIsScanning(false);
    closeScanModal();

    if (response.already_exists) {
      toast.info(`${response.title} is already in your library.`);
    } else {
      toast.success(`${response.title} added to your library.`);
    }

    e.target.value = "";
  };

  return (
    <main className="home-container">
      <section className="search-section">
        <input
          type="text"
          placeholder="🔍 Search your library..."
          className="home-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="library-info">
        <p>
          Total Books: <strong>{books.length}</strong>
        </p>
      </section>

      <section className="action-cards">
        <div
          className="action-card scan-card"
          onClick={() => setShowScanModal(true)}
        >
          <h1>📷</h1>
          <p>Scan Barcode</p>
        </div>

        <div
          className="action-card add-card"
          onClick={() => setShowModal(true)}
        >
          <h1>➕</h1>
          <p>Add Book Manually</p>
        </div>
      </section>

      <section className="books-section">
        <h2>Books in Your Collection</h2>

        <div className="books-grid">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onDelete={handleDeleteClick} />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="empty-search">
            <h3>Match Not Found!</h3>
            <p>You can add this book to your collection.</p>
          </div>
        )}
      </section>

      <ManualBookForm
        showModal={showModal}
        closeModal={closeModal}
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <ScanBarcodeModal
        showScanModal={showScanModal}
        closeScanModal={closeScanModal}
        handleScan={handleScan}
        isScanning={isScanning}
      />

      <DeleteConfirmModal
        showDeleteModal={showDeleteModal}
        closeDeleteModal={closeDeleteModal}
        confirmDelete={confirmDelete}
        selectedBook={selectedBook}
      />
    </main>
  );
}

export default Home;
