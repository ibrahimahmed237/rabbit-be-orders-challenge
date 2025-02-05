import { IsArray, IsNumber, IsOptional } from "class-validator";

export class GetAllProductsDTO {
  @IsOptional()
  @IsArray()
  categories?: string[];
  
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}