function DeleteConfirmModal({
  showDeleteModal,
  closeDeleteModal,
  confirmDelete,
  selectedBook,
}) {
  if (!showDeleteModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Delete Book</h2>

        <p className="delete-message">
          Are you sure you want to remove
          <br />
          <strong>"{selectedBook?.title}"</strong>
          <br />
          from your library?
        </p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={closeDeleteModal}>
            Cancel
          </button>

          <button className="delete-confirm-btn" onClick={confirmDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
