import { PartialType } from '@nestjs/mapped-types';
import { CreatePeopleDto } from './create-people.dto.js';

export class UpdatePeopleDto extends PartialType(CreatePeopleDto) {}
