import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  Min,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsString()
  @Length(32, 512)
  JWT_AT_SECRET: string;

  @IsString()
  @Length(32, 512)
  JWT_RT_SECRET: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  JWT_AT_EXPIRES_IN: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  JWT_RT_EXPIRES_IN: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(10)
  @Max(12)
  BCRYPT_SALT_ROUNDS: number;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  THROTTLE_TTL: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    exposeDefaultValues: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const details = errors
      .map(
        (e) =>
          `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
      )
      .join('; ');
    throw new Error(`Environment validation failed: ${details}`);
  }

  return validated;
}