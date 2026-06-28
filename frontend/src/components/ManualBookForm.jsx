function ManualBookForm({
  showModal,
  closeModal,
  formData,
  errors,
  handleChange,
  handleSubmit,
}) {
  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={closeModal}>
          ✕
        </button>

        <h2>Add Book Manually</h2>

        <form className="book-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Book Title *</label>

            <input
              type="text"
              name="title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
            />

            {errors.title && <small className="error">{errors.title}</small>}
          </div>

          <div className="form-group">
            <label>Author *</label>

            <input
              type="text"
              name="author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={handleChange}
              className={errors.author ? "input-error" : ""}
            />

            {errors.author && <small className="error">{errors.author}</small>}
          </div>

          <div className="form-group">
            <label>ISBN (Optional)</label>

            <input
              type="text"
              name="isbn"
              placeholder="Enter ISBN"
              value={formData.isbn}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={closeModal}>
              Cancel
            </button>

            <button type="submit" className="save-btn">
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManualBookForm;
