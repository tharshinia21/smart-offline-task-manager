import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: true, credentials: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.setGlobalPrefix('api')
  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`✅ Smart Tasks API (MongoDB) listening on http://localhost:${port}/api`)
}
bootstrap()
