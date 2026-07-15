import multer from "multer"
import type { NextFunction, Request, Response } from "express"
import { config } from "../config/env.js"
import type { AppError } from "../errors/app-error.js"

const allowedMime = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (allowedMime.has(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`))
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: config.maxFileSizeMb * 1024 * 1024,
    files: config.maxFiles,
  },
})

const toAppError = (message: string, statusCode: number, code?: string): AppError =>
  Object.assign(new Error(message), { statusCode, code })

export const uploadChatFiles = (req: Request, res: Response, next: NextFunction): void => {
  upload.array("files", config.maxFiles)(req, res, (err: unknown) => {
    if (!err) {
      next()
      return
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(
          toAppError(
            `Файл слишком большой. Максимальный размер — ${config.maxFileSizeMb} МБ.`,
            413,
            err.code,
          ),
        )
        return
      }
      if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
        next(
          toAppError(`Можно приложить не больше ${config.maxFiles} фото.`, 400, err.code),
        )
        return
      }
      next(toAppError("Не удалось загрузить файл.", 400, err.code))
      return
    }

    next(
      toAppError(
        "Неподдерживаемый формат фото. Загрузите JPEG, PNG, WEBP, GIF или AVIF.",
        400,
      ),
    )
  })
}
