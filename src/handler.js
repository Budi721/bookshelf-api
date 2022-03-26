const { nanoid } = require('nanoid');
const books = require('./books');

const validateBookRequest = (book, h, message) => {
  if (!Object.prototype.hasOwnProperty.call(book, 'name')) {
    const response = h.response({
      status: 'fail',
      message: `Gagal ${message} buku. Mohon isi nama buku`,
    });
    response.code(400);
    return response;
  }

  if (book.readPage > book.pageCount) {
    const response = h.response({
      status: 'fail',
      message: `Gagal ${message} buku. readPage tidak boleh lebih besar dari pageCount`,
    });
    response.code(400);
    return response;
  }

  return null;
};

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  let response = validateBookRequest(request.payload, h, 'menambahkan');
  if (response !== null) {
    return response;
  }

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };
  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });

    response.code(201);
    return response;
  }

  response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request) => {
  let clonedBooks = books;
  const { name, reading, finished } = request.query;
  if (name !== undefined) {
    clonedBooks = clonedBooks.filter((book) => book.name.toLowerCase()
      .includes(name.toLowerCase()));
  } else if (reading !== undefined) {
    if (reading === '1') {
      clonedBooks = clonedBooks.filter((book) => book.reading === true);
    } else {
      clonedBooks = clonedBooks.filter((book) => book.reading === false);
    }
  } else if (finished !== undefined) {
    if (finished === '1') {
      clonedBooks = clonedBooks.filter((book) => book.finished === true);
    } else {
      clonedBooks = clonedBooks.filter((book) => book.finished === false);
    }
  }

  return ({
    status: 'success',
    data: {
      books: clonedBooks.map((b) => ({ id: b.id, name: b.name, publisher: b.publisher })),
    },
  });
};

const getDetailBookHandler = (request, h) => {
  const { id } = request.params;
  const book = books.filter((b) => b.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const updateBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const { id } = request.params;

  let response = validateBookRequest(request.payload, h, 'memperbarui');
  if (response !== null) {
    return response;
  }

  const index = books.findIndex((b) => b.id === id);
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    };

    response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler, getAllBooksHandler, getDetailBookHandler, updateBookHandler, deleteBookHandler,
};
