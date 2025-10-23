import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // ✅ import ConfigModule

import { TeacherPackage } from './teacher-packages/teacher-package.entity';
import { TeacherPackagesModule } from './teacher-packages/teacher-packages.module';
import { PackagePointsModule } from './package-points/package-points.module';
import { PackagePoint } from './package-points/package-point.entity';
import { PackagePricing } from './package_pricing/package-pricing.entity';
import { PackagePricingModule } from './package_pricing/package-pricing.module';
import { PackagePricingSettings } from './package_pricing_settings/package-pricing-settings.entity';
import { PackagePricingSettingsModule } from './package_pricing_settings/package-pricing-settings.module';
import { User } from './users/entities/user.entity';
import { UserRole } from './users/entities/user-role.entity';
import { Role } from './users/entities/role.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TwilioModule } from './twilio/twilio.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { PaymentRequests } from './payment-requests/entities/payment-request.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ makes ConfigService available in all modules
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres', // replace with your pgAdmin password
      database: 'LMS', // your DB name
      entities: [
        TeacherPackage,
        PackagePoint,
        PackagePricing,
        PackagePricingSettings,
        User,
        UserRole,
        Role,
        PaymentRequests,
      ],
      synchronize: true, // auto create tables (disable in production)
    }),
    TeacherPackagesModule,
    PackagePointsModule,
    PackagePricingModule,
    PackagePricingSettingsModule,
    AuthModule,
    UsersModule,
    TwilioModule,
    PaymentRequestsModule,
  ],
})
export class AppModule {}


















// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { TeacherPackage } from './teacher-packages/teacher-package.entity';
// import { TeacherPackagesModule } from './teacher-packages/teacher-packages.module';
// import { PackagePointsModule } from './package-points/package-points.module';
// import { PackagePoint } from './package-points/package-point.entity';
// import { PackagePricing } from './package_pricing/package-pricing.entity';
// import { PackagePricingModule } from './package_pricing/package-pricing.module';
// import { PackagePricingSettings } from './package_pricing_settings/package-pricing-settings.entity';
// import { PackagePricingSettingsModule } from './package_pricing_settings/package-pricing-settings.module';
// import { User } from './users/entities/user.entity';
// import { UserRole } from './users/entities/user-role.entity';
// import { Role } from './users/entities/role.entity';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { Twilio } from 'twilio';
// import { TwilioModule } from './twilio/twilio.module';





// @Module({
//   imports: [
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: 'localhost',
//       port: 5432,
//       username: 'postgres',
//       password: 'postgres', // replace with your pgAdmin password
//       database: 'LMS', // your DB name
//       entities: [TeacherPackage,PackagePoint,PackagePricing,PackagePricingSettings,User,UserRole,Role],
//       synchronize: true, // auto create tables (disable in production)
//     }),
//     TeacherPackagesModule,
//     PackagePointsModule,
//     PackagePricingModule,
//     PackagePricingSettingsModule,
//     AuthModule,
//     UsersModule,
//     TwilioModule,
//   ],
// })
// export class AppModule {}
// // PackagePoint, PackagePricing, PackagePricingSetting