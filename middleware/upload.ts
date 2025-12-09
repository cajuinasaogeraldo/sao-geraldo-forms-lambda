import multer from 'multer';

// Armazena na memória (buffer), não em disco
const storage = multer.memoryStorage();

export const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024, //5MB
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png'];

		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error('Tipo de arquivo não permitido'));
		}
	},
});
