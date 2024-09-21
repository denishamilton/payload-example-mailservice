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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
    defaultFromAddress: 'info@payloadcms.com',
    defaultFromName: 'Payload CMS',
  }),
  // Отправляем письмо при запуске сервера
  onInit: async (payload) => {
    console.log('Инициализация сервера началась');
    try {
      await payload.sendEmail({
        to: 'qhookienar5ywf5u@ethereal.email',
        subject: 'Server payload started',
        text: 'Server payload started - SUCCESS',
      });
      console.log('Email успешно отправлен на тестовый аккаунт Ethereal.');
      
    } catch (error) {
      console.error('Ошибка отправки email:', error);
    }
  }
})
