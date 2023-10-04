const Hapi = require('@hapi/hapi'); // Mengimpor modul Hapi sebagai framework
const { nanoid } = require('nanoid'); // Mengimpor modul nanoid untuk membuat ID unik

const books = []; // Variabel untuk menyimpan data buku

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 9000, // Mengatur port server menggunakan nilai dari environment variable PORT atau default 9000
    host: 'localhost', // Mengatur host server menjadi localhost
  });

  // Kriteria Submission akan ditambahkan di sini

// Kriteria 3 : API dapat menyimpan buku
  const addBookHandler = (request, h) => {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading
    } = request.payload;

    // Respon Server apabila gagal:
    if (!name) {
      return h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      }).code(400);
    }

    // Periksa apakah readPage lebih besar dari pageCount
    if (readPage > pageCount) {
      return h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      }).code(400);
    }

    // Hasilkan ID unik menggunakan nanoid
    const id = nanoid();

    // Hitung status selesai berdasarkan readPage dan pageCount
    const finished = readPage === pageCount;

    // Dapatkan tanggal dan waktu saat ini
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    // Buat objek buku baru
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

    // Tambahkan buku baru ke susunan buku [Array]
    books.push(newBook);

    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    }).code(201);
  };

  // Rute untuk menyimpan buku
  server.route({
    method: 'POST',
    path: '/books',
    handler: addBookHandler,
  });

// ...

// ...

// Kriteria 4 : API dapat menampilkan seluruh buku
server.route({
  method: 'GET',
  path: '/books',
  handler: (request, h) => {
    const { name, reading, finished } = request.query;

    // Filter berdasarkan query parameter "name", "reading", dan "finished"
    let filteredBooks = books;

    if (name) {
      filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
    }

    if (reading !== undefined) {
      const isReading = reading === '1';
      filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
    }

    if (finished !== undefined) {
      const isFinished = finished === '1';
      filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
    }

    // Jika tidak ada query parameter "name", "reading", dan "finished", tampilkan seluruh buku tanpa filter
    if (!name && reading === undefined && finished === undefined) {
      return {
        status: 'success',
        data: {
          books: filteredBooks.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      };
    }

    // Jika terdapat query parameter "name", "reading", atau "finished", tampilkan hasil pencarian
    return {
      status: 'success',
      data: {
        books: filteredBooks.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    };
  },
});

// ...



  // Kriteria 5 : API dapat menampilkan detail buku
  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const book = books.find((b) => b.id === bookId);

      if (!book) {
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan',
        }).code(404);
      }

      return {
        status: 'success',
        data: {
          book,
        },
      };
    },
  });

  // Kriteria 6 : API dapat mengubah data buku
  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
      const bookIndex = books.findIndex((b) => b.id === bookId);

      if (bookIndex === -1) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
      }

      if (!name) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);
      }

      if (readPage > pageCount) {
        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);
      }

      const finished = pageCount === readPage;
      const updatedAt = new Date().toISOString();

      // Mengupdate data buku
      books[bookIndex] = {
        ...books[bookIndex],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        updatedAt,
      };

      return {
        status: 'success',
        message: 'Buku berhasil diperbarui',
      };
    },
  });

  // Kriteria 7 : API dapat menghapus buku
  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
      const { bookId } = request.params;
      const bookIndex = books.findIndex((b) => b.id === bookId);

      if (bookIndex === -1) {
        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
      }

      // Menghapus buku dari array books
      books.splice(bookIndex, 1);

      return {
        status: 'success',
        message: 'Buku berhasil dihapus',
      };
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
