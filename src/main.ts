// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { join } from 'path';
// import { NestExpressApplication } from '@nestjs/platform-express';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);

//   app.enableCors(); // allow frontend to access backend

//   // Serve the 'uploads' folder statically
//   app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//     prefix: '/uploads/', // URLs starting with /uploads/ will serve files here
//   });

//   await app.listen(5000);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

   app.enableCors({
    origin: '*',
  }); // allow frontend to access backend

  // Serve the 'uploads' folder statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URLs starting with /uploads/ will serve files here
  });

  // Preserve raw body for Razorpay webhook verification
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf; // save raw request body as a Buffer
      },
    }),
  );

   await app.listen(5000, '0.0.0.0'); 
}
bootstrap();
