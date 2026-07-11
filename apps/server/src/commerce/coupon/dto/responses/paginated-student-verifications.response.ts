import { ApiProperty } from "@nestjs/swagger";
import { StudentVerificationResponseDto } from "./student-verification.response";

export class PaginatedStudentVerificationsResponseDto {
	@ApiProperty({ type: [StudentVerificationResponseDto] })
	data!: StudentVerificationResponseDto[];

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;

	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 3 })
	totalPages!: number;
}
