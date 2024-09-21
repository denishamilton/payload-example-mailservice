// storage-adapter-import-placeholder
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import fs from 'fs'; // модуль для работы с файлами

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Функция для чтения HTML-файла
const loadEmailTemplate = (templateName: string): string => {
  const filePath = path.join(dirname, 'email/email-templates', `${templateName}.html`);
  return fs.readFileSync(filePath, 'utf-8');
};

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    // storage-adapter-placeholder
  ],
  email: nodemailerAdapter({
    defaultFromAddress: 'denys.gorozhanin@gmail.com', // Отправитель
    defaultFromName: 'Payload CMS', // Имя отправителя
    transportOptions: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com', // Хост SMTP
      port: parseInt(process.env.SMTP_PORT || '587'), // Порт SMTP
      secure: false, // Используем STARTTLS 
      auth: {
        user: process.env.GMAIL_USER, // Твой email
        pass: process.env.GMAIL_PASS, // Пароль приложения
      },
    },
  }),
  // Отправляем письмо при запуске сервера
  onInit: async (payload) => {
    console.log('Инициализация сервера началась');

    const emailRecipient = process.env.EMAIL_RECIPIENT;	// Тот email, куда будут отправляться письма

    try {

      // Чтение HTML шаблона
      const htmlContent = loadEmailTemplate('server-started');

      await payload.sendEmail({
        to: emailRecipient, // Тот email, куда будут отправляться письма
        subject: 'Server payload started', // Тема письма

        // text - если текст письма должен быть в текстовом формате
        // text: 'Server payload started - SUCCESS', // Текст письма
        
        // html - если текст письма должен быть в html формате 
        // html: `<!DOCTYPE html><html><body><div style="font-family: Arial, sans-serif; color: #333;">
        //   <h1 style="color: #4CAF50;">Server Payload Started</h1>
        //   <p>Здравствуйте,</p>
        //   <p>Ваш сервер <strong>Payload</strong> успешно запущен!</p>
        //   <p>Это письмо подтверждает, что всё работает как положено.</p>
        //   <hr/>
        //   <footer>
        //     <p style="font-size: 12px; color: #777;">С наилучшими пожеланиями, <br/> Ваша команда Payload CMS</p>
        //   </footer>
        // </div></body></html>`,

        html: htmlContent, // Используем содержимое шаблона
      });

      console.log(`Email успешно отправлен на ${emailRecipient}`);

      /*
      КАК ЭТО РАБОТАЕТ:
      - Email работает таким образом что предварительно был настроен gmail аккаунт для отправки писем.
      - Мы используем SMTP Gmail для отправки писем.

      пример настроек в .env

      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=587
      GMAIL_USER=YOUR_EMAIL
      GMAIL_PASS=YOUR_PASSWORD

      */
      
    } catch (error) {
      console.error('Ошибка отправки email:', error);
    }
  }
})
