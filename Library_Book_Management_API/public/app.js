const connectionStatus = document.querySelector('#connection-status');
const noticeTitle = document.querySelector('#notice-title');
const noticeCopy = document.querySelector('#notice-copy');
const bookForm = document.querySelector('#book-form');
const bookList = document.querySelector('#book-list');
const bookCount = document.querySelector('#book-count');
const listResponse = document.querySelector('#list-response');
const createResponse = document.querySelector('#create-response');
const createStatus = document.querySelector('#create-status');
const invalidResponse = document.querySelector('#invalid-response');
const invalidStatus = document.querySelector('#invalid-status');
let toastTimer;

function showToast(message, isError = false) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = `toast${isError ? ' error' : ''}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.remove(), 3200);
}

async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return { data, status: response.status };
}

function renderBooks(books) {
  bookCount.textContent = String(books.length);
  if (books.length === 0) {
    bookList.innerHTML = '<tr><td class="empty-state" colspan="5"><span class="empty-icon" aria-hidden="true">▤</span><strong>Your collection is empty</strong><span>Add a book to see it here.</span></td></tr>';
    return;
  }

  bookList.replaceChildren(...books.map((book) => {
    const row = document.createElement('tr');
    const titleCell = document.createElement('td');
    const title = document.createElement('span');
    title.className = 'book-title';
    title.textContent = book.title;
    const author = document.createElement('span');
    author.className = 'book-author';
    author.textContent = book.author;
    titleCell.append(title, author);

    const categoryCell = document.createElement('td');
    categoryCell.textContent = book.category || 'Uncategorized';
    const priceCell = document.createElement('td');
    priceCell.textContent = typeof book.price === 'number' ? `$${book.price.toFixed(2)}` : '—';
    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = `availability-tag${book.isAvailable ? '' : ' unavailable'}`;
    status.textContent = book.isAvailable ? 'Available' : 'On loan';
    statusCell.append(status);

    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.title = `Delete ${book.title}`;
    deleteButton.setAttribute('aria-label', `Delete ${book.title}`);
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => deleteBook(book._id, book.title));
    actionCell.append(deleteButton);

    row.append(titleCell, categoryCell, priceCell, statusCell, actionCell);
    return row;
  }));
}

async function loadBooks() {
  const refreshButton = document.querySelector('#refresh-button');
  refreshButton.classList.add('is-loading');
  try {
    const [{ data }, health] = await Promise.all([
      request('/books'),
      request('/health')
    ]);
    const books = data.books || [];
    renderBooks(books);
    listResponse.textContent = JSON.stringify(data, null, 2);
    connectionStatus.classList.remove('is-offline');
    connectionStatus.classList.add('is-online');
    connectionStatus.lastElementChild.textContent = health.data.status === 'ok' ? 'API connected' : 'API online';
    noticeTitle.textContent = 'API connected';
    noticeCopy.textContent = `${books.length} ${books.length === 1 ? 'book' : 'books'} loaded from your MongoDB collection.`;
  } catch (error) {
    connectionStatus.classList.remove('is-online');
    connectionStatus.classList.add('is-offline');
    connectionStatus.lastElementChild.textContent = 'API offline';
    noticeTitle.textContent = 'Could not load the library';
    noticeCopy.textContent = error.message;
    listResponse.textContent = JSON.stringify(error.data || { message: error.message }, null, 2);
    showToast(error.message, true);
  } finally {
    refreshButton.classList.remove('is-loading');
  }
}

async function deleteBook(id, title) {
  if (!window.confirm(`Delete “${title}” from the library?`)) return;
  try {
    const result = await request(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' });
    listResponse.textContent = JSON.stringify(result.data, null, 2);
    showToast(`“${title}” was deleted.`);
    await loadBooks();
  } catch (error) {
    showToast(error.message, true);
  }
}

bookForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!bookForm.reportValidity()) return;
  const submitButton = bookForm.querySelector('button[type="submit"]');
  const formData = new FormData(bookForm);
  const payload = {
    title: formData.get('title').trim(),
    author: formData.get('author').trim(),
    category: formData.get('category').trim(),
    isAvailable: formData.get('isAvailable') === 'on'
  };
  const price = formData.get('price');
  if (price) payload.price = Number(price);

  submitButton.classList.add('is-loading');
  submitButton.disabled = true;
  try {
    const result = await request('/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    createResponse.textContent = JSON.stringify(result.data, null, 2);
    createStatus.className = 'status-pill status-ok';
    createStatus.textContent = String(result.status);
    bookForm.reset();
    document.querySelector('#isAvailable').checked = true;
    showToast('Book added to the library.');
    await loadBooks();
  } catch (error) {
    createResponse.textContent = JSON.stringify(error.data || { message: error.message }, null, 2);
    createStatus.className = 'status-pill status-bad';
    createStatus.textContent = String(error.status || 'Error');
    showToast(error.message, true);
  } finally {
    submitButton.classList.remove('is-loading');
    submitButton.disabled = false;
  }
});

document.querySelector('#refresh-button').addEventListener('click', loadBooks);
document.querySelector('#invalid-id-button').addEventListener('click', async () => {
  try {
    await request('/books/invalid-id');
  } catch (error) {
    invalidResponse.textContent = JSON.stringify(error.data || { message: error.message }, null, 2);
    invalidStatus.className = `status-pill ${error.status === 400 ? 'status-bad' : 'status-idle'}`;
    invalidStatus.textContent = String(error.status || 'Error');
    if (error.status !== 400) showToast(error.message, true);
  }
});

loadBooks();